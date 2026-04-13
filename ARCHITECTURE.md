# Strudel Jam — Architecture

## What is this?

An open-source desktop app where Claude AI and humans make music together using Strudel live coding. Two modes: **Autopilot** (Claude jams freely) and **Co-pilot** (you direct, Claude executes).

## Stack

- **Tauri v2** — Desktop shell, Rust backend
- **Strudel** — Embedded as the music engine (loaded from local dev server or bundled)
- **Anthropic Claude API** — AI composition brain (called from Rust backend, API key stays secure)
- **React + Tailwind** — UI layer for chat panel and controls

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Tauri Window                       │
│                                                      │
│  ┌──────────────────────┬──────────────────────────┐ │
│  │                      │                          │ │
│  │   Strudel REPL       │    Claude Panel          │ │
│  │   (WebView)          │                          │ │
│  │                      │  [autopilot] [co-pilot]  │ │
│  │   - Editor           │                          │ │
│  │   - Visualizer       │  Chat messages...        │ │
│  │   - Transport        │  Pattern suggestions...  │ │
│  │                      │  Mood controls...        │ │
│  │                      │                          │ │
│  │                      │  [input field]           │ │
│  └──────────────────────┴──────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Status Bar: BPM | Key | Mode | Playing/Stopped │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │                          │
         │ IPC (invoke)             │ IPC (invoke)
         ▼                          ▼
┌─────────────────────────────────────────────────────┐
│                 Rust Backend                         │
│                                                      │
│  ┌──────────────┐  ┌───────────────────────────────┐ │
│  │ Claude API   │  │ Pattern Engine                │ │
│  │ Client       │  │ - Validate patterns           │ │
│  │              │  │ - Store history               │ │
│  │ - Stream     │  │ - Manage sessions             │ │
│  │   responses  │  │                               │ │
│  │ - Tool use   │  │                               │ │
│  └──────────────┘  └───────────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Config: API key, preferences, saved patterns     │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Co-pilot mode
1. User types "make it darker and add some reverb"
2. Frontend sends message to Rust via IPC
3. Rust calls Claude API with current pattern + user request
4. Claude responds with new pattern code
5. Rust streams response back to frontend
6. Frontend injects pattern into Strudel editor
7. Frontend calls strudelMirror.evaluate() — instant hot-swap

### Autopilot mode
1. User hits "autopilot" toggle
2. Frontend sends current pattern to Rust
3. Rust calls Claude API: "You are a live coder. Evolve this pattern creatively."
4. Claude returns evolved pattern
5. Pattern hot-swaps into Strudel
6. After N seconds, repeat with the new pattern
7. Claude gets context of what it played before, building a coherent journey

## Claude System Prompt (for music mode)

Claude gets:
- Current Strudel pattern code
- History of recent patterns (last 10)
- Current mode (autopilot vs co-pilot)
- User's message (in co-pilot mode)
- Strudel API reference (condensed)

Claude responds with:
- The new pattern code (in a code block)
- A short description of what changed and why
- Optional mood/energy tags

## Key Design Decisions

1. **API key in Rust, not JS** — Secure by default
2. **Hot-swap, never stop** — Pattern changes happen live, no audio interruption
3. **Strudel as iframe/webview** — We don't fork Strudel, we embed it
4. **Pattern history** — Every pattern Claude generates is saved locally
5. **No account required** — Bring your own Anthropic API key
