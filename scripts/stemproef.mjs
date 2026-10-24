// Maakt proefzinnen met verschillende stemmen, om er één per held te kiezen.
// Gebruik: node scripts/stemproef.mjs  → bestanden in stemproef/
import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const MAP = 'stemproef'
const PIPER = 'C:/Users/robbi/Tools/piper'
const TEKST = {
  spin: 'Hoi! Ik ben de spinnenheld. Zullen we samen rekenen? Drie plus vier. Hoeveel spinnetjes zijn het samen? Super gedaan!',
  ijzer: 'Hoi! Ik ben de ijzerheld. Zullen we letters oefenen? Waarmee begint vis? IJzersterk, helemaal goed!',
}

// [bestandsnaam, stem, toonhoogte, tempo, meertalig]
const EDGE = [
  ['edge-fenna', 'nl-NL-FennaNeural'],
  ['edge-colette', 'nl-NL-ColetteNeural'],
  ['edge-maarten', 'nl-NL-MaartenNeural'],
  ['edge-dena-be', 'nl-BE-DenaNeural'],
  ['edge-arnaud-be', 'nl-BE-ArnaudNeural'],
  ['edge-andrew-meertalig', 'en-US-AndrewMultilingualNeural', true],
  ['edge-ava-meertalig', 'en-US-AvaMultilingualNeural', true],
  ['edge-emma-meertalig', 'en-US-EmmaMultilingualNeural', true],
]
const PIPER_STEMMEN = ['alex', 'pim', 'ronnie']

rmSync(MAP, { recursive: true, force: true })
mkdirSync(MAP)

const gelukt = []
for (const [naam, stem, meertalig] of EDGE) {
  for (const [held, tekst] of Object.entries(TEKST)) {
    try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(stem, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
    const tijdelijk = join(MAP, `tmp-${naam}-${held}`)
    mkdirSync(tijdelijk)
    const { audioFilePath } = meertalig
      ? await tts.rawToFile(
          tijdelijk,
          `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="nl-NL"><voice name="${stem}"><lang xml:lang="nl-NL">${tekst}</lang></voice></speak>`,
        )
      : await tts.toFile(tijdelijk, tekst)
    renameSync(audioFilePath, join(MAP, `${naam}-${held}.mp3`))
    rmSync(tijdelijk, { recursive: true, force: true })
    tts.close()
    console.log('klaar:', naam, held)
    if (!gelukt.includes(naam)) gelukt.push(naam)
    } catch (e) {
      // Microsoft-dienst niet bereikbaar: verder met de andere stemmen
      console.log('mislukt:', naam, held, e.message)
    }
  }
}

for (const s of PIPER_STEMMEN) {
  for (const [held, tekst] of Object.entries(TEKST)) {
    execFileSync(
      join(PIPER, 'piper', 'piper.exe'),
      ['--model', join(PIPER, 'stemmen', `nl_NL-${s}-medium.onnx`), '--output_file', join(MAP, `piper-${s}-${held}.wav`)],
      { input: tekst },
    )
    console.log('klaar: piper', s, held)
  }
}

writeFileSync(join(MAP, 'lijst.json'), JSON.stringify({ edge: gelukt, piper: PIPER_STEMMEN.map((s) => `piper-${s}`) }))
