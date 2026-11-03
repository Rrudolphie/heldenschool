# Dezelfde Super-Kick in een andere houding. Het goedgekeurde basisplaatje (neutrale houding, armen los) blijft staan;
# alleen een SMAL masker rond de armen (en de bal of de hand bij de kin) wordt opnieuw getekend met FLUX.1-schnell
# (inpainting). Helm, gezicht, romp-midden, broek, benen en schoenen blijven pixel voor pixel gelijk (schaal 1:1, geen
# herschalen van de basis).
#
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\houding.py <basis.webp> <naam> [--houdingen normaal,blij,denk]
#          [--zaden 0,50,100] [--sterkte 1.0]
#   -> stemproef/beeld/kandidaten/<naam>-<houding>-<zaad>.webp: kopie van het basisformaat (zelfde middellijn en voeten,
#      zelfde schaal), alleen hoger/breder als de arm buiten het basisvak komt.
import importlib.util
import sys
from pathlib import Path

import numpy as np
import torch
from diffusers import FluxInpaintPipeline
from PIL import Image, ImageDraw, ImageFilter

PROJECT = Path(__file__).resolve().parent.parent
KANDIDATEN = PROJECT / "stemproef" / "beeld" / "kandidaten"
B, H = 832, 1152

spec = importlib.util.spec_from_file_location("maak_flux", PROJECT / "scripts" / "maak-flux.py")
flux = importlib.util.module_from_spec(spec)
spec.loader.exec_module(flux)

# maskervakken per houding in breuken van het figuurvak (x0, y0, x1, y1); x en y van 0 tot 1
MASKER = {
    # ronde 2: de mouwen/armen tot de oksel (x 0,19 / 0,81); niets door het romp-midden
    "blij": [(-1.0, -0.25, 0.27, 0.19), (-1.0, 0.19, 2.0, 0.58)],  # ronde 4: hele romp-band (hals tot heup), lage sterkte
    "normaal": [(-1.0, 0.19, 0.19, 0.62), (0.17, 0.28, 0.52, 0.47), (0.81, 0.19, 2.0, 0.62), (0.70, 0.40, 0.85, 0.55)],
    "denk": [(-1.0, 0.19, 0.19, 0.62), (0.19, 0.16, 0.62, 0.40)],
}
PROMPT_HOUDING = {
    "blij": "He cheers with a big happy smile and one fist punched high in the air, the other arm hangs relaxed at his side. Empty hands, no ball.",
    "normaal": "A classic round white soccer ball rests under one arm and his other hand is on his hip.",
    "denk": "He is thinking with one finger on his chin and a small curious smile. Empty hands, no ball.",
}


def basis_op_doek(pad: Path):
    fig = Image.open(pad).convert("RGBA")
    x0, y0 = (B - fig.width) // 2, H - fig.height - 140
    doek = Image.new("RGBA", (B, H), (225, 225, 225, 255))
    doek.alpha_composite(fig, (x0, y0))
    alfa = Image.new("L", (B, H), 0)
    alfa.paste(fig.getchannel("A"), (x0, y0))
    return fig, doek.convert("RGB"), alfa, (x0, y0, x0 + fig.width, y0 + fig.height)


def maak_masker(houding: str, vak) -> Image.Image:
    x0, y0, x1, y1 = vak
    w, h = x1 - x0, y1 - y0
    m = Image.new("L", (B, H), 0)
    d = ImageDraw.Draw(m)
    for a, b, c, e in MASKER[houding]:
        d.rectangle((round(x0 + a * w), round(y0 + b * h),
                     round(x0 + c * w), round(y0 + e * h)), fill=255)
    return m.filter(ImageFilter.GaussianBlur(5))


def main():
    basis, naam = Path(sys.argv[1]), sys.argv[2]
    houdingen = sys.argv[sys.argv.index("--houdingen") + 1].split(",") if "--houdingen" in sys.argv else ["normaal", "blij", "denk"]
    zaden = [int(z) for z in sys.argv[sys.argv.index("--zaden") + 1].split(",")] if "--zaden" in sys.argv else [0, 50, 100]
    sterkte = float(sys.argv[sys.argv.index("--sterkte") + 1]) if "--sterkte" in sys.argv else 1.0
    fig, doek, base_alfa, vak = basis_op_doek(basis)
    doek_arr = np.asarray(doek, dtype=np.float32)
    base_a_arr = np.asarray(base_alfa, dtype=np.float32) / 255

    pijp = flux.Pijp()
    t = pijp.teken
    inpaint = FluxInpaintPipeline(scheduler=t.scheduler, vae=t.vae, text_encoder=None, tokenizer=None,
                                  text_encoder_2=None, tokenizer_2=None, transformer=t.transformer)
    alle = flux.taken()
    for houding in houdingen:
        masker = maak_masker(houding, vak)
        masker.save(KANDIDATEN / f"masker-{naam}-{houding}.png")
        m_arr = np.asarray(masker, dtype=np.float32)[..., None] / 255
        kern = alle["held-spin-klassiek-basis"][0].rsplit("He stands relaxed", 1)[0]  # stijl + pak, zonder houding
        tekst = (kern + PROMPT_HOUDING[houding] + " No cape, no gloves, plain kit without "
                 "stripes or logos. " + flux.LOS)
        with torch.no_grad():
            embeds, pooled, _ = pijp.taal.encode_prompt(prompt=tekst, prompt_2=tekst, device="cpu", max_sequence_length=256)
        for zaad in zaden:
            doel = KANDIDATEN / f"{naam}-{houding}-{zaad}.webp"
            if doel.exists():
                continue
            gen = torch.Generator("cpu").manual_seed(1102 + zaad)
            uit = inpaint(prompt_embeds=embeds.to("cuda", torch.bfloat16), pooled_prompt_embeds=pooled.to("cuda", torch.bfloat16),
                          image=doek, mask_image=masker, height=H, width=B, strength=sterkte,
                          num_inference_steps=4, guidance_scale=0.0, generator=gen).images[0]
            uit_arr = np.asarray(uit.convert("RGB"), dtype=np.float32)
            samen = Image.fromarray((uit_arr * m_arr + doek_arr * (1 - m_arr)).round().astype(np.uint8))
            samen.save(KANDIDATEN / f"{naam}-{houding}-{zaad}-ruw.png")
            # losknippen alleen binnen het masker; buiten het masker blijft de alfa van de basis
            alfa_knip = _knip_alfa(samen)
            a = np.clip(alfa_knip * m_arr[..., 0] + base_a_arr * (1 - m_arr[..., 0]), 0, 1)
            rgba = np.dstack([np.asarray(samen, dtype=np.uint8), (a * 255).round().astype(np.uint8)])
            beeld = Image.fromarray(rgba, "RGBA")
            # uitsnede: voeten en middellijn zoals de basis, alleen hoger/breder waar nodig
            bb = beeld.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
            mid = (vak[0] + vak[2]) // 2
            halve = max(mid - bb[0], bb[2] - mid, (vak[2] - vak[0]) // 2)
            box = (mid - halve, bb[1], mid + halve, vak[3])
            beeld.crop(box).save(doel, lossless=True)
            print(f"klaar {doel.name}", flush=True)


def _knip_alfa(beeld: Image.Image) -> np.ndarray:
    """Alfa van BiRefNet op het hele doek (zelfde formaat als het doek)."""
    import torchvision.transforms as T
    from transformers import AutoModelForImageSegmentation

    if flux._knipper is None:
        flux._knipper = AutoModelForImageSegmentation.from_pretrained(flux.KNIPMODEL, trust_remote_code=True)
        flux._knipper.eval().half()
    omzetten = T.Compose([T.Resize((1024, 1024)), T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
    x = omzetten(beeld.convert("RGB")).unsqueeze(0).to("cuda").half()
    flux._knipper.to("cuda")
    with torch.no_grad():
        masker = flux._knipper(x)[-1].sigmoid()[0, 0].float().cpu()
    flux._knipper.to("cpu")
    del x
    torch.cuda.empty_cache()
    return np.asarray(T.functional.to_pil_image(masker).resize(beeld.size, Image.LANCZOS), dtype=np.float32) / 255


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
