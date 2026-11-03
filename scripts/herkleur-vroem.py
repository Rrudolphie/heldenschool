# Pakken van het nieuwe Agent Vroem (zwart uniform, gele strepen, dichte zwarte helm) uit het goedgekeurde klassieke plaatje.
# Alleen de gele strepen (en het gele randje van het vizier) en het uniform veranderen van kleur; helm, vizier, handschoenen,
# riem en laarzen blijven zoals ze zijn. Zachte weging, geen harde drempels.
#
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\herkleur-vroem.py <klassiek-plaatje.webp> <uitmap> [pak ...]
#   -> <uitmap>/held-ijzer-<pak>-<naam>.webp (lossless; naam = het deel achter 'klassiek-')
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# pak: (uniformkleur RGB of None = zwart laten, streepkleur RGB of None = geel laten)
PAKKEN = {
    "zilver": ((120, 126, 138), (40, 110, 230)),
    "stealth": (None, (95, 98, 105)),
    "ruimte": ((25, 40, 95), (240, 240, 245)),
    "goud": ((196, 150, 42), (18, 18, 20)),
    "neon": ((70, 35, 115), (35, 215, 235)),
    "lava": ((120, 20, 20), (255, 140, 30)),
}
# plekken als deel van breedte/hoogte (x0, y0, x1, y1) die niet van uniformkleur veranderen
BESCHERMD = ((0, 0, 1, 0.215),            # helm, vizier, kin en hals
             (0, 0.505, 0.17, 0.62),      # linker handschoen
             (0.75, 0.505, 1, 0.62),      # rechter handschoen
             (0.20, 0.465, 0.80, 0.500),  # riem en gesp
             (0, 0.84, 1, 1))             # laarzen


# ander plaatje (andere houding): VROEM_GEO='[[x0,y0,x1,y1],...]' vervangt BESCHERMD
BESCHERMD = tuple(json.loads(os.environ.get("VROEM_GEO", "null")) or BESCHERMD)


def zacht(x, straal):
    return np.asarray(Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(straal)),
                      dtype=np.float32) / 255


def venster(x, lo, hi, rand):
    return np.clip(np.minimum((x - (lo - rand)) / rand, ((hi + rand) - x) / rand), 0, 1)


def pak(rgba, uniform, streep):
    rgb, alfa = rgba[..., :3], rgba[..., 3:]
    h, w = rgb.shape[:2]
    hsv = np.asarray(Image.fromarray(rgb.astype(np.uint8)).convert("HSV"), dtype=np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    inner = zacht((alfa[..., 0] > 250).astype(np.float32), 0.8)
    geel = zacht(venster(H, 24, 56, 12) * np.clip((S - 60) / 50, 0, 1) * np.clip((V - 50) / 50, 0, 1), 0.6)
    bes = np.zeros((h, w), dtype=np.float32)
    for vorm in BESCHERMD:
        if isinstance(vorm, dict) and "p" in vorm:  # {"p": veelhoek, "groei": px}: veelhoek, ruimer gemaakt
            plaat = Image.new("L", (w, h), 0)
            ImageDraw.Draw(plaat).polygon([(px * w, py * h) for px, py in vorm["p"]], fill=255)
            g = 2 * int(vorm.get("groei", 0)) + 1
            m = np.asarray(plaat.filter(ImageFilter.MaxFilter(g)) if g > 1 else plaat, dtype=np.float32) / 255
        elif isinstance(vorm, dict):  # {"donker": veelhoek}: alleen de donkere, kleurloze pixels (handschoen) binnen een ruime veelhoek
            plaat = Image.new("L", (w, h), 0)
            ImageDraw.Draw(plaat).polygon([(px * w, py * h) for px, py in vorm["donker"]], fill=255)
            ruim = np.asarray(plaat.filter(ImageFilter.MaxFilter(25)), dtype=np.float32) / 255
            zwart = ruim * (V < 60) * (S < 80)
            zwart = Image.fromarray((zwart * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(5))
            m = np.asarray(zwart, dtype=np.float32) / 255
        elif isinstance(vorm[0], (list, tuple)):  # veelhoek (punten als deel van breedte/hoogte): volgt de vorm van het lichaam
            plaat = Image.new("L", (w, h), 0)
            ImageDraw.Draw(plaat).polygon([(px * w, py * h) for px, py in vorm], fill=255)
            m = np.asarray(plaat, dtype=np.float32) / 255
        elif len(vorm) == 5:  # ellips: (cx, cy, rx, ry, "e")
            cx, cy, rx, ry, _ = vorm
            plaat = Image.new("L", (w, h), 0)
            ImageDraw.Draw(plaat).ellipse([((cx - rx) * w, (cy - ry) * h), ((cx + rx) * w, (cy + ry) * h)], fill=255)
            m = np.asarray(plaat, dtype=np.float32) / 255
        else:
            x0, y0, x1, y1 = vorm
            m = np.zeros((h, w), dtype=np.float32)
            m[int(y0 * h): int(y1 * h), int(x0 * w): int(x1 * w)] = 1
        bes = np.maximum(bes, zacht(m, vorm.get("zacht", 1.5) if isinstance(vorm, dict) else 1.5))
    uit = rgb.copy()
    if streep is not None:
        # gele randje van het vizier (olijfgeel, weinig verzadigd) krijgt ook de streepkleur
        kop = np.zeros((h, w), dtype=np.float32)
        rx0, rx1 = json.loads(os.environ.get("VROEM_RIM", "[0.27, 0.73]"))
        kop[: int(0.2 * h), int(rx0 * w): int(rx1 * w)] = 1
        rand = zacht(kop * venster(H, 20, 60, 14) * np.clip((S - 30) / 30, 0, 1) * np.clip((V - 20) / 30, 0, 1), 0.6)
        rkleur = np.array(streep, dtype=np.float32)[None, None, :] * np.clip(V[..., None] / 120, 0.4, 1)
        uit = uit * (1 - rand[..., None]) + rkleur * rand[..., None]
    if streep is not None:
        kleur = np.clip(np.array(streep, dtype=np.float32)[None, None, :] * (V[..., None] / 255) * 1.05, 0, 255)
        uit = uit * (1 - geel[..., None]) + kleur * geel[..., None]
    if uniform is not None:
        donker = np.clip((175 - V) / 45, 0, 1) * np.clip((130 - S) / 40, 0, 1) * (1 - geel)
        # gaatjes in het masker dichtmaken (sluiten) en zachter maken, zodat er geen spikkels of blokjes overblijven
        dicht = np.asarray(Image.fromarray((np.clip(donker, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)), dtype=np.float32) / 255
        donker = np.maximum(donker, dicht * (1 - geel))
        d = zacht(donker, 1.5) * (1 - bes) * inner
        licht = np.clip(V[..., None] / 80, 0, 1.3)
        kleur = np.clip(np.array(uniform, dtype=np.float32)[None, None, :] * (0.55 + 0.60 * licht), 0, 255)
        uit = uit * (1 - d[..., None]) + kleur * d[..., None]
    return np.concatenate([np.clip(uit, 0, 255), alfa], axis=-1)


def main():
    basis_pad, uitmap, *namen = sys.argv[1:]
    rgba = np.asarray(Image.open(basis_pad).convert("RGBA"), dtype=np.float32)
    naam = Path(basis_pad).stem.split("klassiek-", 1)[-1]
    uit = Path(uitmap)
    uit.mkdir(parents=True, exist_ok=True)
    for p in namen or list(PAKKEN):
        res = pak(rgba, *PAKKEN[p])
        doel = uit / f"held-ijzer-{p}-{naam}.webp"
        Image.fromarray(res.round().astype(np.uint8), "RGBA").save(doel, lossless=True)
        print("klaar", doel.name)


if __name__ == "__main__":
    main()
