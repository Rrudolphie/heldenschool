# Het beeldmodel tekent vaak een streepje van een sportmerk op de voetbalschoenen van Super-Kick.
# Dit script strijkt de schoenen glad en zet er het eigen Super-Kick-logo op: een witte K met donkere rand.
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\schoenlogo.py [plaatjes...]
#          (zonder namen: alle held-spin-*.webp in public/beeld die nog geen logo hebben)
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PROJECT = Path(__file__).resolve().parent.parent
BEELD = PROJECT / "public" / "beeld"
KLAAR = BEELD / ".schoenlogo.json"  # plaatjes die al een logo hebben (niet twee keer doen)


def logo(hoogte: int) -> Image.Image:
    """Witte K met donkere rand, op een transparante achtergrond."""
    groot = hoogte * 4
    vlak = Image.new("RGBA", (groot, groot), (0, 0, 0, 0))
    teken = ImageDraw.Draw(vlak)
    try:
        letter = ImageFont.truetype("arialbd.ttf", int(groot * 0.95))
    except OSError:
        letter = ImageFont.load_default()
    teken.text((groot / 2, groot / 2), "K", font=letter, anchor="mm", fill="white",
               stroke_width=max(2, groot // 9), stroke_fill=(17, 24, 39))
    return vlak.resize((hoogte, hoogte), Image.LANCZOS)


def schoenen(alfa: np.ndarray) -> list[tuple[int, int, int, int]]:
    """Vindt de twee schoenen: de losse vlekken in de onderste 9% van de figuur."""
    h, w = alfa.shape
    boven = int(h * 0.91)
    kolommen = (alfa[boven:] > 128).any(axis=0)
    vlekken, begin = [], None
    for x, aan in enumerate(list(kolommen) + [False]):
        if aan and begin is None:
            begin = x
        elif not aan and begin is not None:
            if x - begin > w * 0.06:
                vlekken.append((begin, x))
            begin = None
    return [(a, boven, b, h) for a, b in vlekken[:2]]


def bewerk(pad: Path):
    beeld = Image.open(pad).convert("RGBA")
    alfa = np.array(beeld)[:, :, 3]
    for links, boven, rechts, onder in schoenen(alfa):
        vak = (links, boven, rechts, onder)
        stuk = beeld.crop(vak)
        # gladstrijken: het merkstreepje verdwijnt, de vorm en kleur van de schoen blijven
        glad = stuk.filter(ImageFilter.MedianFilter(15)).filter(ImageFilter.MedianFilter(15))
        glad.putalpha(stuk.getchannel("A"))
        beeld.paste(glad, vak)
        maat = int((onder - boven) * 0.45)
        k = logo(maat)
        beeld.alpha_composite(k, ((links + rechts) // 2 - maat // 2, boven + (onder - boven) // 2 - maat // 2 - 2))
    beeld.save(pad, quality=88)


def main():
    gedaan = set(json.loads(KLAAR.read_text())) if KLAAR.exists() else set()
    namen = sys.argv[1:] or sorted(p.name for p in BEELD.glob("held-spin-*.webp") if p.name not in gedaan)
    for naam in namen:
        pad = Path(naam) if Path(naam).is_absolute() else BEELD / naam
        bewerk(pad)
        if pad.parent == BEELD:
            gedaan.add(pad.name)
        print("logo:", pad.name)
    KLAAR.write_text(json.dumps(sorted(gedaan)))


if __name__ == "__main__":
    main()
