# Proefzinnen met het AI-stemmodel Chatterbox (meertalig, draait op de videokaart).
# Gebruik: C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\ai-stemproef.py
# Resultaat: stemproef\ai-*.wav
from pathlib import Path

import soundfile as sf
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

MAP = Path(__file__).resolve().parent.parent / "stemproef"
# modelbestanden zelf gedownload (het automatisch downloaden bleef hangen)
MODEL = Path("C:/Users/robbi/Tools/ai-stem/model")
TEKST = {
    "spin": "Hoi! Ik ben de spinnenheld. Zullen we samen rekenen? Drie plus vier. Hoeveel spinnetjes zijn het samen? Super gedaan!",
    "ijzer": "Hoi! Ik ben de ijzerheld. Zullen we letters oefenen? Waarmee begint vis? IJzersterk, helemaal goed!",
}

# naam -> (voorbeeldstem of None voor de ingebouwde stem, expressie)
# De Piper-proefjes dienen als Nederlands stemvoorbeeld: Chatterbox neemt de klankkleur over,
# maar spreekt zelf veel natuurlijker.
STEMMEN = {
    "ai-standaard": (None, 0.5),
    "ai-alex": (MAP / "piper-alex-spin.wav", 0.6),
    "ai-pim": (MAP / "piper-pim-spin.wav", 0.6),
    "ai-ronnie": (MAP / "piper-ronnie-spin.wav", 0.6),
}

apparaat = "cuda" if torch.cuda.is_available() else "cpu"
print("apparaat:", apparaat)
model = ChatterboxMultilingualTTS.from_local(MODEL, device=apparaat)

for naam, (voorbeeld, expressie) in STEMMEN.items():
    for held, tekst in TEKST.items():
        opties = {"language_id": "nl", "exaggeration": expressie, "cfg_weight": 0.5}
        if voorbeeld:
            opties["audio_prompt_path"] = str(voorbeeld)
        wav = model.generate(tekst, **opties)
        sf.write(str(MAP / f"{naam}-{held}.wav"), wav.squeeze(0).cpu().numpy(), model.sr)
        print("klaar:", naam, held)
