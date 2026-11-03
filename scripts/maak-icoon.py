# Maakt de app-icoontjes uit de twee goedgekeurde heldenplaatjes (klassiek pak):
# links Super-Kick op blauw, rechts Agent Vroem op zwart met een gele streep.
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-icoon.py
from pathlib import Path

from PIL import Image, ImageDraw

PROJECT = Path(__file__).resolve().parent.parent
BEELD = PROJECT / "public" / "beeld"
MAAT = 1024


def bovenlijf(naam: str, hoogte: int) -> Image.Image:
    """Hoofd en schouders van een held, geschaald naar de gevraagde hoogte."""
    held = Image.open(BEELD / naam).convert("RGBA")
    held = held.crop((0, 0, held.width, int(held.height * 0.55)))
    return held.resize((int(held.width * hoogte / held.height), hoogte), Image.LANCZOS)


def icoon() -> Image.Image:
    vlak = Image.new("RGBA", (MAAT, MAAT))
    teken = ImageDraw.Draw(vlak)
    teken.polygon([(0, 0), (MAAT * 0.62, 0), (MAAT * 0.38, MAAT), (0, MAAT)], fill=(29, 143, 225))
    teken.polygon([(MAAT * 0.62, 0), (MAAT, 0), (MAAT, MAAT), (MAAT * 0.38, MAAT)], fill=(24, 24, 27))
    teken.line([(MAAT * 0.62, 0), (MAAT * 0.38, MAAT)], fill=(255, 210, 63), width=34)
    kick = bovenlijf("held-spin-klassiek-normaal.webp", 900)
    vroem = bovenlijf("held-ijzer-klassiek-normaal.webp", 900)
    vlak.alpha_composite(kick, (int(MAAT * 0.27 - kick.width / 2), MAAT - kick.height + 60))
    vlak.alpha_composite(vroem, (int(MAAT * 0.73 - vroem.width / 2), MAAT - vroem.height + 60))
    return vlak.convert("RGB")


def main():
    groot = icoon()
    for naam, maat in (("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
        groot.resize((maat, maat), Image.LANCZOS).save(PROJECT / "public" / naam, optimize=True)
        print("klaar:", naam)


if __name__ == "__main__":
    main()
