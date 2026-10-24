# Maakt de plaatjes van de helden en de avonturen met het lokale AI-beeldmodel
# Stable Diffusion XL en zet ze in public/beeld/. Bestaande plaatjes worden overgeslagen.
#
# Gebruik:
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-beeld.py --proef   (proefplaatjes, 3 varianten)
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-beeld.py           (alles)
#
# De helden zijn herkenbaar als spinnenheld en ijzerheld, maar bewust geen exacte kopie
# en zonder officiële logo's (de app staat op een openbare site).
import json
import re
import sys
from pathlib import Path

import torch
from diffusers import AutoencoderKL, StableDiffusionXLPipeline
from PIL import Image

PROJECT = Path(__file__).resolve().parent.parent
UIT = PROJECT / "public" / "beeld"
PROEF = PROJECT / "stemproef" / "beeld"
MODEL = Path("C:/Users/robbi/Tools/ai-beeld/sdxl")

STIJLEN = {
    "animatie": "3D animated movie style, highly detailed, cinematic soft lighting, vibrant colors, kid friendly",
    "film": "photorealistic movie still, realistic fabric and metal textures, cinematic lighting, highly detailed, friendly mood",
    "strip": "comic book illustration, bold ink outlines, vibrant flat colors, dynamic superhero comic art, clean",
}
# de gekozen stijl voor alle plaatjes (na de proef vastgezet)
STIJL = STIJLEN["strip"]
NEGATIEF = "text, words, letters, logo, watermark, signature, blurry, deformed, extra limbs, extra fingers, missing limbs, scary, gore, cropped, out of frame"

HELD = {
    # het masker vooraan: het model leest maar de eerste 77 woorddelen van de opdracht
    "spin": "full body character of a teenage athletic superhero, {masker} spider mask covering the entire head and face with black web lines and large white eye lenses, no skin visible, sleek {kleur} spider bodysuit with web pattern, small spider emblem on the chest",
    "ijzer": "full body character of a teenage superhero in a sleek high-tech {kleur} armored suit with smooth metal plates, a glowing round light in the chest, a helmet with a face plate and glowing eyes",
}
HOUDING = {
    "normaal": "standing confidently with both hands on hips, heroic pose, front view",
    "blij": "cheering happily with one fist raised high in the air, front view",
    "denk": "thinking pose with one hand on the chin, curious, front view",
}
PAKKEN = {
    "spin": {
        "klassiek": "red and blue", "nacht": "black and dark gray with white web lines", "jungle": "green and dark green",
        "goud": "gold and red", "ijs": "icy light blue and white", "galaxy": "purple and pink starry", "vuur": "orange and dark red",
    },
    "ijzer": {
        "klassiek": "red and gold", "zilver": "silver and white", "stealth": "matte black and dark gray with red glowing eyes",
        "ruimte": "dark blue and silver", "goud": "shiny gold", "neon": "purple and cyan neon", "lava": "dark red and glowing orange",
    },
}
# kleur van het volledige masker van de spinnenheld per pak
MASKER = {"klassiek": "full red", "nacht": "full black", "jungle": "full green", "goud": "full gold",
          "ijs": "full icy light blue", "galaxy": "full purple", "vuur": "full orange"}
ZAAD = {"spin": 1235, "ijzer": 5678}  # de gekozen proefvarianten (spin B, ijzer A); zelfde zaad = zo veel mogelijk dezelfde held


def verhalen() -> list[dict]:
    """Leest de avonturen uit src/verhalen.ts (id + beeldbeschrijvingen)."""
    tekst = (PROJECT / "src" / "verhalen.ts").read_text(encoding="utf-8")
    blokken = re.findall(r"id: '([^']+)',\s*held: '([^']+)'.*?beeldBegin: '([^']+)',\s*beeldEind: '([^']+)'", tekst, re.S)
    return [{"id": i, "held": h, "begin": b, "eind": e} for i, h, b, e in blokken]


def laad():
    vae = AutoencoderKL.from_pretrained(MODEL / "vae", torch_dtype=torch.float16)
    pijp = StableDiffusionXLPipeline.from_pretrained(MODEL, vae=vae, torch_dtype=torch.float16, variant="fp16", use_safetensors=True)
    pijp.enable_model_cpu_offload()  # past zo in 8 GB videogeheugen
    return pijp


def maak(pijp, prompt: str, zaad: int, breed: int, hoog: int) -> Image.Image:
    gen = torch.Generator("cpu").manual_seed(zaad)
    return pijp(prompt=prompt, negative_prompt=NEGATIEF, width=breed, height=hoog, num_inference_steps=30,
                guidance_scale=6.5, generator=gen).images[0]


def held_beeld(pijp, held: str, pak: str, houding: str, zaad: int, stijl: str = STIJL) -> Image.Image:
    prompt = f"{HELD[held].format(kleur=PAKKEN[held][pak], masker=MASKER.get(pak, "full red"))}, {HOUDING[houding]}, {stijl}, plain white background"
    # stripkaart: de achtergrond blijft staan (de app toont de held als kaart met ronde hoeken)
    beeld = maak(pijp, prompt, zaad, 832, 1216)
    beeld.thumbnail((520, 760))
    return beeld


def scene_beeld(pijp, held: str, beschrijving: str, eind: bool, zaad: int, stijl: str = STIJL) -> Image.Image:
    extra = ""
    if eind:
        extra = ", " + HELD[held].format(kleur=PAKKEN[held]["klassiek"], masker=MASKER["klassiek"]) + " celebrating in the scene"
    beeld = maak(pijp, f"{beschrijving}{extra}, {stijl}", zaad, 1216, 832)
    beeld.thumbnail((1100, 760))
    return beeld


def main():
    proef = "--proef" in sys.argv
    pijp = laad()
    doel = PROEF if proef else UIT
    doel.mkdir(parents=True, exist_ok=True)

    if proef:
        # per stijl: 2 varianten van elke held in het klassieke pak + 1 avontuurplaatje per held
        eerste = verhalen()[::5]
        for naam, stijl in STIJLEN.items():
            for held in ("spin", "ijzer"):
                for variant in range(2):
                    beeld = held_beeld(pijp, held, "klassiek", "normaal", ZAAD[held] + variant, stijl)
                    beeld.save(doel / f"{naam}-{held}-{variant + 1}.webp", quality=88)
                    print("klaar:", naam, held, variant + 1, flush=True)
            for v in eerste:
                scene_beeld(pijp, v["held"], v["begin"], False, 42, stijl).save(doel / f"{naam}-verhaal-{v['id']}.webp", quality=85)
                print("klaar:", naam, "verhaal", v["id"], flush=True)
        return

    for held in ("spin", "ijzer"):
        for pak in PAKKEN[held]:
            for houding in HOUDING:
                bestand = doel / f"held-{held}-{pak}-{houding}.webp"
                if not bestand.exists():
                    held_beeld(pijp, held, pak, houding, ZAAD[held]).save(bestand, quality=88)
                    print("klaar:", bestand.name, flush=True)
    for v in verhalen():
        for deel in ("begin", "eind"):
            bestand = doel / f"verhaal-{v['id']}-{deel}.webp"
            if not bestand.exists():
                scene_beeld(pijp, v["held"], v[deel], deel == "eind", 42).save(bestand, quality=85)
                print("klaar:", bestand.name, flush=True)

    (doel / "index.json").write_text(json.dumps(sorted(p.name for p in doel.glob("*.webp"))), encoding="utf-8")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
