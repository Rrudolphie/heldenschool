# Maakt alle plaatjes in de stoere 3D-actiefilmstijl met het lokale AI-beeldmodel FLUX.1-schnell
# (Apache 2.0). Helden, schurken, de auto en de krachten worden losgeknipt met BiRefNet.
#
# Gebruik:
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py                 (alles; bestaande overslaan)
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py --kandidaten    (één versie per held en
#       schurk in stemproef/beeld/kandidaten om te keuren)
#   ... maak-flux.py --kandidaten held-spin-goud-blij --tweede   (tweede versie van een afgekeurd plaatje; komt het
#       daaruit, zet het zaad dan in GEKOZEN)
#   ... maak-flux.py --kandidaten held-spin-goud-blij schurk-bolt                            (alleen deze)
#   ... maak-flux.py --alleen verhaal-                                                       (alleen namen die zo beginnen)
#
# Let op: het taalmodel leest maar 256 woorddelen. Houd de omschrijvingen kort, anders vallen de laatste
# afspraken (geen logo's, de houding) er stilletjes af.
import json
import os
import re
import sys
import time
from pathlib import Path

import torch
from diffusers import FluxPipeline, FluxTransformer2DModel, GGUFQuantizationConfig
from PIL import Image

PROJECT = Path(__file__).resolve().parent.parent
FLUX = Path("C:/Users/robbi/Tools/ai-beeld/flux")
# Q4_K_S (6,3 GB) past in 8 GB videogeheugen; Q5 (7,9 GB) bleek te groot en werd extreem traag
GGUF = FLUX / "flux1-schnell-Q4_K_S.gguf"
KNIPMODEL = "C:/Users/robbi/Tools/ai-beeld/birefnet"
UIT = PROJECT / "public" / "beeld"
KANDIDATEN = PROJECT / "stemproef" / "beeld" / "kandidaten"

STIJL = ("A powerful heroic superhero character from a modern 3D animated action movie, athletic young adult with natural "
         "realistic body proportions, full body from head to toe, two normal straight legs of equal length with correct "
         "anatomy, both feet flat on the ground, facing the viewer, cinematic lighting, high quality 3D render.")
# Afspraak: de helm bedekt ogen en neus helemaal, alleen mond en kin zijn vrij.
KLEP = ("The eyes and nose are completely hidden behind a solid mirror-finish {klep} visor that is fused to the helmet, "
        "no eyes visible, no see-through glass. Only the mouth and chin are bare.")
HELD = {
    # spin = Super-Kick (rekenen). De interne naam blijft "spin" zodat opgeslagen sterren en pakken behouden blijven.
    "spin": ("He is a European soccer star. He wears a slim short-sleeved {hoofd} soccer jersey with {accent} trim, "
             "plain {broek} soccer shorts without stripes, long plain {kousen} soccer socks and plain {hoofd} low-cut soccer cleats. No face cage. His head wears a smooth aerodynamic {hoofd} superhero helmet. " + KLEP + " {houding} "
             "No cape, no gloves, plain jersey without text, numbers or logos."),
    # ijzer = Agent Vroem (letters)
    "ijzer": ("He is clearly a police officer. He wears a {hoofd} police uniform jacket with {accent} reflective stripes, "
              "one plain golden star badge, a black belt with a small radio, {hoofd} trousers, black boots and gloves. His "
              "head wears a smooth {hoofd} police motorcycle helmet with a small round {accent} light on top. " + KLEP +
              " {houding} Fabric uniform, not a robot, no cape, no weapons, no holster, no patches, no text."),
}
# per pak: hoofdkleur, accentkleur, kleur van het vizier (zelfde id's als src/pakken.ts),
# eventueel gevolgd door de kleur van broek en kousen (anders: broek = accent, kousen = hoofdkleur)
PAKKEN = {
    "spin": {
        # broek en kousen zoals op de goedgekeurde klassiek-blij en klassiek-denk
        "klassiek": ("bright blue", "white", "white", "bright blue", "white"), "nacht": ("black", "dark blue", "black"),
        "jungle": ("jungle green", "lime green", "silver"), "goud": ("shiny gold", "white", "gold"),
        "ijs": ("icy light blue", "white", "white", "icy light blue", "white"), "galaxy": ("deep purple starry", "pink", "purple"),
        "vuur": ("fiery orange", "red", "orange"),
    },
    "ijzer": {
        "klassiek": ("black", "bright yellow", "dark black"), "zilver": ("silver grey", "bright blue", "dark blue"),
        "stealth": ("matte black", "dark grey", "dark black"), "ruimte": ("navy blue", "white", "dark black"),
        "goud": ("black", "shiny gold", "gold"), "neon": ("dark purple", "neon cyan", "dark black"),
        "lava": ("dark red", "glowing orange", "dark black"),
    },
}
HOUDING = {
    "spin": {
        "normaal": "He smiles confidently. A classic round white soccer ball with black pentagons rests under one arm and his other hand is on his hip.",
        "blij": "He cheers with a big open happy smile and one fist punched high in the air.",
        "denk": "He is thinking with one finger on his chin and a small curious smile.",
    },
    "ijzer": {
        "normaal": "He stands with his arms crossed.",
        "blij": "He cheers with a big open happy smile and one fist punched high in the air.",
        "denk": "He is thinking with one finger on his chin and a small curious smile.",
    },
}
ZAAD = {"spin": 1102, "ijzer": 1301}  # de goedgekeurde helden; tweede kandidaat = zaad + 50
# zaad per plaatje waarbij de tweede kandidaat beter was (met --kandidaten bekeken en met de hand gekozen)
GEKOZEN: dict[str, int] = {
    "held-spin-goud-normaal": 1152, "held-spin-jungle-normaal": 1152, "held-spin-ijs-normaal": 1102,
    "held-spin-jungle-denk": 1202, "held-spin-nacht-blij": 1202, "held-spin-vuur-blij": 1202,
    "held-spin-jungle-blij": 1252, "held-spin-nacht-normaal": 1352, "held-ijzer-lava-blij": 1401,
    "schurk-mopperwolk": 2250, "schurk-snoepslurper": 2250, "schurk-robotkrab": 2250,
    "verhaal-snoepslurper-eind": 92, "verhaal-robotkrab-eind": 192,
}
# goedgekeurde plaatjes uit de proef die niet opnieuw gemaakt worden (staan al in public/beeld)
VAST = {"held-spin-klassiek-blij", "held-spin-klassiek-denk", "held-ijzer-klassiek-normaal",
        "held-ijzer-klassiek-blij", "held-ijzer-klassiek-denk", "schurk-lodewijk", "politieauto", "kracht-bal",
        "kracht-net", "voetbal",
        # omgekleurd uit held-ijzer-klassiek-blij met scripts/herkleur.py (het model tekende steeds ogen of een cape)
        "held-ijzer-stealth-blij", "held-ijzer-neon-blij"}
# definitieve heldenplaatjes (ChatGPT-bron of basis B, door Agent Quality goedgekeurd, 3-11-2026): nooit overschrijven
VAST |= {f"held-{h}-{p}-{x}" for h, ps in (("spin", ("galaxy", "goud", "ijs", "jungle", "klassiek", "nacht", "vuur")),
                                            ("ijzer", ("goud", "klassiek", "lava", "neon", "ruimte", "stealth", "zilver")))
         for p in ps for x in ("normaal", "blij", "denk")}
# houdingen waarvoor geen goede versie te vinden was: de app toont dan de gewone houding van dat pak
WEGLATEN: set[str] = set()

SCHURK = ("3D animated action movie villain, full body, cinematic lighting, sly and mischievous but not scary for "
          "children, no weapons, high quality 3D render. ")
SCENE = ("A cinematic wide scene from a modern 3D animated action movie, dramatic lighting, rich detail, no superheroes, "
         "no text: ")
LOS = "Full body, centered, plain light grey background, no other objects."


class Pijp:
    """FLUX in twee delen, zodat het in 8 GB videogeheugen past én snel blijft:
    - het taalonderdeel (T5, 9 GB) draait op de processor (het werkgeheugen is ruim genoeg);
    - het tekenonderdeel en de beeldmaker staan vast op de videokaart."""

    def __init__(self):
        torch.set_num_threads(os.cpu_count() or 8)  # alle processorkernen voor het taalonderdeel
        self.taal = FluxPipeline.from_pretrained(FLUX, transformer=None, vae=None, torch_dtype=torch.float32)
        transformer = FluxTransformer2DModel.from_single_file(
            str(GGUF), quantization_config=GGUFQuantizationConfig(compute_dtype=torch.bfloat16),
            torch_dtype=torch.bfloat16, config=str(FLUX), subfolder="transformer")
        self.teken = FluxPipeline.from_pretrained(FLUX, transformer=transformer, text_encoder=None, text_encoder_2=None,
                                                  tokenizer=None, tokenizer_2=None, torch_dtype=torch.bfloat16)
        self.teken.to("cuda")
        self.teken.vae.enable_tiling()  # beeld in stukjes uitrekenen: minder geheugen

    def __call__(self, prompt: str, zaad: int, breed: int, hoog: int) -> Image.Image:
        with torch.no_grad():
            embeds, pooled, _ = self.taal.encode_prompt(prompt=prompt, prompt_2=prompt, device="cpu",
                                                        max_sequence_length=256)
        gen = torch.Generator("cpu").manual_seed(zaad)
        return self.teken(prompt_embeds=embeds.to("cuda", torch.bfloat16), pooled_prompt_embeds=pooled.to("cuda", torch.bfloat16),
                          num_inference_steps=4, guidance_scale=0.0, width=breed, height=hoog, generator=gen).images[0]


_knipper = None


def knip_los(beeld: Image.Image) -> Image.Image:
    """Knipt de figuur netjes los van de achtergrond met BiRefNet (lokaal, vrije licentie)."""
    global _knipper
    import torchvision.transforms as T
    from transformers import AutoModelForImageSegmentation

    if _knipper is None:
        _knipper = AutoModelForImageSegmentation.from_pretrained(KNIPMODEL, trust_remote_code=True)
        _knipper.eval().half()
    omzetten = T.Compose([T.Resize((1024, 1024)), T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    x = omzetten(beeld.convert("RGB")).unsqueeze(0).to("cuda").half()
    # alleen even op de videokaart: blijft hij er staan, dan past het tekenmodel niet meer en wordt alles traag
    _knipper.to("cuda")
    with torch.no_grad():
        masker = _knipper(x)[-1].sigmoid()[0, 0].float().cpu()
    _knipper.to("cpu")
    del x
    torch.cuda.empty_cache()
    alfa = T.functional.to_pil_image(masker).resize(beeld.size, Image.LANCZOS)
    los = beeld.convert("RGBA")
    los.putalpha(alfa)
    return los.crop(los.getbbox())


def verhalen() -> list[dict]:
    """Leest de avonturen uit src/verhalen.ts (id + beeldbeschrijvingen)."""
    tekst = (PROJECT / "src" / "verhalen.ts").read_text(encoding="utf-8")
    blokken = re.findall(
        r"id: '([^']+)',.*?schurkPortret: '([^']+)',.*?held: '([^']+)'.*?beeldBegin: '([^']+)',\s*beeldEind: '([^']+)'",
        tekst, re.S)
    return [{"id": i, "schurk": s, "held": h, "begin": b, "eind": e} for i, s, h, b, e in blokken]


def taken() -> dict[str, tuple]:
    """Alle plaatjes: naam -> (omschrijving, zaad, breedte, hoogte, losknippen en maximale grootte of None)."""
    lijst = {}
    for h, pakken in PAKKEN.items():
        for pak, (hoofd, accent, klep, *rest) in pakken.items():
            broek, kousen = rest or (accent, hoofd)
            for houding, pose in HOUDING[h].items():
                tekst = STIJL + " " + HELD[h].format(hoofd=hoofd, accent=accent, klep=klep, broek=broek, kousen=kousen,
                                                     houding=pose) + " " + LOS
                lijst[f"held-{h}-{pak}-{houding}"] = (tekst, ZAAD[h], 832, 1152, (520, 700))
    # basis voor scripts/houding.py: geen bal, armen los langs het lijf (alleen met --kandidaten held-spin-klassiek-basis)
    hoofd, accent, klep, broek, kousen = PAKKEN["spin"]["klassiek"]
    pose = "He stands relaxed, both arms hanging loosely at his sides, slightly away from the body, empty hands, no ball."
    lijst["held-spin-klassiek-basis"] = (STIJL + " " + HELD["spin"].format(hoofd=hoofd, accent=accent, klep=klep, broek=broek,
                                         kousen=kousen, houding=pose) + " " + LOS, ZAAD["spin"], 832, 1152, (520, 700))
    hoofd, accent, klep = PAKKEN["ijzer"]["klassiek"]
    pose = ("He stands relaxed, both arms hanging loosely at his sides, slightly away from the body, empty hands, "
            "small radio on the chest.")
    lijst["held-ijzer-klassiek-basis"] = (STIJL + " " + HELD["ijzer"].format(hoofd=hoofd, accent=accent, klep=klep,
                                          houding=pose) + " " + LOS, ZAAD["ijzer"], 832, 1152, (520, 700))
    for v in verhalen():
        lijst[f"schurk-{v['id']}"] = (SCHURK + v["schurk"] + " " + LOS, 2200, 832, 1152, (440, 600))
        for deel in ("begin", "eind"):
            # zonder held: de app zet het goedgekeurde losgeknipte heldenplaatje er zelf op
            lijst[f"verhaal-{v['id']}-{deel}"] = (SCENE + v[deel] + ".", 42, 1216, 832, None)
    return lijst


def teken(pijp, naam: str, taak: tuple, zaad: int) -> Image.Image:
    tekst, _, breed, hoog, los = taak
    beeld = pijp(tekst, zaad, breed, hoog)
    if los:
        beeld = knip_los(beeld)
        beeld.thumbnail(los)
    else:
        beeld.thumbnail((1100, 760))
    return beeld


def main():
    alle = taken()
    pijp = Pijp()
    begin = time.time()
    if "--kandidaten" in sys.argv:
        KANDIDATEN.mkdir(parents=True, exist_ok=True)
        namen = [a for a in sys.argv[sys.argv.index("--kandidaten") + 1:] if not a.startswith("--") and not a.replace(",", "").isdigit()] or [
            n for n in alle if n not in VAST and not n.startswith("verhaal-")]
        for nr, naam in enumerate(namen, 1):
            # eerst één versie; alleen afgekeurde plaatjes krijgen daarna een tweede (--tweede)
            extras = (0,)
            if "--tweede" in sys.argv:
                extras = (50,)
            elif "--derde" in sys.argv:
                extras = (100,)
            elif "--zaden" in sys.argv:  # bv. --zaden 150,200,250: meerdere versies in één ronde
                extras = tuple(int(z) for z in sys.argv[sys.argv.index("--zaden") + 1].split(","))
            for extra in extras:
                doel = KANDIDATEN / f"{naam}-{alle[naam][1] + extra}.webp"
                if not doel.exists():
                    teken(pijp, naam, alle[naam], alle[naam][1] + extra).save(doel, quality=90)
            print(f"klaar {nr} van {len(namen)}: {naam} ({time.time() - begin:.0f} s)", flush=True)
        return

    klaar_lijst = UIT / ".flux-klaar.json"
    klaar = set(json.loads(klaar_lijst.read_text())) if klaar_lijst.exists() else set()
    alleen = sys.argv[sys.argv.index("--alleen") + 1] if "--alleen" in sys.argv else ""
    te_doen = [n for n in alle if n.startswith(alleen) and f"{n}.webp" not in klaar and n not in VAST
               and f"{n}.webp" not in WEGLATEN]
    for nr, naam in enumerate(te_doen, 1):
        teken(pijp, naam, alle[naam], GEKOZEN.get(naam, alle[naam][1])).save(UIT / f"{naam}.webp", quality=88)
        klaar.add(f"{naam}.webp")
        klaar_lijst.write_text(json.dumps(sorted(klaar)))
        print(f"klaar {nr} van {len(te_doen)}: {naam} ({time.time() - begin:.0f} s)", flush=True)
    (UIT / "index.json").write_text(json.dumps(sorted(p.name for p in UIT.glob("*.webp"))), encoding="utf-8")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
