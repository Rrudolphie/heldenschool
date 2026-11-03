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
import shutil
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
    "spin": (None, 0.65),  # Super-Kick: stoerder dan versie 6
    "schurk": (None, 0.9),  # de ingebouwde stem, extra expressief en daarna hoger gezet: een gek schurkenstemmetje
    # Agent Vroem: klankvoorbeeld uit een rechtenvrij LibriVox-luisterboek (zie voorbeeld-proef.py)
    "ijzer": (PROJECT / "scripts" / "stemvoorbeeld-vroem.wav", 0.65),  # LibriVox-stem "vorst"
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


# verdachte losse woorden (zie --verdacht): Whisper hoorde een ander woord
VERDACHT = {"ijzer|" + w for w in ("eend", "koe", "hoed", "tand", "pan", "tent", "koek", "deur", "jojo", "oog")} | {
    "spin|tien"}


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
    if not te_doen and not knippen and "--verdacht" not in sys.argv and "--koe" not in sys.argv:
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
                   + (0.3 if w is woorden[-1] else 0))
        # niet eerder beginnen dan het einde van "zeg", anders klinkt er "ik" of "echt" voor het woord
        i = woorden.index(doel)
        vroegst = woorden[i - 1]["end"] + 0.03 if i > 0 else 0
        begin = max(0, int(max(doel["start"] - 0.06, vroegst) * sr))
        eind = min(len(wav), int((doel["end"] + 0.15) * sr))
        return wav[begin:eind], doel["word"]

    if "--koe" in sys.argv:
        # "koe" (ijzer): de k klonk als een losse "K" ervoor. Meer draagzinnen waarin koe vloeiend volgt,
        # meer seeds en een strakkere knip vlak voor de k; alle kandidaten komen in stemproef/koe-kandidaten/
        z = next(z for z in zinnen if z["sleutel"] == "ijzer|koe")
        voorbeeld, expressie = STEMMEN["ijzer"]
        opties = {"language_id": "nl", "exaggeration": expressie, "cfg_weight": CFG,
                  "audio_prompt_path": str(voorbeeld)}
        map_ = PROJECT / "stemproef" / "koe-kandidaten"
        map_.mkdir(parents=True, exist_ok=True)
        pad = UIT / z["bestand"]
        if pad.exists():
            shutil.copy2(pad, PROJECT / "stemproef" / "stem-oud" / ("koe-voor-koe.mp3"))
        kandidaten = []
        for n, draag in enumerate(["Kijk, een koe.", "Dat is een koe.", "De koe zegt boe.", "Ik zie een koe.",
                                   "Daar staat een koe."]):
            for seed in (3, 11, 23, 37, 51, 77):
                try:
                    torch.manual_seed(seed)
                    wav = tts.generate(draag, **opties).squeeze(0).cpu().numpy()
                except (IndexError, RuntimeError):
                    continue
                uitslag = oor.transcribe(librosa.resample(wav, orig_sr=tts.sr, target_sr=16000), language="nl",
                                         fp16=True, word_timestamps=True)
                woorden = [w for s in uitslag["segments"] for w in s.get("words", [])]
                koe = [w for w in woorden if difflib.SequenceMatcher(None, gewoon(w["word"]), "koe").ratio() >= 0.6]
                if not koe:
                    continue
                w = koe[0]
                # begin vlak voor de k: niet eerder dan het einde van het vorige woord
                i = woorden.index(w)
                vroegst = woorden[i - 1]["end"] + 0.02 if i > 0 else 0
                knip = wav[max(0, int(max(w["start"] - 0.02, vroegst) * tts.sr)):
                           min(len(wav), int((w["end"] + 0.12) * tts.sr))]
                if len(knip) < tts.sr * 0.15:
                    continue
                knip = nabewerken(knip, tts.sr)
                score = difflib.SequenceMatcher(None, gewoon(luister(knip, tts.sr)), "koe").ratio()
                sf.write(str(map_ / f"koe-{n}-{seed}-{score:.2f}.mp3"), knip, tts.sr, format="MP3")
                kandidaten.append((score, -len(knip), n, seed, knip))
                print(f"koe zin {n} seed {seed}: score {score:.2f}, {len(knip) / tts.sr:.2f} s", flush=True)
        print(f"{len(kandidaten)} kandidaten in {map_}; kies er een na de k-meting (stemproef/keuring/keur_stem.py)",
              flush=True)
        return

    if "--verdacht" in sys.argv:
        # verdachte losse woorden opnieuw proberen met andere draagzinnen en seeds; een nieuwe
        # versie vervangt de oude alleen als de Whisper-score hoger is (oude mp3's gaan eerst in een reservekopie)
        reserve = PROJECT / "stemproef" / "stem-oud"
        reserve.mkdir(parents=True, exist_ok=True)
        draagzinnen = ["Dit woord is: {}.", "Kijk, een {}.", "Luister goed, ik zeg: {}."]
        for held in ("spin", "ijzer"):  # eerst de ingebouwde stem, dan het stemvoorbeeld van Agent Vroem
            voorbeeld, expressie = STEMMEN[held]
            for z in zinnen:
                if z["sleutel"] not in VERDACHT or z["held"] != held:
                    continue
                pad = UIT / z["bestand"]
                if pad.exists():
                    shutil.copy2(pad, reserve / z["bestand"])
                oud = rapport.get(z["sleutel"], {}).get("score", -1.0)
                opties = {"language_id": "nl", "exaggeration": expressie, "cfg_weight": CFG}
                if voorbeeld:
                    opties["audio_prompt_path"] = str(voorbeeld)
                woord = z["uitspraak"].rstrip("!.?")
                beste = (oud, None, "")
                for draag in draagzinnen:
                    for seed in (11, 23, 37):
                        try:
                            torch.manual_seed(seed)
                            wav = tts.generate(draag.format(woord), **opties).squeeze(0).cpu().numpy()
                        except (IndexError, RuntimeError):
                            continue
                        wav, _ = knip_woord(wav, tts.sr, z["uitspraak"])
                        if wav is None or len(wav) < tts.sr * 0.15:
                            continue
                        wav = nabewerken(wav, tts.sr)
                        gehoord = luister(wav, tts.sr)
                        score = difflib.SequenceMatcher(None, gewoon(gehoord), gewoon(z["uitspraak"])).ratio()
                        if score > beste[0]:
                            beste = (score, wav, gehoord)
                    if beste[0] >= GOED_GENOEG:
                        break
                score, wav, gehoord = beste
                if wav is not None:
                    sf.write(str(pad), wav, tts.sr, format="MP3")
                    rapport[z["sleutel"]] = {"score": round(score, 2), "gehoord": gehoord.strip()}
                    RAPPORT.write_text(json.dumps(rapport, ensure_ascii=False, indent=1), encoding="utf-8")
                print(f"{z['sleutel']}: {oud:.2f} -> {score:.2f}{'' if wav is not None else ' (oude blijft)'}", flush=True)
        return

    # eerst de stemmen met de ingebouwde stem (Super-Kick, schurk), daarna Agent Vroem: een
    # stemvoorbeeld vervangt de ingebouwde stem in het model
    for held in ("spin", "schurk", "ijzer"):
        voorbeeld, expressie = STEMMEN[held]
        lijst = [z for z in te_doen if z["held"] == held]
        for i, z in enumerate(lijst, 1):
            opties = {"language_id": "nl", "exaggeration": expressie, "cfg_weight": CFG}
            if voorbeeld:
                opties["audio_prompt_path"] = str(voorbeeld)
            beste = (-1.0, None, "")
            pogingen = MAX_POGINGEN  # een klank stopt na de eerste geslaagde poging
            # losse woorden klinken in hun eentje vaak Engels: dan in een Nederlandse draagzin
            # inspreken en het woord eruit knippen
            los_woord = " " not in z["uitspraak"].strip() and not is_klank(z["uitspraak"])
            for poging in range(pogingen):
                tekst = z["uitspraak"] if poging < 2 else z["uitspraak"] + "."
                if is_klank(z["uitspraak"]) and len(z["uitspraak"]) <= 2 and poging >= 1:
                    # twee letters is soms te kort voor het model: iets langere schrijfwijze
                    tekst = (z["uitspraak"] + z["uitspraak"][-1], z["uitspraak"] + ".")[poging % 2]
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
                    if len(wav) < tts.sr * 0.2:
                        continue  # bijna niets te horen: volgende schrijfwijze proberen
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
