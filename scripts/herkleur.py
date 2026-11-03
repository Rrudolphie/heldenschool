# Maakt een pak van Agent Vroem door het goedgekeurde klassieke plaatje (zwart met geel) om te kleuren.
# Voor houdingen waarbij het beeldmodel steeds de ogen of een cape tekent.
# Gebruik: C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\herkleur.py <pak> <houding>
#          bv. herkleur.py stealth blij  → public/beeld/held-ijzer-stealth-blij.webp
import colorsys
import sys
from pathlib import Path

import numpy as np
from PIL import Image

BEELD = Path(__file__).resolve().parent.parent / "public" / "beeld"
# per pak: kleur van het uniform (voor de donkere delen) en van de strepen (voor de gele delen), als RGB 0-1
PAKKEN = {
    "stealth": (None, (0.32, 0.33, 0.36)),
    "neon": ((0.27, 0.13, 0.45), (0.13, 0.85, 0.93)),
}


def herkleur(pak: str, houding: str):
    uniform, streep = PAKKEN[pak]
    beeld = Image.open(BEELD / f"held-ijzer-klassiek-{houding}.webp").convert("RGBA")
    data = np.array(beeld).astype(np.float32) / 255
    rgb, alfa = data[:, :, :3], data[:, :, 3:]
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in rgb.reshape(-1, 3)]).reshape(rgb.shape)
    tint, verzadiging, helder = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    # gele strepen en lampje: geel en flink verzadigd
    geel = (tint > 0.10) & (tint < 0.19) & (verzadiging > 0.45) & (helder > 0.35)
    # het uniform: donker en grijs (huid, vizier en ster blijven zoals ze zijn)
    donker = (helder < 0.30) & ((verzadiging < 0.35) | (helder < 0.12))
    # helm (bovenste 22%) en laarzen (onderste 12%) blijven zwart, net als bij de andere pakken
    rijen = np.arange(rgb.shape[0])[:, None]
    donker &= (rijen > rgb.shape[0] * 0.22) & (rijen < rgb.shape[0] * 0.88)
    uit = rgb.copy()
    uit[geel] = np.array(streep) * helder[geel][:, None] / max(streep) * 0.95
    if uniform:
        licht = helder[donker][:, None] / 0.30  # schaduw en glans van de stof behouden
        uit[donker] = np.clip(np.array(uniform) * (0.35 + 0.9 * licht), 0, 1)
    nieuw = np.concatenate([uit, alfa], axis=2)
    Image.fromarray((nieuw * 255).astype(np.uint8), "RGBA").save(BEELD / f"held-ijzer-{pak}-{houding}.webp", quality=88)
    print(f"klaar: held-ijzer-{pak}-{houding}.webp")


if __name__ == "__main__":
    herkleur(sys.argv[1], sys.argv[2])
