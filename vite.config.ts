import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Plugin to properly serve the Strudel REPL from public/strudel/
function strudelStaticPlugin(): Plugin {
  return {
    name: 'strudel-static',
    configureServer(server) {
      // Run before other middleware so /strudel/ doesn't get SPA-fallbacked
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/strudel')) {
          // Resolve trailing slash to index.html
          const urlPath = req.url.split('?')[0]
          if (urlPath === '/strudel' || urlPath === '/strudel/') {
            const indexPath = path.join(process.cwd(), 'public', 'strudel', 'index.html')
            if (fs.existsSync(indexPath)) {
              res.setHeader('Content-Type', 'text/html')
              fs.createReadStream(indexPath).pipe(res)
              return
            }
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [strudelStaticPlugin(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    // Tauri uses WebKit on macOS/Linux
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
})
