# Omkleuren van een goedgekeurd basisplaatje (klassiek) naar de andere pakken, zodat elk pak precies dezelfde figuur is.
# Zachte weging in plaats van harde drempels, en vaste beschermmaskers (gezicht, handschoenen, laarzen, riem, portofoon, K-logo).
# Super-Kick: blauw shirt/broek/kousen/helm/schoenen -> pakkleur, witte rand -> accent; huid, gezicht en K-logo blijven.
# Agent Vroem: zwart uniform -> uniformkleur, gele strepen -> accent; huid, vizier, ster, handschoenen, laarzen, riem en portofoon blijven.
#
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\herkleur2.py <spin|ijzer> <basis.webp> <uitmap> [pak ...]
#   -> <uitmap>/held-<spin|ijzer>-<pak>-<naam>.webp (lossless; naam = het deel achter 'klassiek-' van de basis)
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def hsv(rgb: np.ndarray) -> np.ndarray:
    return np.asarray(Image.fromarray(rgb.astype(np.uint8)).convert("HSV"), dtype=np.float32)


def rgb_van(hsv_arr: np.ndarray) -> np.ndarray:
    return np.asarray(Image.fromarray(np.clip(hsv_arr, 0, 255).astype(np.uint8), "HSV").convert("RGB"), dtype=np.float32)


def zacht(x: np.ndarray, straal: float) -> np.ndarray:
    return np.asarray(Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(straal)),
                      dtype=np.float32) / 255


def venster(x, lo, hi, rand):
    """1 binnen [lo, hi], zacht aflopend over 'rand' erbuiten."""
    return np.clip(np.minimum((x - (lo - rand)) / rand, ((hi + rand) - x) / rand), 0, 1)


def vak(h, w, x0, y0, x1, y1, straal=3):
    m = np.zeros((h, w), dtype=np.float32)
    m[y0:y1, x0:x1] = 1
    return zacht(m, straal)


# --- Super-Kick: tint (PIL 0-255), verzadiging-factor, gamma voor helderheid, helderheid-offset, contrast, helderheid-factor,
#     accent-RGB of None, vizierkleur-RGB of None, kousen_wit
SPIN = {
    "nacht": (150, 0.28, 1.0, 0.0, 1.0, 0.30, (50, 90, 190), (22, 22, 28), False),
    "jungle": (86, 1.05, 1.0, 0.0, 1.0, 0.85, (140, 235, 50), (205, 210, 210), False),
    "goud": (33, 1.00, 0.62, 0.0, 1.5, 1.15, None, (250, 205, 70), False),
    "ijs": (138, 0.55, 1.0, 0.62, 1.0, 0.45, None, (240, 246, 252), True),
    "galaxy": (190, 1.05, 1.0, 0.0, 1.0, 0.62, (255, 120, 200), (150, 70, 200), False),
    "vuur": (14, 1.10, 1.0, 0.0, 1.0, 1.0, (225, 35, 35), (255, 150, 40), False),
}
# --- Agent Vroem: uniformkleur RGB of None, strepen RGB
IJZER = {
    "zilver": ((150, 155, 165), (40, 110, 230)),
    "stealth": ((40, 42, 46), (80, 82, 88)),
    "ruimte": ((25, 40, 95), (240, 240, 245)),
    "goud": (None, (250, 205, 70)),
    "neon": ((70, 35, 115), (35, 215, 235)),
    "lava": ((120, 20, 20), (255, 140, 30)),
}


# Plekken (deel van breedte/hoogte) die bij basis B horen; een ander plaatje (andere houding of formaat) geeft ze mee via
# HERKLEUR_GEO='{"gezicht":[x0,y0,x1,y1],"viz":[...],"logo_rij":0.9,"enkel":[a,b],"wit_rij":[a,b],"nek":false}'
GEO = {"gezicht": [0.40, 0.12, 0.60, 0.17], "viz": [0.31, 0.063, 0.705, 0.120], "logo_rij": 0.90, "enkel": [0.855, 0.905],
       "wit_rij": [0.14, 0.66], "nek": True,
       "v2": False, "neus": [0.40, 0.085, 0.52, 0.125], "geen_blauw": [], "zoom_rij": [0.0, 0.0]}
GEO.update(json.loads(os.environ.get("HERKLEUR_GEO", "{}")))


def spin_pak(rgba: np.ndarray, pak: str) -> np.ndarray:
    tint, sat_f, gamma, val_o, contrast, val_f, accent, klep, kousen_wit = SPIN[pak]
    rgb, alfa = rgba[..., :3], rgba[..., 3:]
    h, w = rgb.shape[:2]
    arr = hsv(rgb)
    H, S, V = arr[..., 0], arr[..., 1], arr[..., 2]
    rij = np.arange(h)[:, None] / h
    inner = zacht((alfa[..., 0] > 250).astype(np.float32), 0.8)  # alleen echt binnen het figuur (geen randspikkels)
    blauw = venster(H, 128, 165, 14) * np.clip((S - 35) / 40, 0, 1)
    huid = ((H < 40) | (H > 235)) * np.clip((S - 25) / 40, 0, 1)
    if GEO["v2"]:
        blauw = venster(H, 120, 180, 16) * np.clip((S - 35) / 40, 0, 1)
        huid = ((H < 40) | (H > 235)) * np.clip((S - 18) / 12, 0, 1)
    g0, g1, g2, g3 = GEO["gezicht"]
    gezicht = vak(h, w, int(g0 * w), int(g1 * h), int(g2 * w), int(g3 * h), 3)
    mond = gezicht  # mond en tanden: nooit meekleuren door de witte-rand-stap
    z0, z1, z2, z3 = GEO["viz"]
    viz_vak = vak(h, w, int(z0 * w), int(z1 * h), int(z2 * w), int(z3 * h), 1.5)  # vizier (vast masker)
    logo = (rij > GEO["logo_rij"]) * np.clip(np.maximum((110 - V) / 40, (70 - S) / 30), 0, 1)
    if GEO["v2"]:
        # vizier = spiegelgrijs/zwart in het vizierblok (niet de helm: die is sterk blauw); neus en huid blijven helemaal heel
        n0, n1, n2, n3 = GEO["neus"]
        neus = vak(h, w, int(n0 * w), int(n1 * h), int(n2 * w), int(n3 * h), 1.5)
        def dicht(m, n=9):  # gaatjes dichtmaken (sluiten): vizier als één stuk
            b = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8))
            return np.asarray(b.filter(ImageFilter.MaxFilter(n)).filter(ImageFilter.MinFilter(n)), dtype=np.float32) / 255
        def open_(m, n=5):  # losse spikkels weghalen
            b = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8))
            return np.asarray(b.filter(ImageFilter.MinFilter(n)).filter(ImageFilter.MaxFilter(n)), dtype=np.float32) / 255
        huid_groot = open_((((H < 40) | (H > 235)) * (S > 20)).astype(np.float32), 7)
        viz_vak = zacht(dicht(viz_vak * (S < 125)), 1.2) * (viz_vak > 0.02) * (1 - zacht(huid_groot, 1.0)) * (1 - neus)
        gezicht = gezicht * 0
        if GEO.get("neus_e"):  # glans op het neuspuntje: een ellips, nooit mee-gekleurd
            ex, ey, erx, ery = GEO["neus_e"]
            plaat = Image.new("L", (w, h), 0)
            ImageDraw.Draw(plaat).ellipse([((ex - erx) * w, (ey - ery) * h), ((ex + erx) * w, (ey + ery) * h)], fill=255)
            neus_e = zacht(np.asarray(plaat, dtype=np.float32) / 255, 1.0)
            huid = np.maximum(huid, neus_e)
            viz_vak = viz_vak * (1 - neus_e)
        geen = np.zeros((h, w), dtype=np.float32)
        for g0_, g1_, g2_, g3_ in GEO["geen_blauw"]:
            geen = np.maximum(geen, vak(h, w, int(g0_ * w), int(g1_ * h), int(g2_ * w), int(g3_ * h), 1.5))
        # rand van het figuur vlak naast de huid (blauwige achtergrondrand): niet meekleuren
        randvrij = np.asarray(Image.fromarray(((alfa[..., 0] > 250) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(7)), dtype=np.float32) / 255
        huid_nabij = np.asarray(Image.fromarray(((huid > 0.5) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(11)), dtype=np.float32) / 255
        geen = np.maximum(geen, (1 - randvrij) * huid_nabij * np.clip((115 - S) / 30, 0, 1))
        # donkere, blauwige randpixels (bv. tussen wang en oorstuk) gaan volledig mee, anders blijft er een gekartelde rand
        rand_blauw = (1 - randvrij) * venster(H, 120, 180, 16) * np.clip((S - 15) / 20, 0, 1) * (1 - huid) * (1 - geen)
        blauw = np.maximum(blauw, rand_blauw)
        huid = np.maximum(huid, geen)
    blauw = zacht(blauw * (1 - np.maximum(np.maximum(huid, gezicht), viz_vak)) * (1 - logo) * (alfa[..., 0] > 5), 0.7)
    v = V / 255
    v = np.clip((v - 0.5) * contrast + 0.5, 0, 1)
    v = np.clip(v ** gamma * val_f + val_o, 0, 1)
    nieuw = np.stack([np.full_like(H, tint), np.clip(S * sat_f, 0, 255), v * 255], axis=-1)
    gekleurd = rgb_van(nieuw)
    if kousen_wit:
        sokken = blauw * ((rij > 0.74) & (rij < GEO["logo_rij"]))
        wit = np.clip(np.array([235, 240, 248]) * (0.80 + 0.40 * V[..., None] / 255), 0, 255)
        gekleurd = gekleurd * (1 - sokken[..., None]) + wit * sokken[..., None]
    uit = rgb * (1 - blauw[..., None]) + gekleurd * blauw[..., None]
    # enkelstukken boven de schoen: wit (bij ijs sowieso), de lichtblauwe tint van het klassieke pak eruit
    enkel = zacht(((rij > GEO["enkel"][0]) & (rij < GEO["enkel"][1])) * np.clip((130 - S) / 30, 0, 1) * np.clip((V - 110) / 40, 0, 1) * inner, 0.7)
    wit_enkel = np.clip(np.array([238, 242, 250]) * (0.78 + 0.30 * V[..., None] / 255), 0, 255)
    uit = uit * (1 - enkel[..., None]) + wit_enkel * enkel[..., None]
    if accent is not None:
        wit_w = np.clip((V - 150) / 40, 0, 1) * np.clip((75 - S) / 30, 0, 1) * ((rij > GEO["wit_rij"][0]) & (rij < GEO["wit_rij"][1])) * inner
        if GEO["v2"] and GEO["zoom_rij"][1] > 0:
            zr = ((rij > GEO["zoom_rij"][0]) & (rij < GEO["zoom_rij"][1])) * np.clip((V - 110) / 30, 0, 1) * np.clip((95 - S) / 25, 0, 1) * inner
            wit_w = np.maximum(wit_w, zr)
        if GEO["v2"]:
            wit_w = wit_w * (1 - zacht(((((H < 40) | (H > 235)) * np.clip((S - 16) / 10, 0, 1))), 0.6))
        wit_w = zacht(wit_w, 0.7) * (1 - mond)
        kleur = np.array(accent, dtype=np.float32)[None, None, :] * (0.55 + 0.45 * V[..., None] / 255)
        uit = uit * (1 - wit_w[..., None]) + kleur * wit_w[..., None]
    if klep is not None:
        viz = viz_vak * (1 - huid)
        if GEO["v2"]:
            viz = viz_vak
        lum = (0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]) / 255
        doel = np.array(klep, dtype=np.float32)[None, None, :] * (0.40 + 0.75 * lum[..., None])
        uit = uit * (1 - 0.8 * viz[..., None]) + np.clip(doel, 0, 255) * 0.8 * viz[..., None]
    if pak == "galaxy":
        rng = np.random.default_rng(7)
        ster = zacht((rng.random((h, w)) < 0.004).astype(np.float32), 0.6)
        ster = np.clip(ster * 2.5, 0, 1) * (blauw > 0.9) * (rij > GEO["wit_rij"][0]) * inner
        uit = uit * (1 - ster[..., None]) + np.array([255, 235, 255]) * ster[..., None]
    # klein lichtblauw vlekje op de hals (rechts, vlak boven de kraag): huid van de kolom ernaast doortrekken
    y0, y1, x0, x1 = int(0.160 * h), int(0.186 * h), int(0.59 * w), int(0.68 * w)
    if GEO["nek"]:
        uit[y0:y1, x0:x1] = uit[y0:y1, x0 - 2: x0 - 1]
    return np.concatenate([np.clip(uit, 0, 255), alfa], axis=-1)


def ijzer_pak(rgba: np.ndarray, pak: str) -> np.ndarray:
    uniform, streep = IJZER[pak]
    rgb, alfa = rgba[..., :3], rgba[..., 3:]
    h, w = rgb.shape[:2]
    arr = hsv(rgb)
    H, S, V = arr[..., 0], arr[..., 1], arr[..., 2]
    rij = np.arange(h)[:, None] / h
    beschermd = np.zeros((h, w), dtype=np.float32)
    for x0, y0, x1, y1 in ((0, 0, w, int(0.215 * h)),                                      # helm, gezicht, vizier, ster
                           (int(0.35 * w), int(0.20 * h), int(0.65 * w), int(0.232 * h)),  # kin en hals (niet de kraag)
                           (int(0.50 * w), int(0.20 * h), int(0.72 * w), int(0.27 * h)),   # badge-ster
                           (0, int(0.482 * h), int(0.18 * w), int(0.58 * h)),             # linker handschoen
                           (int(0.86 * w), int(0.482 * h), w, int(0.58 * h)),             # rechter handschoen
                           (int(0.22 * w), int(0.485 * h), int(0.72 * w), int(0.515 * h)),  # riem + gesp
                           (int(0.22 * w), int(0.468 * h), int(0.40 * w), int(0.55 * h)),   # portofoon (onder de band)
                           (int(0.3395 * w), int(0.424 * h), int(0.3485 * w), int(0.462 * h)),  # antenne (strak: de gele band erachter kleurt mee)
                           (0, int(0.88 * h), w, h)):                                      # laarzen
        beschermd = np.maximum(beschermd, vak(h, w, x0, y0, x1, y1, 2.0))
    inner = zacht((alfa[..., 0] > 250).astype(np.float32), 0.8)
    huid2 = (H < 32) * np.clip((S - 30) / 30, 0, 1) * np.clip((V - 100) / 40, 0, 1)  # huid (hals tussen de kraag): nooit meekleuren
    geel = venster(H, 24, 56, 12) * np.clip((S - 30) / 30, 0, 1) * np.clip((V - 40) / 50, 0, 1) * (1 - huid2)
    # rond de portofoon-antenne zit een dun geel randje: daar lagere drempels
    lokaal = vak(h, w, int(0.30 * w), int(0.42 * h), int(0.395 * w), int(0.468 * h), 1.0) * venster(H, 18, 60, 16) * np.clip((S - 14) / 20, 0, 1) * np.clip((V - 75) / 40, 0, 1)
    geel = np.maximum(geel, lokaal * (1 - huid2))
    geel = zacht(geel, 0.6)
    donker = np.clip((95 - V) / 35, 0, 1) * np.clip((110 - S) / 40, 0, 1)
    donker = zacht(donker * (rij > 0.22) * (1 - geel) * np.clip((V - 18) / 25, 0, 1), 0.8)
    g = geel * (1 - beschermd)
    manchet = np.maximum(vak(h, w, 0, int(0.445 * h), int(0.20 * w), int(0.485 * h), 1.5), vak(h, w, int(0.82 * w), int(0.445 * h), w, int(0.485 * h), 1.5))
    donker = np.maximum(donker, manchet * np.clip((120 - V) / 30, 0, 1) * (1 - geel))  # pols/manchet strak in de uniformkleur
    d = donker * (1 - beschermd) * inner
    uit = rgb.copy()
    if streep is not None:
        kleur = np.clip(np.array(streep, dtype=np.float32)[None, None, :] * (V[..., None] / 255) * 1.05, 0, 255)
        uit = uit * (1 - g[..., None]) + kleur * g[..., None]
    if uniform is not None:
        licht = V[..., None] / 80
        kleur = np.clip(np.array(uniform, dtype=np.float32)[None, None, :] * (0.55 + 0.60 * np.clip(licht, 0, 1.3)), 0, 255)
        uit = uit * (1 - d[..., None]) + kleur * d[..., None]
    return np.concatenate([np.clip(uit, 0, 255), alfa], axis=-1)


def main():
    held, basis_pad, uitmap, *pakken = sys.argv[1:]
    basis = Image.open(basis_pad).convert("RGBA")
    rgba = np.asarray(basis, dtype=np.float32)
    alle = SPIN if held == "spin" else IJZER
    functie = spin_pak if held == "spin" else ijzer_pak
    naam = Path(basis_pad).stem.split("klassiek-", 1)[-1]
    uit = Path(uitmap)
    uit.mkdir(parents=True, exist_ok=True)
    for pak in pakken or list(alle):
        res = functie(rgba, pak)
        doel = uit / f"held-{held}-{pak}-{naam}.webp"
        Image.fromarray(res.round().astype(np.uint8), "RGBA").save(doel, lossless=True)
        print("klaar", doel.name)


if __name__ == "__main__":
    main()
