# Strudel Jam

A desktop app for live coding music with [Strudel](https://strudel.cc), optionally powered by Claude AI.

Write patterns by hand, ask AI to generate them, or let autopilot evolve your music in real time. Record to WAV. Stream to YouTube. Ship your own sounds.

![License](https://img.shields.io/badge/license-MIT-blue)
![Tauri](https://img.shields.io/badge/tauri-v2-orange)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

---

## What it does

Strudel Jam embeds the full Strudel REPL inside a native desktop window and adds a side panel where you can chat with Claude AI about your music.

**Co-pilot mode** - describe what you want ("dark ambient in F minor", "add a walking bass", "make it more glitchy") and Claude writes the Strudel code, injects it, and plays it.

**Autopilot mode** - hit start and Claude creates patterns on its own, evolving the music every 15 seconds.

**No AI required** - the Strudel REPL works standalone. Use the built-in pattern tips, slash commands, and learning hints to get started without an API key.

### Features

- Full Strudel REPL with all samples and synths
- AI chat panel with co-pilot and autopilot modes
- Slash commands: `/play`, `/stop`, `/record`, `/random`, `/help`, `/clear`
- WAV recording with save dialog
- Transport bar with prominent play/stop/record controls
- Quick reference panel for Strudel mini-notation
- Local HTTP server (port 17643) for external control via curl
- YouTube livestream support with OBS overlay
- 15 bundled pattern presets (ambient, DnB, metalcore, odd meters, generative)

## Download

Go to [Releases](../../releases) and grab the latest build for your platform:

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `Strudel.Jam_x.x.x_aarch64.dmg` |
| macOS (Intel) | `Strudel.Jam_x.x.x_x64.dmg` |
| Windows | `Strudel.Jam_x.x.x_x64-setup.exe` |
| Linux (Debian/Ubuntu) | `strudel-jam_x.x.x_amd64.deb` |
| Linux (AppImage) | `strudel-jam_x.x.x_amd64.AppImage` |

No npm, no Rust toolchain, no build step. Just download, install, and open.

## Building from source

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.77+
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/) system dependencies
- The [Strudel](https://github.com/tidalcycles/strudel) repo cloned as a sibling directory:

```
parent/
  strudel/       # git clone https://github.com/tidalcycles/strudel
  strudel-jam/   # this repo
```

### Steps

```bash
# Clone both repos
git clone https://github.com/tidalcycles/strudel.git
git clone https://github.com/YOUR_USERNAME/strudel-jam.git

# Install Strudel dependencies
cd strudel
npm install
cd ..

# Install Strudel Jam dependencies
cd strudel-jam
npm install

# Build the embedded Strudel REPL
npm run build:strudel

# Run in development mode
npx tauri dev

# Or build a release binary
npx tauri build
```

The release binary lands in `src-tauri/target/release/bundle/`.

## Using the AI features

1. Open the app and click the gear icon in the side panel
2. Enter your [Anthropic API key](https://console.anthropic.com/)
3. Your key stays local, stored only in the app's memory for the session

In co-pilot mode, type what you want and Claude writes Strudel code. In autopilot mode, Claude generates and evolves patterns autonomously.

## Slash commands

Type `/` in the chat input to see available commands:

| Command | What it does |
|---------|-------------|
| `/play` | Evaluate and play the current pattern |
| `/stop` | Stop playback |
| `/record` | Start/stop WAV recording |
| `/random` | Load a random preset pattern |
| `/help` | Toggle the Strudel quick reference panel |
| `/clear` | Clear chat history |

## External control (Cowork API)

Strudel Jam runs a local HTTP server on port `17643` for external automation:

```bash
# Check if the app is running
curl http://127.0.0.1:17643/health

# Send a pattern
curl -X POST http://127.0.0.1:17643/pattern \
  -H "Content-Type: application/json" \
  -d '{"code": "sound(\"bd sd hh sd\").bank(\"RolandTR909\")"}'

# Stop playback
curl -X POST http://127.0.0.1:17643/stop

# Send a chat message (requires API key set in app)
curl -X POST http://127.0.0.1:17643/message \
  -H "Content-Type: application/json" \
  -d '{"message": "make it more ambient"}'
```

## YouTube livestream setup

The repo includes tools for streaming Strudel Jam to YouTube:

1. **`livestream-dj.sh`** - A bash script that sends patterns to the app via curl on a timed loop. Cycles through 15 sections (ambient, groove, heavy) in ~55 minute rotations, forever.

2. **`stream-overlay.html`** - An OBS browser source overlay showing the current track name, a live indicator, clock, and animated visualizer bars. Transparent background, polls the health endpoint for track info.

### Quick start

```bash
# 1. Open Strudel Jam
# 2. In OBS, add a Window Capture for Strudel Jam
# 3. Add a Browser Source pointing to stream-overlay.html
# 4. Start the DJ script:
./livestream-dj.sh
```

## Bundled patterns

The `patterns/` directory contains 15 ready-to-play Strudel patterns:

| Pattern | Style |
|---------|-------|
| `deep-space-meditation.js` | Generative ambient, Perlin-driven |
| `liquid-dnb.js` | 170bpm liquid drum & bass |
| `bellow-breath.js` | Accordion-inspired folk |
| `seven.js` | 7/8 time, D dorian |
| `five-petals.js` | 5/4 time, F lydian |
| `polymetric-garden.js` | 3 vs 5 vs 7 polymetric phasing |
| `everything-i-learned.js` | Minimal 7/8, mostly silence |
| `balkan-7.js` | Balkan-flavored odd meter |
| `generative-garden.js` | Evolving generative piece |
| `the-drop.js` | Build-up and drop |
| `e-minor-bloom.js` | E minor melodic bloom |
| `kitchen-sink-lp.js` | Lo-fi kitchen sink |
| `linkin-park-tribute.js` | Nu-metal tribute |
| `slipknot-iowa.js` | Heavy metalcore |
| `final-form-metal.js` | Full metalcore with vocal sim |

Load any of them through the Cowork API:

```bash
curl -X POST http://127.0.0.1:17643/pattern \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$(cat patterns/liquid-dnb.js | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read())[1:-1])')\"}"
```

## Architecture

Strudel Jam is a Tauri v2 app with:

- **Frontend**: React + TypeScript + Tailwind CSS, with Strudel REPL in an iframe
- **Backend**: Rust (Tauri), handles Claude API calls and runs the local HTTP server
- **Communication**: `postMessage` between React and the Strudel iframe; Tauri events between Rust and React

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical breakdown.

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT. See [LICENSE](LICENSE).

## Credits

- [Strudel](https://strudel.cc) by Alex McLean and contributors - the live coding environment
- [Tauri](https://tauri.app) - the desktop framework
- [Claude](https://anthropic.com) by Anthropic - the AI (optional)
