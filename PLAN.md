# Heldenschool – plan

Leerapp voor de iPad voor een kind in groep 2 en 3: rekenen met **Super-Kick**, letters met **Agent Vroem**, en een Mix-missie met allebei. Gratis, werkt offline.

## Uitgangspunten
- **Apparaat:** iPad, bediend met tikken. Grote knoppen.
- **Vorm:** web-app (PWA) met Vite + React + TypeScript. Op de iPad: Safari → Deel → "Zet op beginscherm". Werkt offline.
- **Online zetten:** GitHub Pages (openbare repository). Er staan geen persoonlijke gegevens in de code.
- **Kosten:** geen. Beeld en stem worden lokaal op de pc gemaakt.
- **Eigen ontwerp:** de helden, schurken en namen zijn eigen bedenksels, zonder logo's of kenmerken van bestaande stripfiguren.

## De helden (versie 7)
- **Super-Kick (rekenen):** een voetbalheld. Blauw voetbaltenue, blauwe helm met een dicht vizier over ogen en neus, mond vrij. Superkracht: de **superbal**.
  Thuis heet hij "Super-[naam]": de naam wordt op het ouderscherm ingevuld en blijft op de iPad.
- **Agent Vroem (letters):** een politieheld. Zwart uniform met gele reflectiestrepen op schouders, middel en mouwen, zwarte riem, handschoenen en kistjes, gespierd postuur. Zwarte integraalhelm met zwart vizier en zwart gezichtsmasker: helemaal geen gezicht te zien. Geen ster, portofoon of lampje. Rijdt in een **zwarte sportwagen** met gele streep en lichtbalk. Superkracht: het **vangnet**.
- Stijl: stoere 3D-actiefilmstijl, net als de schurken en de verhaalplaatjes.
- Bewust **niet**: echte voetballers of hun rugnummer, clublogo's, een echt politielogo, wapens of een holster, een pratende of transformerende auto.

## Plaatjes maken (versie 7)
- Eén goedgekeurd basisplaatje per pak (houding "normaal"). Blij en nadenken worden daaruit gemaakt: `scripts/houding.py` tekent alleen de armen en handen opnieuw; hoofd, helm, romp, broek, benen en schoenen worden pixel voor pixel teruggezet. Zo zijn alle houdingen even groot en hetzelfde pak. (Het script is nog in ontwikkeling.)
- `scripts/schoenlogo.py`: het beeldmodel tekent soms een sportmerkstreepje op de schoenen. Het script strijkt de schoenen glad en zet er een eigen witte K met donkere rand op, op verzoek van de gebruiker.
- `scripts/herkleur.py`: een pak van Agent Vroem uit het klassieke plaatje omkleuren, voor houdingen waarbij het model steeds ogen of een cape tekent.
- `scripts/maak-icoon.py`: de app-icoontjes uit de twee klassieke helden.
- Controle van elk heldenplaatje: ogen nooit te zien (Super-Kick: een neuspuntje onder het vizier mag; Agent Vroem: helemaal dicht), geen cape, geen holster of wapen, geen embleem of logo (alleen het eigen K-logo op de schoenen van Super-Kick), in alle houdingen dezelfde figuur.
- Herkomst: de blij- en denkplaatjes en het nieuwe ontwerp van Agent Vroem zijn door de gebruiker zelf met ChatGPT gemaakt en daarna met eigen scripts bewerkt (zie README).

## Rekenen
- Niveaus: tellen (hoeveel ballen?), cijfers herkennen, plus en min tot 10 en tot 20.
- **Het niveau groeit mee:** goed en snel gaat omhoog, veel fouten een stapje terug.
- **Antwoorden:** 3 grote knoppen.
- **Bij een fout antwoord:** troost en hulp: de ballen lichten één voor één op en de foute knop verdwijnt.
- Plussommen: de twee groepen ballen hebben een andere kleur gloed (blauw en oranje).
- **Rondes van 10**, met aan het eind een feestje.

## Letters
- Kleine letters in een schoolachtig lettertype (Andika). De ouder vinkt aan welke letters hij al kent.
- Oefeningen: beginklank, letter herkennen, hakken en plakken (standaard uit), woordje lezen (standaard uit).
- Plaatjes zijn emoji van de iPad.

## Sterren en pakken
- Elke goede beurt levert een ster op voor de held van die opdracht. Sterren worden niet uitgegeven.
- Per held 7 pakken, vrij bij 0, 10, 25, 40, 60, 80 en 100 sterren.
  - Super-Kick: Klassiek, Nacht, Jungle, Goud, IJs, Galaxy, Vuur.
  - Agent Vroem: Klassiek, Zilver, Stealth, Ruimte, Goud, Neon, Lava.
- Elk pak in 3 houdingen: gewoon, blij (vuist omhoog) en nadenken (vinger aan de kin).

## Avonturen
- Elke missie heeft een **stoere maar niet enge schurk** en een probleem dat de held stap voor stap oplost.
- Het verhaalplaatje vult het scherm; bij elk goed antwoord wordt één ding gered.
- Na 3, 6 en 9 goede antwoorden: een stripmoment. Super-Kick schiet de superbal ("GOAL!"), Agent Vroem gooit het vangnet ("HALT!").
- Einde: het vangnet valt over de schurk en de zwarte auto van Agent Vroem neemt hem mee.
- **Super-Kick (rekenen):** Robot Bolt (stoplichten), Kat Kladder (ballonnen), de Mopperwolk (regen op de kermis), Professor Wiebel (bouten uit de brug), de Snoepslurper (snoepwinkel).
- **Agent Vroem (letters):** Letterdief Lodewijk (letters van het bord), de Robotkrab (lichtjes in de haven), Mevrouw Mist (mist over de stad), de Magneetmuis (fietsen en auto's), Kapitein Kriebel (piratenpapegaai met de schatkist).

## Geluid
- Alle vaste zinnen zijn vooraf ingesproken met het lokale AI-stemmodel Chatterbox (MIT-licentie) en gecontroleerd door de spraakherkenner Whisper.
- **Super-Kick:** de ingebouwde stem van Chatterbox. **Agent Vroem:** Chatterbox met als klankvoorbeeld een stuk uit een rechtenvrij LibriVox-luisterboek. **Schurk:** de ingebouwde stem, expressiever en hoger gezet.
- Eén spreker met wachtrij: er klinkt nooit iets door elkaar.
- Eigen opnames (naam, complimenten, klanken) maakt de ouder op het ouderscherm; ze blijven op de iPad.

- Kwaliteit: Whisper luistert elke opname na. `maak-stem.py` heeft opties voor zwakke opnames (`--zwak`), wegknippen van stilte en naklank (`--knip`) en twijfelwoorden (`--verdacht`). Losse woorden blijven moeilijk; die keurt de gebruiker liever zelf.

## Werkwijze met agents
- De **hoofdchat** zet de stappen uit en keurt alles. De gebruiker geeft het eindakkoord.
- **Agent Visual** maakt en keurt plaatjes. **Agent Sound** maakt stemmen. **Agent Repair** repareert code. **Agent Trail and error** speelt de app en maakt een foutenlijst. **Agent Release** controleert privacy en merken, houdt de documentatie bij en bereidt het online zetten voor.
- Geen agent commit, pusht, maakt een repository of publiceert zonder akkoord via de hoofdchat.
- Agents mogen onderling overleggen, grote bevindingen komen in een gedeelde notitiemap.

## Ouderscherm
- Slotje rechtsonder 2,5 seconde vasthouden.
- Naam, niveaus en voortgang per wereld, letterraster, schakelaars voor hakken en plakken en woordjes lezen, opnames, voortgang wissen.

## Geschiedenis
- Versie 1 en 2: rekenapp met één held, pakken, ouderscherm en eigen opnames.
- Versie 3: Heldenschool met rekenen, letters en de Mix-missie, en een tweede held.
- Versie 4: vooraf ingesproken AI-stemmen, nieuw ontwerp en AI-plaatjes.
- Versie 5: avonturen met schurken, het hele scherm als verhaal, meegroeien tot 20.
- Versie 6: één 3D-stijl, stripmomenten en een duidelijk einde.
- **Versie 7:** twee nieuwe, eigen helden (Super-Kick en Agent Vroem) in een stoere 3D-stijl, stoerdere schurken en verhaalplaatjes, superbal en vangnet, nieuw icoon en een nieuwe stem voor Agent Vroem. Daarna verhuist de app naar een nieuwe, schone repository.

## Na versie 7
- De code in `src/` verhuist in één keer naar vaste mappen: `spel/`, `oefenvormen/`, `inhoud/`, `schermen/`, `onderdelen/`, `geluid/`, `opslag/` en `stijl/`, met `tests/` ernaast (besluit gebruiker, 3 november 2026). Voorbeeld: het open-source spel battle-city (MIT). Agent Repair doet de verhuizing, daarna `npx tsc --noEmit -p .` en `npm run build`.
- De handgeschreven service worker wordt vervangen door `vite-plugin-pwa`.
- Later: Capacitor voor de App Store.
