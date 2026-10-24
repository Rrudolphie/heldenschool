# Knipt Nederlandse stemvoorbeelden uit LibriVox-luisterboeken (auteursrechtvrij)
# en maakt met elk voorbeeld een proefzin, om per held een stem te kiezen.
# Gebruik: C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\voorbeeld-proef.py
import shutil
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

PROJECT = Path(__file__).resolve().parent.parent
BRON = Path("C:/Users/robbi/Tools/ai-stem/voorbeelden")
UIT = PROJECT / "stemproef"
MODEL = Path("C:/Users/robbi/Tools/ai-stem/model")
TEKST = "Hoi! Zullen we samen rekenen? Drie plus vier. Hoeveel spinnetjes zijn het samen? Super gedaan, helemaal goed!"


def knip(mp3: Path) -> Path:
    """15 seconden spraak na het LibriVox-intro (vanaf 70 s), zonder lange stiltes."""
    wav, sr = librosa.load(str(mp3), sr=24000, mono=True, offset=70, duration=25)
    stukken = librosa.effects.split(wav, top_db=35)
    spraak = np.concatenate([wav[a:b] for a, b in stukken])[: 15 * sr]
    uit = BRON / f"{mp3.stem}.wav"
    sf.write(str(uit), spraak, sr)
    return uit


def main():
    model = ChatterboxMultilingualTTS.from_local(MODEL, device="cuda")
    for mp3 in sorted(BRON.glob("*.mp3")):
        voorbeeld = knip(mp3)
        shutil.copy(voorbeeld, UIT / f"bron-{mp3.stem}.wav")  # om het origineel te kunnen beluisteren
        torch.manual_seed(7)
        wav = model.generate(TEKST, language_id="nl", audio_prompt_path=str(voorbeeld), exaggeration=0.5, cfg_weight=0.3)
        sf.write(str(UIT / f"ref-{mp3.stem}.wav"), wav.squeeze(0).cpu().numpy(), model.sr)
        print("klaar:", mp3.stem, flush=True)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
