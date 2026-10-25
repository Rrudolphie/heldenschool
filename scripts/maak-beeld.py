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
KNIPMODEL = "C:/Users/robbi/Tools/ai-beeld/birefnet"

STIJLEN = {
    "animatie": "3D animated movie style, highly detailed, cinematic soft lighting, vibrant colors, kid friendly",
    "film": "photorealistic movie still, realistic fabric and metal textures, cinematic lighting, highly detailed, friendly mood",
    "strip": "comic book illustration, bold ink outlines, vibrant flat colors, dynamic superhero comic art, clean",
    # kinderlijke 3D-tekenfilmstijl, zoals populaire kleuterseries
    "kleuter": "cute 3D cartoon render, preschool animated TV series style, soft rounded shapes, bright cheerful colors, glossy, adorable, kid friendly",
}

# helden voor kleuters: jong, groot hoofd (eigen ontwerp, geen kopie).
# Afspraak: in een pak zie je NOOIT ogen of huid, alleen effen lenzen.
KLEUTER_HELD = {
    "spin": "little kid superhero, chibi, big round head, {masker} spider mask with web lines covering the whole face, flat solid white teardrop mask lenses with thick black outline, {kleur} spider suit, spider logo on chest",
    "ijzer": "little kid superhero, chibi, big round helmet covering the whole face, {kleur} shiny robot armor, round glowing light on the chest, two glowing eye slits",
}
KLEUTER_ACHTERGROND = "full body, standing, centered, plain simple light background"
KLEUTER_ZAAD = {"spin": 300, "ijzer": 301}  # de gekozen proefvarianten (spin 1, ijzer 2)
KLEUTER_SCHURK = "cute 3D cartoon villain character, {portret}, funny and mischievous, not scary, full body, standing, plain simple light background"
KLEUTER_SCENE = "{beschrijving}, cute 3D cartoon render, preschool animated TV series style, bright cheerful colors, soft lighting, wide shot"
SPINNETJE = "one cute tiny cartoon spider with big friendly eyes and a smile, round purple body, eight little legs, 3D cartoon render, preschool style, plain simple light background"
# de gekozen stijl voor alle plaatjes (na de proef vastgezet)
STIJL = STIJLEN["strip"]
NEGATIEF = "text, words, letters, logo, watermark, signature, blurry, deformed, extra limbs, extra fingers, missing limbs, scary, gore, cropped, out of frame"
KLEUTER_NEGATIEF = NEGATIEF + ", pupils, iris, eyeballs, visible eyes, eyelashes, reflections in lenses, gray lenses, skin, nose, mouth, human face, cape"

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
        "klassiek": "red and gold", "zilver": "silver and white", "stealth": "matte black and dark gray",
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
    blokken = re.findall(
        r"id: '([^']+)',.*?schurkPortret: '([^']+)',.*?held: '([^']+)'.*?beeldBegin: '([^']+)',\s*beeldEind: '([^']+)'",
        tekst, re.S)
    return [{"id": i, "schurk": s, "held": h, "begin": b, "eind": e} for i, s, h, b, e in blokken]


def schurk_beeld(pijp, portret: str, zaad: int) -> Image.Image:
    """Stripkaart van een schurk: grappig en ondeugend, niet eng."""
    prompt = f"{portret}, funny and mischievous, not scary, upper body character card, {STIJL}"
    beeld = maak(pijp, prompt, zaad, 832, 1088)
    beeld.thumbnail((420, 560))
    return beeld


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


def kleuter(pijp, prompt: str, zaad: int, breed: int, hoog: int) -> Image.Image:
    gen = torch.Generator("cpu").manual_seed(zaad)
    return pijp(prompt=prompt, negative_prompt=KLEUTER_NEGATIEF, width=breed, height=hoog, num_inference_steps=30,
                guidance_scale=6.5, generator=gen).images[0]


def kleuter_held(pijp, held: str, pak: str, houding: str, zaad: int) -> Image.Image:
    held_tekst = KLEUTER_HELD[held].format(kleur=PAKKEN[held][pak], masker=MASKER.get(pak, "full red"))
    # de stijl vooraan: het model leest maar ~77 woorddelen, en "3D" mag er niet af vallen
    prompt = f"{STIJLEN['kleuter']}, {held_tekst}, {HOUDING[houding]}, {KLEUTER_ACHTERGROND}"
    los = knip_los(kleuter(pijp, prompt, zaad, 896, 1152))
    los.thumbnail((520, 700))
    return los


def kleuter_alles(pijp):
    """Alle plaatjes in de kinderlijke 3D-stijl. Helden, schurken en het spinnetje losgeknipt."""
    BEELD = UIT
    for oud in BEELD.glob("*.anim.webp"):  # de flikkerende filmpjes zijn vervallen
        oud.unlink()
    klaar_lijst = BEELD / ".kleuter-klaar.json"
    klaar = set(json.loads(klaar_lijst.read_text())) if klaar_lijst.exists() else set()

    def maak_als_nodig(naam: str, functie):
        if naam in klaar:
            return
        functie().save(BEELD / naam, quality=88)
        klaar.add(naam)
        klaar_lijst.write_text(json.dumps(sorted(klaar)))
        print("klaar:", naam, flush=True)

    maak_als_nodig("spinnetje.webp", lambda: knip_los(kleuter(pijp, SPINNETJE, 5, 1024, 1024)).resize((256, 256)))
    for held in ("spin", "ijzer"):
        for pak in PAKKEN[held]:
            for houding in HOUDING:
                maak_als_nodig(f"held-{held}-{pak}-{houding}.webp",
                               lambda h=held, p=pak, ho=houding: kleuter_held(pijp, h, p, ho, KLEUTER_ZAAD[h]))
    for v in verhalen():
        def schurk(v=v):
            los = knip_los(kleuter(pijp, KLEUTER_SCHURK.format(portret=v["schurk"]), 77, 896, 1152))
            los.thumbnail((440, 600))
            return los
        maak_als_nodig(f"schurk-{v['id']}.webp", schurk)
        for deel in ("begin", "eind"):
            def scene(v=v, deel=deel):
                extra = ""
                if deel == "eind":
                    extra = ", " + KLEUTER_HELD[v["held"]].format(kleur=PAKKEN[v["held"]]["klassiek"], masker=MASKER["klassiek"]) + " celebrating"
                beeld = kleuter(pijp, KLEUTER_SCENE.format(beschrijving=v[deel] + extra), 42, 1216, 832)
                beeld.thumbnail((1100, 760))
                return beeld
            maak_als_nodig(f"verhaal-{v['id']}-{deel}.webp", scene)
    (BEELD / "index.json").write_text(json.dumps(sorted(p.name for p in BEELD.glob("*.webp"))), encoding="utf-8")


def main():
    if "--proef-kleuter" in sys.argv:
        # de gekozen varianten opnieuw (zonder ogen), strak losgeknipt
        pijp = laad()
        PROEF.mkdir(parents=True, exist_ok=True)
        for variant in range(6):
            kleuter_held(pijp, "spin", "klassiek", "normaal", 300 + variant).save(PROEF / f"lens-spin-{variant + 1}.webp", quality=90)
            print("klaar: spin", variant + 1, flush=True)
        return
    if "--kleuter" in sys.argv:
        kleuter_alles(laad())
        return

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
        bestand = doel / f"schurk-{v['id']}.webp"
        if not bestand.exists():
            schurk_beeld(pijp, v["schurk"], 77).save(bestand, quality=88)
            print("klaar:", bestand.name, flush=True)
        for deel in ("begin", "eind"):
            bestand = doel / f"verhaal-{v['id']}-{deel}.webp"
            if not bestand.exists():
                scene_beeld(pijp, v["held"], v[deel], deel == "eind", 42).save(bestand, quality=85)
                print("klaar:", bestand.name, flush=True)

    (doel / "index.json").write_text(json.dumps(sorted(p.name for p in doel.glob("*.webp"))), encoding="utf-8")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
