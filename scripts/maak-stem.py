# Spreekt alle zinnen uit scripts/zinnen.json in met het AI-stemmodel Chatterbox
# en zet ze als mp3 in public/stem/. Zinnen die al bestaan worden overgeslagen.
#
# Kwaliteitscontrole: de spraakherkenner Whisper luistert elke opname na. Klopt de
# herkende tekst niet goed met de bedoelde zin (gebrabbel, herhalingen, verkeerde
# woorden), dan wordt de zin opnieuw gemaakt en de beste versie bewaard.
#
# Gebruik (eerst de lijst bijwerken):
#   npx tsx scripts/zinnen-lijst.ts
#   C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\maak-stem.py            (alleen nieuwe zinnen)
#   C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\maak-stem.py --opnieuw  (alles opnieuw)
import difflib
import json
import re
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch
import whisper
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

PROJECT = Path(__file__).resolve().parent.parent
UIT = PROJECT / "public" / "stem"
RAPPORT = PROJECT / "scripts" / "stem-kwaliteit.json"
MODEL = Path("C:/Users/robbi/Tools/ai-stem/model")

# Per held: stemvoorbeeld (None = ingebouwde stem van het model) en expressie.
STEMMEN = {
    "spin": (None, 0.5),
    "schurk": (None, 0.9),  # de ingebouwde stem, extra expressief en daarna hoger gezet: een gek schurkenstemmetje
    "ijzer": (PROJECT / "scripts" / "stemvoorbeeld-ijzer.wav", 0.6),
}
SCHURK_HOGER = 4  # halve tonen
CFG = 0.3  # lager = rustiger tempo en duidelijker uitgesproken
GOED_GENOEG = 0.9  # overeenkomst met de bedoelde tekst waarbij we stoppen met proberen
MAX_POGINGEN = 4

GETALLEN = {"nul": "0", "een": "1", "één": "1", "twee": "2", "drie": "3", "vier": "4", "vijf": "5",
            "zes": "6", "zeven": "7", "acht": "8", "negen": "9", "tien": "10",
            "elf": "11", "twaalf": "12", "dertien": "13", "veertien": "14", "vijftien": "15", "zestien": "16",
            "zeventien": "17", "achttien": "18", "negentien": "19", "twintig": "20"}


def gewoon(tekst: str) -> str:
    """Tekst vergelijkbaar maken: kleine letters, zonder leestekens, getallen als cijfers."""
    woorden = re.sub(r"[^\w\s]", " ", tekst.lower()).split()
    return " ".join(GETALLEN.get(w, w) for w in woorden)


# de schrijfwijzen van losse klanken (zie KLANK_UITSPRAAK in src/letters.ts)
KLANKEN = {"ah", "eh", "ih", "oh", "uh", "aa", "ee", "oo", "uu", "oe", "ie", "eu", "ui", "ei", "buh", "duh", "fff",
           "ggg", "hhh", "juh", "kuh", "lll", "mmm", "nnn", "puh", "rrr", "sss", "tuh", "vvv", "wuh", "zzz"}


def is_klank(tekst: str) -> bool:
    """Losse klanken ('mmm', 'buh') kan Whisper niet beoordelen."""
    return tekst in KLANKEN


def nabewerken(wav: np.ndarray, sr: int) -> np.ndarray:
    """Stilte aan begin en eind weghalen, kort pauzetje erbij en het volume gelijktrekken."""
    wav, _ = librosa.effects.trim(wav, top_db=35)
    pauze = np.zeros(int(sr * 0.06), dtype=wav.dtype)
    wav = np.concatenate([pauze, wav, pauze])
    piek = np.max(np.abs(wav)) or 1.0
    return (wav / piek * 0.89).astype(np.float32)


def main():
    opnieuw = "--opnieuw" in sys.argv
    zinnen = json.loads((PROJECT / "scripts" / "zinnen.json").read_text(encoding="utf-8"))
    UIT.mkdir(parents=True, exist_ok=True)
    rapport = {} if opnieuw or not RAPPORT.exists() else json.loads(RAPPORT.read_text(encoding="utf-8"))

    # oude bestanden opruimen: van zinnen die niet meer bestaan, of alles bij --opnieuw
    nodig = {z["bestand"] for z in zinnen}
    for f in UIT.glob("*.mp3"):
        if opnieuw or f.name not in nodig:
            f.unlink()
    # --zwak: zinnen met een lage score (onder 0,8) opnieuw proberen
    if "--zwak" in sys.argv:
        for z in zinnen:
            r = rapport.get(z["sleutel"])
            if r and r["gehoord"] != "(klank)" and r["score"] < 0.8:
                (UIT / z["bestand"]).unlink(missing_ok=True)

    knippen = "--knip" in sys.argv
    te_doen = [z for z in zinnen if not (UIT / z["bestand"]).exists()]
    print(f"{len(zinnen)} zinnen, nog te maken: {len(te_doen)}", flush=True)
    if not te_doen and not knippen:
        return

    oor = whisper.load_model("turbo", device="cuda")

    def luister(wav: np.ndarray, sr: int) -> str:
        return oor.transcribe(librosa.resample(wav, orig_sr=sr, target_sr=16000), language="nl", fp16=True)["text"]

    def knip_zin(wav: np.ndarray, sr: int, tekst: str) -> np.ndarray:
        """Knip alles voor het eerste en na het laatste woord van de bedoelde zin weg
        (ademhaling, gemompel of een naklank die het model er soms bij maakt)."""
        uitslag = oor.transcribe(librosa.resample(wav, orig_sr=sr, target_sr=16000), language="nl", fp16=True,
                                 word_timestamps=True)
        woorden = [w for s in uitslag["segments"] for w in s.get("words", [])]
        doel = gewoon(tekst).split()
        if not woorden or not doel:
            return wav

        def lijkt(gehoord: str, woord: str) -> bool:
            return difflib.SequenceMatcher(None, gewoon(gehoord), woord).ratio() >= 0.6

        eerste = next((w for w in woorden if lijkt(w["word"], doel[0])), woorden[0])
        laatste = next((w for w in reversed(woorden) if lijkt(w["word"], doel[-1])), woorden[-1])
        if eerste["start"] >= laatste["end"]:
            return wav
        begin = max(0, int((eerste["start"] - 0.08) * sr))
        eind = min(len(wav), int((laatste["end"] + 0.22) * sr))
        return wav[begin:eind]

    def kort_pauzes(wav: np.ndarray, sr: int) -> np.ndarray:
        """Te lange pauzes tussen woorden (waarin het model soms hoorbaar ademhaalt)
        vervangen door een korte stilte."""
        uitslag = oor.transcribe(librosa.resample(wav, orig_sr=sr, target_sr=16000), language="nl", fp16=True,
                                 word_timestamps=True)
        woorden = [w for s in uitslag["segments"] for w in s.get("words", [])]
        stukken, vorige = [], 0
        for a, b in zip(woorden, woorden[1:]):
            van = int((a["end"] + 0.06) * sr)  # een klein beetje naklank van het woord laten staan
            tot = int((b["start"] - 0.05) * sr)
            if tot - van > int(0.22 * sr):  # gat van meer dan ~0,3 s: inkorten
                stukken.append(wav[vorige:van])
                stukken.append(np.zeros(int(0.12 * sr), dtype=wav.dtype))
                vorige = tot
        stukken.append(wav[vorige:])
        return np.concatenate(stukken)

    def pauzes_in_een_keer(wav: np.ndarray, sr: int) -> np.ndarray:
        """Snelle variant voor bestaande opnames: één keer luisteren en daarmee alleen
        te lange pauzes tussen woorden inkorten (begin en eind zijn al eerder geknipt)."""
        uitslag = oor.transcribe(librosa.resample(wav, orig_sr=sr, target_sr=16000), language="nl", fp16=True,
                                 word_timestamps=True)
        woorden = [w for s in uitslag["segments"] for w in s.get("words", [])]
        stukken, vorige = [], 0
        for a, b in zip(woorden, woorden[1:]):
            van = int((a["end"] + 0.06) * sr)
            tot = int((b["start"] - 0.05) * sr)
            if tot - van > int(0.22 * sr):
                stukken.append(wav[vorige:van])
                stukken.append(np.zeros(int(0.12 * sr), dtype=wav.dtype))
                vorige = tot
        stukken.append(wav[vorige:])
        return np.concatenate(stukken)

    if knippen:
        # bestaande opnames bijwerken, zonder opnieuw in te spreken
        for i, z in enumerate(zinnen, 1):
            pad = UIT / z["bestand"]
            if not pad.exists() or is_klank(z["uitspraak"]) or " " not in z["uitspraak"].strip():
                continue  # losse woorden en klanken hebben geen pauzes tussen woorden
            wav, sr = librosa.load(str(pad), sr=None, mono=True)
            sf.write(str(pad), nabewerken(pauzes_in_een_keer(wav, sr), sr), sr, format="MP3")
            print(f"bijgewerkt {i}/{len(zinnen)}: {z['tekst']}", flush=True)
        RAPPORT.write_text(json.dumps(rapport, ensure_ascii=False, indent=1), encoding="utf-8")
        if not te_doen:
            return

    tts = ChatterboxMultilingualTTS.from_local(MODEL, device="cuda")

    def knip_woord(wav: np.ndarray, sr: int, woord: str):
        """Zoek met Whisper waar het woord in de draagzin zit en knip het eruit."""
        uitslag = oor.transcribe(librosa.resample(wav, orig_sr=sr, target_sr=16000), language="nl", fp16=True,
                                 word_timestamps=True)
        woorden = [w for s in uitslag["segments"] for w in s.get("words", [])]
        if not woorden:
            return None, ""
        # het woord na "zeg:" is het laatste woord van de draagzin
        doel = max(woorden, key=lambda w: difflib.SequenceMatcher(None, gewoon(w["word"]), gewoon(woord)).ratio()
                   + (0.01 if w is woorden[-1] else 0))
        begin = max(0, int((doel["start"] - 0.06) * sr))
        eind = min(len(wav), int((doel["end"] + 0.15) * sr))
        return wav[begin:eind], doel["word"]

    # eerst de stemmen met de ingebouwde stem (spinnenheld, schurk), daarna de ijzerheld: een
    # stemvoorbeeld vervangt de ingebouwde stem in het model
    for held in ("spin", "schurk", "ijzer"):
        voorbeeld, expressie = STEMMEN[held]
        lijst = [z for z in te_doen if z["held"] == held]
        for i, z in enumerate(lijst, 1):
            opties = {"language_id": "nl", "exaggeration": expressie, "cfg_weight": CFG}
            if voorbeeld:
                opties["audio_prompt_path"] = str(voorbeeld)
            beste = (-1.0, None, "")
            pogingen = 1 if is_klank(z["uitspraak"]) else MAX_POGINGEN
            # losse woorden klinken in hun eentje vaak Engels: dan in een Nederlandse draagzin
            # inspreken en het woord eruit knippen
            los_woord = " " not in z["uitspraak"].strip() and not is_klank(z["uitspraak"])
            for poging in range(pogingen):
                tekst = z["uitspraak"] if poging < 2 else z["uitspraak"] + "."
                if los_woord:
                    tekst = f"Luister goed, ik zeg: {z['uitspraak'].rstrip('!.?')}."
                try:
                    torch.manual_seed(7 + poging)
                    wav = tts.generate(tekst, **opties).squeeze(0).cpu().numpy()
                except (IndexError, RuntimeError):
                    continue  # te korte tekst voor het model
                if los_woord:
                    wav, _ = knip_woord(wav, tts.sr, z["uitspraak"])
                    if wav is None or len(wav) < tts.sr * 0.15:
                        continue
                elif not is_klank(z["uitspraak"]):
                    wav = kort_pauzes(knip_zin(wav, tts.sr, z["uitspraak"]), tts.sr)
                wav = nabewerken(wav, tts.sr)
                if is_klank(z["uitspraak"]):
                    beste = (1.0, wav, "(klank)")
                    break
                gehoord = luister(wav, tts.sr)
                score = difflib.SequenceMatcher(None, gewoon(gehoord), gewoon(z["uitspraak"])).ratio()
                if score > beste[0]:
                    beste = (score, wav, gehoord)
                if score >= GOED_GENOEG:
                    break
            score, wav, gehoord = beste
            if wav is None:
                print(f"{held} {i}/{len(lijst)}: OVERGESLAGEN {z['tekst']}", flush=True)
                continue
            if held == "schurk":  # pas na de controle: Whisper verstaat de gewone stem beter
                wav = librosa.effects.pitch_shift(wav, sr=tts.sr, n_steps=SCHURK_HOGER)
            sf.write(str(UIT / z["bestand"]), wav, tts.sr, format="MP3")
            rapport[z["sleutel"]] = {"score": round(score, 2), "gehoord": gehoord.strip()}
            RAPPORT.write_text(json.dumps(rapport, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"{held} {i}/{len(lijst)} [{score:.2f}]: {z['tekst']}", flush=True)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
