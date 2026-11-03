# Heldenschool

Nederlandse leerapp voor de iPad (PWA) voor een kind in groep 2/3: rekenen met Super-Kick (voetbalheld), letters met Agent Vroem (politieheld), en een Mix-missie. Gratis, werkt offline. Online: https://rrudolphie.github.io/heldenschool/ (repo Rrudolphie/heldenschool; elke push naar main zet de site automatisch online). Plan en besluiten per versie staan in PLAN.md, de stemmen en plaatjes in README.md.

Deze repo is openbaar: zet hier nooit de naam van het kind of andere persoonlijke gegevens neer. De naam komt alleen via het ouderscherm en blijft op de iPad (thuis heet Super-Kick dan "Super-[naam]").

## Samenwerken
- Praat Nederlands, in eenvoudige taal, en geef een advies.
- Stel vragen als klikbare opties (AskUserQuestion), met je advies als eerste optie en "(Aanbevolen)" achter het label.
- Grote klussen (veel plaatjes of stemmen): eerst een kleine proef in het echte spelscherm laten zien, pas na akkoord de rest maken.
- Geef bij lange taken een percentage, "x van y" en de verwachte eindtijd. Wees verder zuinig met tijd en tokens: korte berichten.
- Commit en push alleen als daarom gevraagd wordt.
- Geen betaalde diensten. Alles draait lokaal of gratis. Vul nooit zelf tokens of wachtwoorden in.
- De site is openbaar: alleen eigen ontwerpen. Geen kenmerken, namen of logo's van bestaande stripfiguren (Marvel, DC en dergelijke), echte voetballers of clubs, of een echt politielogo.

## Ontwerpregels
- Eén stijl: stoere 3D-actiefilmstijl voor helden, schurken en achtergronden. Niet mengen met strip, emoji of getekende SVG.
- Helden dragen een helm met een dicht vizier: ogen zijn NOOIT te zien. Bij Super-Kick zijn mond en kin wel te zien; een neuspuntje net onder het vizier mag (besluit gebruiker: een natuurlijk gezicht gaat voor). Agent Vroem heeft een helemaal dicht gezicht (zie hieronder). Controleer elk nieuw heldenplaatje hierop.
- Een held is in elke houding (normaal, blij, denk) dezelfde figuur: zelfde helm, vizier, gezicht, postuur en kleuren.
- Super-Kick: echte voetballer (shirt, broek, kousen, voetbalschoenen), helm met spiegelvizier, geen cape, geen handschoenen, geen rugnummer. Op de schoenen staat alleen het eigen K-logo (`scripts/schoenlogo.py`, op verzoek van de gebruiker), nooit een streepje van een sportmerk.
- Agent Vroem (nieuw ontwerp, besluit gebruiker 2026-11-03, voorbeeld `stemproef/definitief/chatgpt/resultaten/held-ijzer-nieuw-normaal.webp`): zwart uniform met gele reflectiestrepen op schouders, middel en mouwen, zwarte riem, zwarte handschoenen en kistjes, gespierd postuur. Zwarte integraalhelm met zwart vizier en zwart gezichtsmasker: geen ogen, mond of kin zichtbaar. Geen ster, portofoon of lampje. Geen wapens, holster, emblemen of logo's. Blij en denken zie je alleen aan de houding.
- Schurken: stoer maar niet eng voor groep 2/3, zonder wapens.
- Het beeldmodel leest maar 256 woorddelen: houd omschrijvingen kort, anders vallen de laatste afspraken eraf.
- Geen flikkerende AI-filmpjes: beweging komt uit CSS.
- Achtergronden bevatten geen held; de app zet het goedgekeurde losgeknipte heldenplaatje erop.
- Houdingen (blij, nadenken) komen uit één basisplaatje per pak: `scripts/houding.py` tekent alleen de armen opnieuw, de rest blijft pixel voor pixel gelijk. Zo blijven pak, helm en proporties in alle houdingen hetzelfde. Is er geen goede versie van een houding, zet die dan in WEGLATEN in scripts/maak-flux.py; de app toont dan de gewone houding van dat pak.
- `scripts/herkleur.py` maakt een pak van Agent Vroem door het goedgekeurde klassieke plaatje om te kleuren (voor houdingen waarbij het model steeds ogen of een cape tekent).

## Techniek
- Vite + React + TypeScript. Starten: `npm run dev` (poort 5174). Controleren: `npx tsc --noEmit -p .` en `npm run build`.
- localStorage-sleutel en IndexedDB heten bewust nog `spider-sommen`, zodat opgeslagen gegevens behouden blijven. Niet hernoemen.
- Intern heten de helden nog `spin` (Super-Kick) en `ijzer` (Agent Vroem), net als de bestandsnamen van de plaatjes. Zo blijven sterren en pakken bewaard. Niet hernoemen.
- Geluid loopt door één wachtrij in src/stem.ts. Sprekers: `spin`, `ijzer` en `schurk`.
- Nieuwe zinnen in src/zinnen.ts, daarna `npx tsx scripts/zinnen-lijst.ts` en `C:\Users\robbi\Tools\ai-stem\venv\Scripts\python.exe scripts\maak-stem.py`. Opties: `--zwak` (zinnen met een Whisper-score onder 0,8 opnieuw), `--knip` (stilte en naklank voor en na de zin wegknippen), `--verdacht` (twijfelwoorden opnieuw met andere draagzinnen; een nieuwe versie telt alleen bij een hogere score, de oude gaat naar stemproef/stem-oud), `--opnieuw` (alles).
- Werkwijze met agents: de hoofdchat keurt alles en de gebruiker geeft het eindakkoord. Agent Visual maakt plaatjes, Agent Sound stemmen, Agent Repair repareert code, Agent Trail and error test, Agent Release controleert privacy en merken en bereidt het online zetten voor. Niemand commit, pusht of publiceert zonder akkoord via de hoofdchat.
- Plaatjes: `C:\Users\robbi\Tools\ai-beeld\venv\Scripts\python.exe scripts\maak-flux.py` (`--kandidaten [naam]`, `--alleen <begin van de naam>`). Bestaande plaatjes worden overgeslagen via public/beeld/.flux-klaar.json.
- De videokaart heeft 8 GB: draai beeld en stem nooit tegelijk.
- In de Bash-tool blokkeert Windows soms DLL's van scipy (librosa); draai de stem-scripts dan via PowerShell.
