// Toont de Nederlandse Microsoft-stemmen die beschikbaar zijn.
import { MsEdgeTTS } from 'msedge-tts'

const tts = new MsEdgeTTS()
const stemmen = await tts.getVoices()
for (const s of stemmen.filter((s) => s.Locale.startsWith('nl') || /Multilingual/.test(s.ShortName)))
  console.log(s.ShortName, s.Gender, s.Locale)
tts.close?.()
