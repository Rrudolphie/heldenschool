import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Alle bestanden in een map (ook submappen), als paden met '/'. */
function bestanden(map: string, basis = map): string[] {
  return readdirSync(map).flatMap((naam) => {
    const pad = join(map, naam)
    return statSync(pad).isDirectory() ? bestanden(pad, basis) : [relative(basis, pad).replaceAll('\\', '/')]
  })
}

/**
 * Na het bouwen: zet de lijst met alle bestanden in sw.js, zodat de iPad bij het
 * eerste bezoek alles bewaart en de app daarna zonder internet werkt.
 * De cachenaam krijgt een vingerafdruk, zodat een nieuwe versie de oude vervangt.
 */
function offlineLijst(): Plugin {
  return {
    name: 'offline-lijst',
    apply: 'build',
    closeBundle() {
      const dist = 'dist'
      const lijst = bestanden(dist).filter((b) => b !== 'sw.js')
      const hash = createHash('sha1')
      for (const b of lijst) hash.update(b).update(readFileSync(join(dist, b)))
      const swPad = join(dist, 'sw.js')
      const sw = readFileSync(swPad, 'utf8')
        .replace("'__BESTANDEN__'", JSON.stringify(['./', ...lijst.map((b) => `./${b}`)]))
        .replace('__VERSIE__', hash.digest('hex').slice(0, 10))
      writeFileSync(swPad, sw)
    },
  }
}

// base './' zodat de app ook werkt in een submap op GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react(), offlineLijst()],
  server: { port: 5174 },
})
