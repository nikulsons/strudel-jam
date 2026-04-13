import { useState, useRef, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

type Message = {
  role: 'user' | 'assistant'
  content: string
  pattern?: string
}

type Mode = 'copilot' | 'autopilot'
type SideTab = 'chat' | 'learn'
type AIProvider = 'claude' | 'openai' | 'gemini'

const PROVIDERS: { id: AIProvider; name: string; placeholder: string; url: string }[] = [
  { id: 'claude', name: 'Claude', placeholder: 'sk-ant-...', url: 'console.anthropic.com' },
  { id: 'openai', name: 'ChatGPT', placeholder: 'sk-...', url: 'platform.openai.com' },
  { id: 'gemini', name: 'Gemini', placeholder: 'AIza...', url: 'aistudio.google.com' },
]

const STRUDEL_DOCS = [
  { title: 'Getting Started', path: 'https://strudel.cc/learn/getting-started', icon: '🚀' },
  { title: 'Sounds & Samples', path: 'https://strudel.cc/learn/sounds', icon: '🔊' },
  { title: 'Notes & Synths', path: 'https://strudel.cc/learn/notes', icon: '🎹' },
  { title: 'Mini Notation', path: 'https://strudel.cc/learn/mini-notation', icon: '✏️' },
  { title: 'Effects', path: 'https://strudel.cc/learn/effects', icon: '🌀' },
  { title: 'Time Modifiers', path: 'https://strudel.cc/learn/time-modifiers', icon: '⏱' },
  { title: 'Pattern Factories', path: 'https://strudel.cc/learn/factories', icon: '🏭' },
  { title: 'Signals & LFOs', path: 'https://strudel.cc/learn/signals', icon: '📈' },
  { title: 'Randomness', path: 'https://strudel.cc/learn/random-modifiers', icon: '🎲' },
  { title: 'Conditional Modifiers', path: 'https://strudel.cc/learn/conditional-modifiers', icon: '❓' },
  { title: 'Tonal & Scales', path: 'https://strudel.cc/learn/tonal', icon: '🎵' },
  { title: 'Samples & Loading', path: 'https://strudel.cc/learn/samples', icon: '📂' },
  { title: 'Visual Feedback', path: 'https://strudel.cc/learn/visual-feedback', icon: '👁' },
  { title: 'MIDI & OSC', path: 'https://strudel.cc/learn/input-output', icon: '🔌' },
  { title: 'JavaScript in Strudel', path: 'https://strudel.cc/learn/code', icon: '💻' },
  { title: 'Synth Design', path: 'https://strudel.cc/learn/synths', icon: '🎛' },
  { title: 'Workshop: First Sounds', path: 'https://strudel.cc/workshop/first-sounds', icon: '📖' },
  { title: 'Workshop: First Notes', path: 'https://strudel.cc/workshop/first-notes', icon: '📖' },
  { title: 'Workshop: First Effects', path: 'https://strudel.cc/workshop/first-effects', icon: '📖' },
  { title: 'Workshop: Pattern Effects', path: 'https://strudel.cc/workshop/pattern-effects', icon: '📖' },
]

const STRUDEL_TIPS = [
  { label: 'Kick pattern', code: 'sound("bd sd:2 bd bd sd:4").bank("RolandTR909")' },
  { label: 'Acid bass', code: 'note("<c2 eb2 g2 bb1>").sound("sawtooth").cutoff(sine.range(300,2000).slow(4)).resonance(15)' },
  { label: 'Ambient pad', code: 'note("c3 eb3 g3 bb3").sound("sine").room(0.9).delay(0.5).slow(2).gain(0.4)' },
  { label: 'Glitch beat', code: 'sound("bd*2 [~ cp] [hh hh:2]*4 [~ sd:3]").sometimes(rev).every(3, fast(2))' },
]

const STRUDEL_LEARN = [
  {
    title: 'Mini notation',
    summary: '[ ] group, * repeat, < > alternate',
    detail: '[ ] groups events into one step. * repeats (hh*4 = four hihats). < > picks one per cycle. / slows down, ! replicates, ? randomly drops.',
    example: 'sound("bd [sd sd] hh*4 <cp oh>").bank("RolandTR909")',
    doc: 'https://strudel.cc/learn/mini-notation',
  },
  {
    title: 'Sounds',
    summary: 'sound() for samples, note().sound() for synths',
    detail: 'sound("bd sd hh") plays samples from the default bank. .bank("RolandTR909") switches drum machines. For synths use note("c3").sound("sawtooth") with waveforms: sine, triangle, square, sawtooth.',
    example: 'note("c3 eb3 g3 bb3").sound("sawtooth").cutoff(1000).gain(0.4)',
    doc: 'https://strudel.cc/learn/sounds',
  },
  {
    title: 'Effects',
    summary: 'room, delay, lpf, gain, speed',
    detail: '.room(0.5) adds reverb. .delay(0.3) adds echo. .lpf(2000) is a low-pass filter (also .hpf, .bpf). .cutoff() and .resonance() for classic filter sweeps. .gain() controls volume. .speed() changes pitch. .pan() for stereo.',
    example: 'note("<c3 eb3 g3 bb3>").sound("sawtooth").lpf(sine.range(200,2000).slow(4)).room(0.5).delay(0.25).gain(0.3)',
    doc: 'https://strudel.cc/learn/effects',
  },
  {
    title: 'Patterns',
    summary: 'slow, fast, rev, jux, every',
    detail: '.slow(2) halves speed, .fast(2) doubles it. .rev reverses. .jux(rev) plays reversed in one ear. .every(4, fast(2)) applies fast(2) every 4th cycle. .off(0.125, add(note(7))) creates a canon.',
    example: 'sound("bd sd:2 [~ bd] sd").bank("RolandTR909").every(4, fast(2)).jux(rev)',
    doc: 'https://strudel.cc/learn/time-modifiers',
  },
  {
    title: 'Stack & Layer',
    summary: 'stack() plays patterns simultaneously',
    detail: 'stack() combines any number of patterns playing at the same time. Each pattern in the stack is independent. Use cat() to play patterns one after another instead.',
    example: 'stack(\n  sound("bd ~ [~ bd] ~").bank("RolandTR909"),\n  sound("~ ~ sd ~").bank("RolandTR909"),\n  note("c2 ~ eb2 ~").sound("sawtooth").lpf(500).gain(0.3)\n)',
    doc: 'https://strudel.cc/learn/factories',
  },
  {
    title: 'Generative',
    summary: 'perlin, degradeBy, sometimes',
    detail: 'perlin gives smooth random values (Perlin noise). .range(lo,hi) maps it. .degradeBy(0.3) randomly drops 30% of events. .sometimes(fn) applies a function ~50% of the time. .sometimesBy(0.2, fn) for 20%.',
    example: 'note("c3 eb3 g3 bb3 c4 bb3 g3 eb3").sound("sine").gain(perlin.range(0,0.5).slow(2)).room(0.6).degradeBy(0.2)',
    doc: 'https://strudel.cc/learn/random-modifiers',
  },
]

const RANDOM_PATTERNS = [
  { name: 'Minimal techno', code: 'setcps(0.5)\nstack(\n  sound("bd ~ [~ bd] ~ bd ~ [~ bd] ~").bank("RolandTR909").gain(0.7),\n  sound("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR909").gain(0.6),\n  sound("[hh hh] [hh hh] [hh oh] [hh hh]").bank("RolandTR909").gain(0.2).cutoff(6000),\n  note("c2 ~ ~ ~ eb2 ~ ~ ~").sound("sawtooth").lpf(sine.range(200,800).slow(4)).gain(0.3)\n)' },
  { name: 'Ambient drift', code: 'setcps(0.25)\nstack(\n  note("<[c3,eb3,g3,bb3] [ab2,c3,eb3,g3] [bb2,d3,f3,ab3]>").sound("sawtooth").lpf(perlin.range(400,2000).slow(5)).gain(0.08).room(0.6).delay(0.3).slow(4),\n  note("c5 ~ eb5 ~ g5 ~ bb5 ~").sound("sine").gain(perlin.range(0,0.12).slow(3)).room(0.7).delay(0.4)\n)' },
  { name: '7/8 groove', code: 'setcps(0.5)\nstack(\n  sound("bd ~ ~ bd ~ bd ~").bank("RolandTR909").gain(0.7),\n  sound("~ ~ sd ~ ~ ~ sd").bank("RolandTR909").gain(0.6),\n  sound("hh hh hh hh hh hh [hh oh]").bank("RolandTR909").gain(0.2).cutoff(7000),\n  note("d2 ~ ~ a1 ~ g1 ~").sound("sawtooth").lpf(500).gain(0.3)\n)' },
  { name: 'Breakbeat', code: 'setcps(0.7)\nstack(\n  sound("bd [~ bd] ~ bd [~ bd] ~ [bd ~] ~").bank("RolandTR909").gain(0.7),\n  sound("~ ~ sd ~ ~ [~ sd] ~ sd").bank("RolandTR909").gain(0.65),\n  sound("[hh hh] [hh hh] [hh oh] [hh hh]").bank("RolandTR909").gain(0.2).cutoff(8000).jux(rev),\n  note("c2 ~ [eb2 ~] ~ g2 ~ [f2 ~] ~").sound("sawtooth").lpf(600).gain(0.3).fm(0.5)\n)' },
  { name: 'Lo-fi chords', code: 'setcps(0.4)\nstack(\n  sound("bd ~ [~ bd] ~ bd ~ ~ ~").bank("RolandTR909").gain(0.5).speed(0.8),\n  sound("~ ~ sd ~ ~ ~ ~ sd").bank("RolandTR909").gain(0.4),\n  note("<[c3,eb3,g3,bb3] [f2,ab2,c3,eb3] [g2,bb2,d3,f3] [ab2,c3,eb3,g3]>").sound("triangle").gain(0.1).room(0.5).delay(0.2).lpf(2000).slow(2),\n  note("g4 ~ bb4 ~ c5 ~ eb5 ~").sound("sine").gain(0.12).room(0.6).delay(0.3)\n)' },
]

type SlashCommand = {
  name: string
  description: string
  action: string
}

const SLASH_COMMANDS: SlashCommand[] = [
  { name: '/play', description: 'Play current pattern', action: 'play' },
  { name: '/stop', description: 'Stop playback', action: 'stop' },
  { name: '/record', description: 'Start/stop WAV recording', action: 'record' },
  { name: '/random', description: 'Load a random pattern', action: 'random' },
  { name: '/help', description: 'Open Learn Strudel docs', action: 'help' },
  { name: '/clear', description: 'Clear chat history', action: 'clear' },
]

// Prevent infinite recursion if our app loads inside its own iframe
const isEmbedded = window.self !== window.top

// Cache-bust the Strudel iframe src once per app load (not per render)
const strudelSrc = `/strudel/?v=${Date.now()}`

function EmbedGuard() {
  return (
    <div className="h-screen flex items-center justify-center bg-neutral-950 text-neutral-500 text-sm">
      Loading Strudel REPL...
    </div>
  )
}

export default function App() {
  if (isEmbedded) return <EmbedGuard />

  const [mode, setMode] = useState<Mode>('copilot')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPattern, setCurrentPattern] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<AIProvider>('claude')
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({ claude: '', openai: '', gemini: '' })
  const [hasStarted, setHasStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsProvider, setSettingsProvider] = useState<AIProvider>('claude')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [sideTab, setSideTab] = useState<SideTab>('chat')
  const [docsPath, setDocsPath] = useState<string | null>(null)
  const [expandedHint, setExpandedHint] = useState<number | null>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashFilter, setSlashFilter] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const autopilotTimer = useRef<number | null>(null)
  const recordingInterval = useRef<number | null>(null)

  const apiKey = apiKeys[provider]
  const isAuthenticated = !!apiKey
  const providerInfo = PROVIDERS.find(p => p.id === provider)!

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inject pattern into Strudel iframe via bridge
  const injectPattern = useCallback((code: string) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:set-pattern', code }, '*')
    setCurrentPattern(code)
  }, [])

  // Evaluate (play) the current pattern via bridge
  const evaluatePattern = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:evaluate' }, '*')
    setIsPlaying(true)
  }, [])

  // Stop playback via bridge
  const stopPlayback = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:stop' }, '*')
    setIsPlaying(false)
  }, [])


  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } else {
      if (recordingInterval.current) clearInterval(recordingInterval.current)
      recordingInterval.current = null
    }
    return () => { if (recordingInterval.current) clearInterval(recordingInterval.current) }
  }, [isRecording])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Start/stop recording
  const toggleRecording = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    if (isRecording) {
      iframe.contentWindow.postMessage({ type: 'strudel-jam:stop-recording' }, '*')
      setIsRecording(false)
    } else {
      iframe.contentWindow.postMessage({ type: 'strudel-jam:start-recording' }, '*')
    }
  }, [isRecording])

  // Handle slash commands
  const handleSlashCommand = useCallback((action: string) => {
    switch (action) {
      case 'play':
        evaluatePattern()
        break
      case 'stop':
        stopPlayback()
        break
      case 'record':
        toggleRecording()
        break
      case 'random': {
        const pick = RANDOM_PATTERNS[Math.floor(Math.random() * RANDOM_PATTERNS.length)]
        injectPattern(pick.code)
        evaluatePattern()
        setMessages(prev => [...prev, { role: 'assistant', content: `🎲 Loaded "${pick.name}"`, pattern: pick.code }])
        break
      }
      case 'help':
        setSideTab('learn')
        setDocsPath(null)
        break
      case 'clear':
        setMessages([])
        break
    }
    setInput('')
    setShowSlashMenu(false)
    setSlashFilter('')
  }, [evaluatePattern, stopPlayback, toggleRecording, injectPattern])

  // Handle input changes - detect slash commands
  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (value.startsWith('/')) {
      setShowSlashMenu(true)
      setSlashFilter(value.toLowerCase())
    } else {
      setShowSlashMenu(false)
      setSlashFilter('')
    }
  }, [])

  // Filter slash commands based on current input
  const filteredCommands = SLASH_COMMANDS.filter(cmd =>
    cmd.name.toLowerCase().startsWith(slashFilter || '/')
  )

  // Listen for messages from Strudel iframe
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.data?.type === 'strudel-jam:ready') {
        console.log('Strudel REPL ready')
        iframeRef.current?.contentWindow?.postMessage({
          type: 'strudel-jam:inject-css',
          css: `
            .cm-editor .cm-content, .cm-editor .cm-gutters { font-size: 13px !important; line-height: 1.5 !important; }
            #header { position: absolute !important; top: -9999px !important; left: -9999px !important; height: 0 !important; overflow: hidden !important; }
            button.fixed.text-2xl[class*="z-[1000]"] { display: none !important; }
          `
        }, '*')
        iframeRef.current?.contentWindow?.postMessage({ type: 'strudel-jam:toggle-toolbar', visible: false }, '*')
      }
      if (event.data?.type === 'strudel-jam:pattern-updated') setCurrentPattern(event.data.code)
      if (event.data?.type === 'strudel-jam:playing') setIsPlaying(true)
      if (event.data?.type === 'strudel-jam:stopped') setIsPlaying(false)
      if (event.data?.type === 'strudel-jam:debug') console.log('[strudel-dom]', event.data)
      if (event.data?.type === 'strudel-jam:recording-started') setIsRecording(true)
      if (event.data?.type === 'strudel-jam:record-error') {
        console.error('Recording error:', event.data.error)
        setIsRecording(false)
      }
      if (event.data?.type === 'strudel-jam:record-data') {
        // WAV data arrived as base64, prompt save dialog
        try {
          const base64 = event.data.data
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

          const filePath = await save({
            defaultPath: `strudel-jam-${Date.now()}.wav`,
            filters: [{ name: 'WAV Audio', extensions: ['wav'] }],
          })
          if (filePath) {
            await writeFile(filePath, bytes)
          }
        } catch (err) {
          console.error('Save error:', err)
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Listen for Cowork commands from Tauri backend (local HTTP server)
  useEffect(() => {
    let cancelled = false
    let unlistenFn: (() => void) | null = null

    listen<{ action: string; code?: string; message?: string }>('cowork-command', (event) => {
      const { action, code, message } = event.payload
      if (action === 'set-pattern' && code) {
        injectPattern(code)
        evaluatePattern()
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message || 'Here\'s a pattern from Cowork:',
          pattern: code,
        }])
      }
      if (action === 'stop') {
        stopPlayback()
      }
      if (action === 'message' && message) {
        setMessages(prev => [...prev, { role: 'assistant', content: message }])
      }
    }).then(fn => {
      if (cancelled) { fn() } else { unlistenFn = fn }
    }).catch(err => {
      console.warn('Tauri listen not available (running outside Tauri?):', err)
    })

    return () => {
      cancelled = true
      unlistenFn?.()
    }
  }, [injectPattern, evaluatePattern, stopPlayback])

  // Send message to AI provider
  const sendMessage = useCallback(async (userMessage?: string) => {
    const msg = userMessage || input
    if (!msg.trim() && mode === 'copilot') return

    if (mode === 'copilot') {
      setMessages(prev => [...prev, { role: 'user' as const, content: msg }])
      setInput('')
    }

    setIsLoading(true)
    try {
      const response = await invoke<string>('chat_with_ai', {
        message: mode === 'autopilot'
          ? 'Evolve this pattern creatively. Keep the vibe but surprise me. Return ONLY the new pattern code in a code block.'
          : msg,
        currentPattern,
        mode,
        apiKey,
        provider,
      })

      const codeMatch = response.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
      const pattern = codeMatch ? codeMatch[1].trim() : null

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        pattern: pattern || undefined,
      }])

      if (pattern) {
        injectPattern(pattern)
        evaluatePattern()
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e.toString()}`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, currentPattern, mode, apiKey, provider, injectPattern, evaluatePattern])

  // Autopilot loop
  useEffect(() => {
    if (mode === 'autopilot' && isPlaying && !isLoading && isAuthenticated) {
      autopilotTimer.current = window.setTimeout(() => {
        sendMessage('evolve')
      }, 15000)
    }
    return () => { if (autopilotTimer.current) clearTimeout(autopilotTimer.current) }
  }, [mode, isPlaying, isLoading, isAuthenticated, sendMessage])

  // ─── Welcome screen ───
  if (!hasStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="max-w-sm w-full mx-4 text-center">
          <div className="text-5xl mb-6">~</div>
          <h1 className="text-3xl font-bold mb-2">Strudel Jam</h1>
          <p className="text-neutral-400 mb-10">Live code music. With or without AI.</p>

          <button
            onClick={() => setHasStarted(true)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-4 rounded-xl transition-colors text-lg mb-4"
          >
            Start Jamming
          </button>

          <p className="text-xs text-neutral-600">
            Powered by <span className="text-neutral-400">Strudel</span> and optionally <span className="text-neutral-400">AI</span>
          </p>
        </div>
      </div>
    )
  }

  // ─── Settings overlay ───
  if (showSettings) {
    const sp = PROVIDERS.find(p => p.id === settingsProvider)!
    const currentKey = apiKeys[settingsProvider]
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="bg-neutral-900 rounded-xl p-8 max-w-md w-full mx-4 border border-neutral-800">
          <h2 className="text-xl font-bold mb-1">Settings</h2>
          <p className="text-neutral-500 text-sm mb-5">Choose your AI provider and add an API key</p>

          {/* Provider tabs */}
          <div className="flex gap-1 mb-5 bg-neutral-800 rounded-lg p-1">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSettingsProvider(p.id); setApiKeyInput(apiKeys[p.id]) }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsProvider === p.id
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p.name}
                {apiKeys[p.id] && <span className="ml-1 text-green-400">●</span>}
              </button>
            ))}
          </div>

          <label className="block text-sm text-neutral-400 mb-2">{sp.name} API key</label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder={sp.placeholder}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 mb-2"
          />
          <p className="text-xs text-neutral-500 mb-5">
            Stored locally, never shared.{' '}
            <span className="text-amber-500/80">Get a key at {sp.url}</span>
          </p>

          {/* Active provider selector */}
          <label className="block text-sm text-neutral-400 mb-2">Active provider</label>
          <div className="flex gap-1 mb-5 bg-neutral-800 rounded-lg p-1">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                disabled={!apiKeys[p.id]}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                  provider === p.id
                    ? 'bg-amber-600 text-white'
                    : apiKeys[p.id]
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 py-3 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setApiKeys(prev => ({ ...prev, [settingsProvider]: apiKeyInput }))
                if (!apiKeys[provider] && apiKeyInput.trim()) setProvider(settingsProvider)
                setShowSettings(false)
              }}
              disabled={!apiKeyInput.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              {currentKey ? 'Update key' : 'Connect'}
            </button>
          </div>

          {currentKey && (
            <button
              onClick={() => {
                setApiKeys(prev => ({ ...prev, [settingsProvider]: '' }))
                setApiKeyInput('')
                if (provider === settingsProvider) {
                  const alt = PROVIDERS.find(p => p.id !== settingsProvider && apiKeys[p.id])
                  if (alt) setProvider(alt.id)
                }
              }}
              className="w-full mt-3 py-2 text-sm text-red-400/60 hover:text-red-400 transition-colors"
            >
              Disconnect {sp.name}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── Main app ───
  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
      <div className="flex-1 flex min-h-0">
        {/* Strudel REPL */}
        <div className="flex-1 min-w-0">
          <iframe
            ref={iframeRef}
            src={strudelSrc}
            className="w-full h-full border-none"
            allow="autoplay; midi; microphone"
          />
        </div>

        {/* Side panel */}
        <div className="w-96 flex flex-col border-l border-neutral-800 bg-neutral-900">
          {/* Tab bar: Chat / Learn */}
          <div className="flex items-center border-b border-neutral-800">
            <button
              onClick={() => { setSideTab('chat'); setDocsPath(null) }}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                sideTab === 'chat'
                  ? 'text-white border-b-2 border-amber-500'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setSideTab('learn')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                sideTab === 'learn'
                  ? 'text-white border-b-2 border-amber-500'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Learn Strudel
            </button>
            <button
              onClick={() => { setSettingsProvider(provider); setApiKeyInput(apiKeys[provider]); setShowSettings(true) }}
              className="p-2 text-neutral-600 hover:text-white transition-colors"
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>

          {/* Mode toggle (only in chat tab when authenticated) */}
          {sideTab === 'chat' && isAuthenticated && (
            <div className="flex items-center gap-2 p-2 border-b border-neutral-800">
              <button
                onClick={() => setMode('copilot')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === 'copilot'
                    ? 'bg-amber-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Co-pilot
              </button>
              <button
                onClick={() => setMode('autopilot')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mode === 'autopilot'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Autopilot
              </button>
            </div>
          )}

          {/* ── Chat tab content ── */}
          {sideTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* ── Not connected: show tips + CTA ── */}
                {!isAuthenticated && (
                  <>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Try a pattern</p>
                      {STRUDEL_TIPS.map((tip, i) => (
                        <button
                          key={i}
                          onClick={() => { injectPattern(tip.code); evaluatePattern() }}
                          className="w-full text-left bg-neutral-800/60 hover:bg-neutral-800 rounded-lg p-3 transition-colors group"
                        >
                          <span className="text-xs font-medium text-neutral-300 group-hover:text-white">{tip.label}</span>
                          <code className="block text-[10px] text-neutral-500 mt-1 truncate">{tip.code}</code>
                        </button>
                      ))}
                    </div>

                    <div className="border border-neutral-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-neutral-400 mb-3">
                        Connect AI (Claude, ChatGPT, or Gemini) to generate patterns, get suggestions, and let AI jam with you
                      </p>
                      <button
                        onClick={() => { setSettingsProvider(provider); setApiKeyInput(apiKeys[provider]); setShowSettings(true) }}
                        className="bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Add API key
                      </button>
                    </div>
                  </>
                )}

                {/* ── Connected: empty state ── */}
                {isAuthenticated && messages.length === 0 && (
                  <div className="text-center text-neutral-500 mt-8 px-2">
                    {mode === 'copilot' ? (
                      <>
                        <p className="text-sm text-neutral-300 mb-2">What should we play?</p>
                        <div className="space-y-1.5 text-xs text-neutral-500">
                          {['"dark ambient in F minor"', '"add a walking bass"', '"make it more glitchy"', '"something chill with piano"'].map((s, i) => (
                            <button key={i} onClick={() => { setInput(s.replace(/"/g, '')); }} className="block w-full text-left px-3 py-1.5 rounded-md hover:bg-neutral-800 hover:text-neutral-300 transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-neutral-300 mb-1">Autopilot mode</p>
                        <p className="text-xs">Hit start and {providerInfo.name} will create and evolve patterns on its own, every 15 seconds.</p>
                      </>
                    )}
                  </div>
                )}

                {/* ── Chat messages ── */}
                {messages.map((msg, i) => (
                  <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                    <div className={`inline-block max-w-[90%] rounded-xl px-3 py-2 text-xs ${
                      msg.role === 'user'
                        ? 'bg-amber-600/20 text-amber-200'
                        : 'bg-neutral-800 text-neutral-200'
                    }`}>
                      {msg.pattern ? (
                        <div>
                          <p className="mb-1.5">{msg.content.replace(/```[\s\S]*?```/g, '').trim()}</p>
                          <pre className="bg-neutral-950 rounded-md p-2 text-[10px] overflow-x-auto text-green-400">
                            <code>{msg.pattern}</code>
                          </pre>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-1 text-amber-500 text-xs">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Panel footer / input */}
              <div className="p-3 border-t border-neutral-800">
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-600">
                      Click patterns above to try them, or edit code directly on the left
                    </p>
                  </div>
                ) : mode === 'copilot' ? (
                  <div className="relative">
                    {/* Slash command autocomplete */}
                    {showSlashMenu && filteredCommands.length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden shadow-xl z-10">
                        {filteredCommands.map((cmd, i) => (
                          <button
                            key={cmd.action}
                            onClick={() => handleSlashCommand(cmd.action)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-3 hover:bg-neutral-700 transition-colors ${
                              i === 0 ? 'bg-neutral-700/50' : ''
                            }`}
                          >
                            <span className="text-amber-400 font-mono font-medium">{cmd.name}</span>
                            <span className="text-neutral-500">{cmd.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={input}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (showSlashMenu && filteredCommands.length > 0) {
                              handleSlashCommand(filteredCommands[0].action)
                            } else if (input.startsWith('/')) {
                              // Unknown slash command, ignore
                            } else {
                              sendMessage()
                            }
                          }
                          if (e.key === 'Escape' && showSlashMenu) {
                            setShowSlashMenu(false)
                            setSlashFilter('')
                          }
                        }}
                        placeholder="describe what to play... (/ for commands)"
                        disabled={isLoading}
                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                      />
                      <button
                        onClick={() => sendMessage()}
                        disabled={isLoading || !input.trim() || input.startsWith('/')}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        stopPlayback()
                      } else {
                        sendMessage('Start jamming! Create something interesting.')
                      }
                    }}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPlaying
                        ? 'bg-red-600/90 hover:bg-red-500 text-white'
                        : 'bg-purple-600/90 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {isPlaying ? 'Stop Autopilot' : 'Start Autopilot'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Learn tab content ── */}
          {sideTab === 'learn' && (
            docsPath ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800">
                  <button
                    onClick={() => setDocsPath(null)}
                    className="text-neutral-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back
                  </button>
                  <span className="text-xs text-neutral-500 truncate">
                    {STRUDEL_DOCS.find(d => d.path === docsPath)?.title}
                  </span>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  {!navigator.onLine ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                        <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
                      </svg>
                      <p className="text-xs text-neutral-500">You're offline. Docs require an internet connection.</p>
                      <button
                        onClick={() => setDocsPath(null)}
                        className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        ← Back to Learn
                      </button>
                    </div>
                  ) : (
                    <iframe
                      src={docsPath}
                      className="absolute border-none bg-neutral-950"
                      style={{
                        width: '125%',
                        height: 'calc(125% + 80px)',
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        top: '-52px',
                        left: 0,
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Quick reference cards */}
                <div className="p-3">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-2">Quick Reference</p>
                  <div className="space-y-1.5">
                    {STRUDEL_LEARN.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setExpandedHint(expandedHint === i ? null : i)}
                        className={`w-full text-left rounded-lg p-2.5 transition-colors ${
                          expandedHint === i
                            ? 'bg-amber-900/30 ring-1 ring-amber-700/50'
                            : 'bg-neutral-800/60 hover:bg-neutral-800'
                        }`}
                      >
                        <span className="text-[11px] font-medium text-neutral-200">{item.title}</span>
                        <span className="text-[10px] text-neutral-500 ml-1.5">{item.summary}</span>
                        {expandedHint === i && (
                          <div className="mt-2 space-y-2">
                            <p className="text-[11px] text-neutral-300 leading-relaxed">{item.detail}</p>
                            <div
                              className="bg-neutral-950 rounded-md p-2 cursor-pointer hover:ring-1 hover:ring-amber-600/50 transition-all group"
                              onClick={(e) => {
                                e.stopPropagation()
                                injectPattern(item.example)
                                evaluatePattern()
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] text-neutral-600 uppercase tracking-wider">Example</span>
                                <span className="text-[9px] text-amber-500/70 opacity-0 group-hover:opacity-100 transition-opacity">click to play</span>
                              </div>
                              <pre className="text-[10px] text-green-400 overflow-x-auto whitespace-pre-wrap"><code>{item.example}</code></pre>
                            </div>
                            <span
                              className="inline-block text-[10px] text-amber-500/80 hover:text-amber-400 underline underline-offset-2 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDocsPath(item.doc)
                              }}
                            >
                              Read the full docs →
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full documentation pages */}
                <div className="p-3 pt-0">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-2">Documentation</p>
                  <div className="space-y-0.5">
                    {STRUDEL_DOCS.map((doc) => (
                      <button
                        key={doc.path}
                        onClick={() => setDocsPath(doc.path)}
                        className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-neutral-800 transition-colors group"
                      >
                        <span className="text-sm">{doc.icon}</span>
                        <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">{doc.title}</span>
                        <svg className="ml-auto w-3 h-3 text-neutral-700 group-hover:text-neutral-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Open Getting Started in doc viewer */}
                <div className="p-3 pt-1 border-t border-neutral-800 mt-1">
                  <button
                    onClick={() => setDocsPath('https://strudel.cc/learn/getting-started')}
                    className="flex items-center gap-2 text-xs text-neutral-500 hover:text-amber-400 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    Start from the beginning
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Transport bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-neutral-800 bg-neutral-900/90">
        {/* Play / Stop */}
        <button
          onClick={() => isPlaying ? stopPlayback() : evaluatePattern()}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            isPlaying
              ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              Stop
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Play
            </>
          )}
        </button>

        {/* Update (re-evaluate) - shown while playing */}
        {isPlaying && (
          <button
            onClick={evaluatePattern}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Update
          </button>
        )}

        {/* Record */}
        <button
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={isRecording ? 'text-white' : 'text-red-500'}>
            <circle cx="12" cy="12" r="8"/>
          </svg>
          {isRecording ? `Rec ${formatTime(recordingTime)}` : 'Rec'}
        </button>

        {/* Recording pulse indicator */}
        {isRecording && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}

        <div className="flex-1" />

        {/* Status text */}
        <span className={`text-xs ${isPlaying ? 'text-green-500' : 'text-neutral-600'}`}>
          {isPlaying ? '▶ Playing' : '■ Stopped'}
        </span>
        {isAuthenticated && <span className="text-xs text-neutral-600">{providerInfo.name}: {mode}</span>}

        {/* Learn button */}
        <button
          onClick={() => { setSideTab('learn'); setDocsPath(null) }}
          className={`p-1.5 rounded transition-colors text-xs ${
            sideTab === 'learn' ? 'text-amber-400 bg-amber-900/30' : 'text-neutral-600 hover:text-neutral-300'
          }`}
          title="Learn Strudel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>

      </div>

    </div>
  )
}
