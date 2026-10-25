# Maakt alle plaatjes in de kinderlijke 3D-stijl met het lokale AI-beeldmodel FLUX.1-schnell
# (veel beter in het volgen van de omschrijving dan Stable Diffusion XL).
# Helden, schurken en het spinnetje worden losgeknipt met BiRefNet (zie maak-beeld.py).
#
# Gebruik:
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py --proef   (proefplaatjes)
#   C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py           (alles; bestaande overslaan)
import importlib.util
import json
import os
import sys
import time
from pathlib import Path

import torch
from diffusers import FluxPipeline, FluxTransformer2DModel, GGUFQuantizationConfig

PROJECT = Path(__file__).resolve().parent.parent
FLUX = Path("C:/Users/robbi/Tools/ai-beeld/flux")
# Q4_K_S (6,3 GB) past in 8 GB videogeheugen; Q5 (7,9 GB) bleek te groot en werd extreem traag
GGUF = FLUX / "flux1-schnell-Q4_K_S.gguf"
UIT = PROJECT / "public" / "beeld"
PROEF = PROJECT / "stemproef" / "beeld"

# hulpfuncties (losknippen, verhalen) delen met het oude beeldscript
_spec = importlib.util.spec_from_file_location("maak_beeld", PROJECT / "scripts" / "maak-beeld.py")
mb = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mb)

STIJL = ("A cute 3D animated character in the style of a cheerful preschool TV cartoon series, soft rounded shapes, "
         "glossy bright colors, friendly and adorable, high quality 3D render.")

# Afspraak: in een pak zie je NOOIT ogen of huid.
HELD = {
    # Alleen positief omschrijven: woorden als "gezicht", "mond" of "oren" noemen (ook met "geen") laat het
    # model ze juist tekenen. Het hele hoofd is één glad masker met twee witte lenzen.
    "spin": ("A little kid superhero with chibi proportions. His whole head is one smooth round {masker} spider mask, "
             "like a shiny ball covered in thin black web lines, with two large flat solid white teardrop-shaped lenses "
             "outlined in thick black. He wears a full {kleur} spider bodysuit with web lines, a small black spider "
             "emblem on the chest, {masker} gloves and {masker} boots."),
    # "kid" laat het model hier een kindergezicht onder de helm tekenen; een speelgoedrobotje van metaal niet
    "ijzer": ("A small cute chibi armored superhero figure made entirely of shiny metal, like a toy robot. His big round "
              "head is a solid {kleur} metal helmet whose front is one flat smooth gold metal mask plate with two thin "
              "glowing light blue slit lenses. He wears a full shiny {kleur} armor suit with armored gloves and "
              "armored boots, and a round glowing light on the chest."),
}
HOUDING = {
    "normaal": "He stands confidently with both hands on his hips.",
    "blij": "He cheers happily with one fist raised high in the air.",
    "denk": "He is thinking, with one hand on his chin.",
}
LOS = "Full body, centered, plain light grey background, no other objects."

MASKER = {"klassiek": "red", "nacht": "black", "jungle": "green", "goud": "gold", "ijs": "icy light blue",
          "galaxy": "purple", "vuur": "orange"}
ZAAD = {"spin": 12, "ijzer": 21}  # gekozen proefvarianten: spin 3, ijzer 2 (robotomschrijving)
# plaatjes waarbij het vaste zaad toch huid of een cape gaf: met --kandidaten nagezocht en met de hand gekozen
ZAAD_LOS: dict[str, int] = {
    "held-ijzer-neon-normaal.webp": 121, "held-ijzer-neon-blij.webp": 121,
    "held-ijzer-ruimte-normaal.webp": 122, "held-ijzer-stealth-normaal.webp": 122,
}
# houdingen waarvoor geen goede versie te vinden was: weggelaten, de app toont dan de gewone houding van dat pak
WEGLATEN = {f"held-{n}.webp" for n in (
    "spin-klassiek-blij", "spin-ijs-blij", "spin-jungle-blij", "spin-jungle-denk", "spin-galaxy-blij", "spin-galaxy-denk",
    "ijzer-lava-blij", "ijzer-neon-denk", "ijzer-ruimte-blij", "ijzer-ruimte-denk", "ijzer-stealth-blij",
    "ijzer-stealth-denk", "ijzer-zilver-denk")}


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

    def __call__(self, prompt: str, zaad: int, breed: int, hoog: int):
        begin = time.time()
        with torch.no_grad():
            embeds, pooled, _ = self.taal.encode_prompt(prompt=prompt, prompt_2=prompt, device="cpu",
                                                        max_sequence_length=256)
        print(f"  taal: {time.time() - begin:.0f} s", flush=True)
        gen = torch.Generator("cpu").manual_seed(zaad)
        return self.teken(prompt_embeds=embeds.to("cuda", torch.bfloat16), pooled_prompt_embeds=pooled.to("cuda", torch.bfloat16),
                          num_inference_steps=4, guidance_scale=0.0, width=breed, height=hoog, generator=gen).images[0]


def laad():
    return Pijp()


def maak(pijp, prompt: str, zaad: int, breed: int, hoog: int):
    return pijp(prompt, zaad, breed, hoog)


def held_tekst(held: str, pak: str) -> str:
    return HELD[held].format(kleur=mb.PAKKEN[held][pak], masker=MASKER.get(pak, "red"))


def held(pijp, held_id: str, pak: str, houding: str, zaad: int):
    los = mb.knip_los(maak(pijp, f"{STIJL} {held_tekst(held_id, pak)} {HOUDING[houding]} {LOS}", zaad, 832, 1152))
    los.thumbnail((520, 700))
    return los


def main():
    pijp = laad()
    if "--proef" in sys.argv:
        PROEF.mkdir(parents=True, exist_ok=True)
        for h in ("ijzer",):
            for v in range(3):
                t = time.time()
                held(pijp, h, "klassiek", "normaal", ZAAD[h] + v).save(PROEF / f"flux2-{h}-{v + 1}.webp", quality=90)
                print(f"klaar: {h} {v + 1} ({time.time() - t:.0f} s)", flush=True)
        return
    if "--kandidaten" in sys.argv:  # bv. --kandidaten held-spin-ijs-blij: twee andere zaden om uit te kiezen
        PROEF.mkdir(parents=True, exist_ok=True)
        for naam in sys.argv[sys.argv.index("--kandidaten") + 1:]:
            _, h, pak, houding = naam.removesuffix(".webp").split("-")
            for zaad in range(ZAAD[h] + 100, ZAAD[h] + 102):
                held(pijp, h, pak, houding, zaad).save(PROEF / f"kand-{h}-{pak}-{houding}-{zaad}.webp", quality=90)
                print(f"klaar: {naam} zaad {zaad}", flush=True)
        return

    for oud in UIT.glob("*.anim.webp"):  # de flikkerende filmpjes zijn vervallen
        oud.unlink()
    klaar_lijst = UIT / ".flux-klaar.json"
    klaar = set(json.loads(klaar_lijst.read_text())) if klaar_lijst.exists() else set()

    def maak_als_nodig(naam: str, functie):
        if naam in klaar or naam in WEGLATEN:
            return
        begin = time.time()
        functie().save(UIT / naam, quality=88)
        klaar.add(naam)
        klaar_lijst.write_text(json.dumps(sorted(klaar)))
        print(f"klaar: {naam} ({time.time() - begin:.0f} s)", flush=True)

    maak_als_nodig("spinnetje.webp", lambda: mb.knip_los(maak(
        pijp, f"{STIJL} One tiny cute cartoon spider with big friendly eyes and a smile, a round purple body and eight "
              f"little legs. {LOS}", 5, 1024, 1024)).resize((256, 256)))
    # --verhaal bolt: alleen de schurk en achtergronden van één verhaal (om de stijl eerst in de app te bekijken)
    alleen = sys.argv[sys.argv.index("--verhaal") + 1] if "--verhaal" in sys.argv else None
    for h in () if alleen else ("spin", "ijzer"):
        for pak in mb.PAKKEN[h]:
            for houding in HOUDING:
                maak_als_nodig(f"held-{h}-{pak}-{houding}.webp",
                               lambda h=h, p=pak, ho=houding: held(
                                   pijp, h, p, ho, ZAAD_LOS.get(f"held-{h}-{p}-{ho}.webp", ZAAD[h])))
    for v in mb.verhalen():
        if alleen and v["id"] != alleen:
            continue
        def schurk(v=v):
            los = mb.knip_los(maak(pijp, f"{STIJL} A funny, mischievous but not scary cartoon villain: {v['schurk']}. {LOS}",
                                   77, 832, 1152))
            los.thumbnail((440, 600))
            return los
        maak_als_nodig(f"schurk-{v['id']}.webp", schurk)
        for deel in ("begin", "eind"):
            def scene(v=v, deel=deel):
                # zonder held: in een drukke scène tekent het model toch een gezicht of cape. De app zet
                # het goedgekeurde losgeknipte heldenplaatje er zelf op.
                beeld = maak(pijp, f"{STIJL} A wide scene: {v[deel]}.", 42, 1216, 832)
                beeld.thumbnail((1100, 760))
                return beeld
            maak_als_nodig(f"verhaal-{v['id']}-{deel}.webp", scene)
    # de politieauto die de schurk aan het eind ophaalt (van opzij gezien, rijdt naar links)
    maak_als_nodig("politieauto.webp", lambda: mb.knip_los(maak(
        pijp, f"{STIJL} A cute small toy police car seen from the side, facing left, white with a blue stripe and plain "
              f"smooth doors, empty dark windows, a red and blue siren light on the roof. {LOS}", 10, 1152, 832)).resize((440, 318)))
    (UIT / "index.json").write_text(json.dumps(sorted(p.name for p in UIT.glob("*.webp"))), encoding="utf-8")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
