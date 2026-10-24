# Laat de plaatjes tot leven komen: maakt met het lokale AI-videomodel Stable Video
# Diffusion korte bewegende versies (geanimeerde WebP, speelt overal af, ook offline).
# Bestaande filmpjes worden overgeslagen.
#
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-film.py
#
# Wat beweegt: de helden in hun stoere houding (elk pak), de schurken en de
# beginplaatjes van de avonturen (die staan als achtergrond tijdens het spel).
import json
import sys
from pathlib import Path

import torch
from diffusers import StableVideoDiffusionPipeline
from PIL import Image, ImageSequence

PROJECT = Path(__file__).resolve().parent.parent
BEELD = PROJECT / "public" / "beeld"
MODEL = Path("C:/Users/robbi/Tools/ai-beeld/svd")
FRAMES = 14
FPS = 9


def bronnen() -> list[tuple[Path, int, int, int]]:
    """(plaatje, breedte, hoogte, beweging) voor alles wat tot leven moet komen."""
    lijst = []
    for p in sorted(BEELD.glob("held-*-normaal.webp")):
        lijst.append((p, 512, 768, 90))
    for p in sorted(BEELD.glob("schurk-*.webp")):
        if ".anim." not in p.name:
            lijst.append((p, 512, 704, 110))
    for p in sorted(BEELD.glob("verhaal-*-begin.webp")):
        lijst.append((p, 768, 512, 70))  # rustiger: het is de achtergrond
    return [b for b in lijst if ".anim." not in b[0].name]


def main():
    pijp = StableVideoDiffusionPipeline.from_pretrained(MODEL, torch_dtype=torch.float16, variant="fp16")
    pijp.enable_model_cpu_offload()  # past zo in 8 GB videogeheugen
    pijp.unet.enable_forward_chunking()

    for bron, breed, hoog, beweging in bronnen():
        doel = bron.with_name(bron.stem + ".anim.webp")
        if doel.exists():
            continue
        beeld = Image.open(bron).convert("RGB").resize((breed, hoog), Image.LANCZOS)
        gen = torch.Generator("cpu").manual_seed(11)
        frames = pijp(beeld, width=breed, height=hoog, num_frames=FRAMES, decode_chunk_size=2,
                      motion_bucket_id=beweging, noise_aug_strength=0.02, fps=FPS, generator=gen).frames[0]
        # heen en terug afspelen: dan loopt het filmpje naadloos rond
        bewaar(doel, frames + frames[-2:0:-1])
        print("klaar:", doel.name, flush=True)

    if "--comprimeer" in sys.argv:
        # eerder gemaakte (grotere) filmpjes alsnog verkleinen
        for p in BEELD.glob("*.anim.webp"):
            im = Image.open(p)
            if im.width in (512, 768):  # nog op volle maat
                bewaar(p, [f.convert("RGB") for f in ImageSequence.Iterator(im)])
                print("verkleind:", p.name, flush=True)

    (BEELD / "index.json").write_text(json.dumps(sorted(p.name for p in BEELD.glob("*.webp"))), encoding="utf-8")


def bewaar(doel: Path, frames: list[Image.Image]):
    """Geanimeerde WebP op 80% van de maat en kwaliteit 55: ca. 1 MB per filmpje."""
    klein = [f.resize((int(f.width * 0.8), int(f.height * 0.8)), Image.LANCZOS) for f in frames]
    klein[0].save(doel, save_all=True, append_images=klein[1:], duration=int(1000 / FPS), loop=0, quality=55, method=6)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
