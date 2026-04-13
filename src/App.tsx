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

const STRUDEL_TIPS = [
  { label: 'Kick pattern', code: 'sound("bd sd:2 bd bd sd:4").bank("RolandTR909")' },
  { label: 'Acid bass', code: 'note("<c2 eb2 g2 bb1>").sound("sawtooth").cutoff(sine.range(300,2000).slow(4)).resonance(15)' },
  { label: 'Ambient pad', code: 'note("c3 eb3 g3 bb3").sound("sine").room(0.9).delay(0.5).slow(2).gain(0.4)' },
  { label: 'Glitch beat', code: 'sound("bd*2 [~ cp] [hh hh:2]*4 [~ sd:3]").sometimes(rev).every(3, fast(2))' },
]

const STRUDEL_LEARN = [
  { title: 'Mini notation', hint: 'Use [ ] for grouping, * for repeat, < > for alternating each cycle. Example: "bd [sd sd] hh*4 <cp oh>"' },
  { title: 'Sounds', hint: 'sound("bd sd hh") plays samples. Add .bank("RolandTR909") for drum machines, or use note("c3").sound("sawtooth") for synths.' },
  { title: 'Effects', hint: '.room(0.5) = reverb, .delay(0.3) = echo, .lpf(2000) = low-pass filter, .gain(0.5) = volume, .speed(2) = pitch up.' },
  { title: 'Patterns', hint: '.slow(2) = half speed, .fast(2) = double, .rev = reverse, .jux(rev) = stereo reverse, .every(4, fast(2)) = every 4th cycle go fast.' },
  { title: 'Stack & Layer', hint: 'stack(sound("bd sd"), note("c3 e3").sound("sine")) plays two patterns simultaneously.' },
  { title: 'Generative', hint: 'perlin.range(200,2000) = smooth random, .degradeBy(0.3) = randomly drop 30% of notes, .sometimes(rev) = sometimes reverse.' },
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
  { name: '/help', description: 'Show Strudel learning hints', action: 'help' },
  { name: '/clear', description: 'Clear chat history', action: 'clear' },
]

export default function App() {
  const [mode, setMode] = useState<Mode>('copilot')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPattern, setCurrentPattern] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [strudelToolbar, setStrudelToolbar] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showLearn, setShowLearn] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashFilter, setSlashFilter] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const autopilotTimer = useRef<number | null>(null)
  const recordingInterval = useRef<number | null>(null)

  const isAuthenticated = !!apiKey

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inject pattern into Strudel iframe
  const injectPattern = useCallback((code: string) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:set-pattern', code }, '*')
    setCurrentPattern(code)
  }, [])

  // Evaluate (play) the current pattern
  const evaluatePattern = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:evaluate' }, '*')
    setIsPlaying(true)
  }, [])

  // Stop playback
  const stopPlayback = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage({ type: 'strudel-jam:stop' }, '*')
    setIsPlaying(false)
  }, [])

  // Toggle Strudel's native toolbar
  const toggleStrudelToolbar = useCallback(() => {
    const next = !strudelToolbar
    setStrudelToolbar(next)
    iframeRef.current?.contentWindow?.postMessage({ type: 'strudel-jam:toggle-toolbar', visible: next }, '*')
  }, [strudelToolbar])

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
        setTimeout(() => evaluatePattern(), 300)
        setMessages(prev => [...prev, { role: 'assistant', content: `🎲 Loaded "${pick.name}"`, pattern: pick.code }])
        break
      }
      case 'help':
        setShowLearn(prev => !prev)
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
            #header { display: none !important; }
            nav[aria-label="Menu Panel"] { transition: transform 0.2s ease, opacity 0.2s ease; }
            body.strudel-jam-hide-toolbar nav[aria-label="Menu Panel"] {
              transform: translateY(100%);
              opacity: 0;
              pointer-events: none;
            }
          `
        }, '*')
        iframeRef.current?.contentWindow?.postMessage({ type: 'strudel-jam:toggle-toolbar', visible: false }, '*')
      }
      if (event.data?.type === 'strudel-jam:pattern-updated') setCurrentPattern(event.data.code)
      if (event.data?.type === 'strudel-jam:playing') setIsPlaying(true)
      if (event.data?.type === 'strudel-jam:stopped') setIsPlaying(false)
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
    const unlisten = listen<{ action: string; code?: string; message?: string }>('cowork-command', (event) => {
      const { action, code, message } = event.payload
      if (action === 'set-pattern' && code) {
        injectPattern(code)
        setTimeout(() => evaluatePattern(), 300)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message || 'Here\'s a pattern from Cowork Claude:',
          pattern: code,
        }])
      }
      if (action === 'stop') {
        stopPlayback()
      }
      if (action === 'message' && message) {
        setMessages(prev => [...prev, { role: 'assistant', content: message }])
      }
    })
    return () => { unlisten.then(fn => fn()) }
  }, [injectPattern, evaluatePattern, stopPlayback])

  // Send message to Claude
  const sendMessage = useCallback(async (userMessage?: string) => {
    const msg = userMessage || input
    if (!msg.trim() && mode === 'copilot') return

    if (mode === 'copilot') {
      setMessages(prev => [...prev, { role: 'user' as const, content: msg }])
      setInput('')
    }

    setIsLoading(true)
    try {
      const response = await invoke<string>('chat_with_claude', {
        message: mode === 'autopilot'
          ? 'Evolve this pattern creatively. Keep the vibe but surprise me. Return ONLY the new pattern code in a code block.'
          : msg,
        currentPattern,
        mode,
        apiKey,
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
        setTimeout(() => evaluatePattern(), 300)
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e.toString()}`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, currentPattern, mode, apiKey, injectPattern, evaluatePattern])

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
            Powered by <span className="text-neutral-400">Strudel</span> and optionally <span className="text-neutral-400">Claude AI</span>
          </p>
        </div>
      </div>
    )
  }

  // ─── Settings overlay ───
  if (showSettings) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-950">
        <div className="bg-neutral-900 rounded-xl p-8 max-w-sm w-full mx-4 border border-neutral-800">
          <h2 className="text-xl font-bold mb-1">Settings</h2>
          <p className="text-neutral-500 text-sm mb-6">Connect Claude AI to generate and evolve patterns</p>

          <label className="block text-sm text-neutral-400 mb-2">API key</label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 mb-2"
          />
          <p className="text-xs text-neutral-500 mb-6">
            Stored locally, never sent anywhere except Anthropic's API.{' '}
            <span className="text-amber-500/80">Get one free at console.anthropic.com</span>
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 py-3 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setApiKey(apiKeyInput); setShowSettings(false) }}
              disabled={!apiKeyInput.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              {isAuthenticated ? 'Update key' : 'Connect'}
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => { setApiKey(''); setApiKeyInput(''); setShowSettings(false) }}
              className="w-full mt-3 py-2 text-sm text-red-400/60 hover:text-red-400 transition-colors"
            >
              Disconnect Claude
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
            src="http://localhost:4321/"
            className="w-full h-full border-none"
            allow="autoplay; midi; microphone"
          />
        </div>

        {/* Side panel */}
        <div className="w-80 flex flex-col border-l border-neutral-800 bg-neutral-900/80">
          {/* Panel header */}
          <div className="flex items-center gap-2 p-3 border-b border-neutral-800">
            {isAuthenticated ? (
              <>
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
              </>
            ) : (
              <span className="flex-1 text-xs font-medium text-neutral-500 uppercase tracking-wider">Strudel Jam</span>
            )}
            <button
              onClick={() => { setApiKeyInput(apiKey); setShowSettings(true) }}
              className="p-1.5 text-neutral-600 hover:text-white transition-colors rounded-md hover:bg-neutral-800"
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* ── Not connected: show tips + CTA ── */}
            {!isAuthenticated && (
              <>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Try a pattern</p>
                  {STRUDEL_TIPS.map((tip, i) => (
                    <button
                      key={i}
                      onClick={() => { injectPattern(tip.code); setTimeout(() => evaluatePattern(), 300) }}
                      className="w-full text-left bg-neutral-800/60 hover:bg-neutral-800 rounded-lg p-3 transition-colors group"
                    >
                      <span className="text-xs font-medium text-neutral-300 group-hover:text-white">{tip.label}</span>
                      <code className="block text-[10px] text-neutral-500 mt-1 truncate">{tip.code}</code>
                    </button>
                  ))}
                </div>

                <div className="border border-neutral-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-neutral-400 mb-3">
                    Connect Claude AI to generate patterns, get suggestions, and let AI jam with you
                  </p>
                  <button
                    onClick={() => { setApiKeyInput(apiKey); setShowSettings(true) }}
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
                    <p className="text-xs">Hit start and Claude will create and evolve patterns on its own, every 15 seconds.</p>
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
                          // Execute the first matching slash command
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
        {isAuthenticated && <span className="text-xs text-neutral-600">Claude: {mode}</span>}

        {/* Learn button */}
        <button
          onClick={() => setShowLearn(prev => !prev)}
          className={`p-1.5 rounded transition-colors text-xs ${
            showLearn ? 'text-amber-400 bg-amber-900/30' : 'text-neutral-600 hover:text-neutral-300'
          }`}
          title="Strudel learning hints"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>

        {/* Strudel toolbar toggle */}
        <button
          onClick={toggleStrudelToolbar}
          className={`p-1.5 rounded transition-colors ${
            strudelToolbar ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-300'
          }`}
          title="Strudel controls"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20v-6M6 20V10M18 20V4"/>
          </svg>
        </button>
      </div>

      {/* Learn panel - collapsible */}
      {showLearn && (
        <div className="border-t border-neutral-800 bg-neutral-900/95 px-4 py-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Strudel Quick Reference</span>
            <button onClick={() => setShowLearn(false)} className="text-neutral-600 hover:text-neutral-300 text-xs">✕</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {STRUDEL_LEARN.map((item, i) => (
              <div key={i} className="bg-neutral-800/60 rounded-lg p-2.5">
                <span className="text-[11px] font-medium text-neutral-200 block mb-1">{item.title}</span>
                <span className="text-[10px] text-neutral-500 leading-relaxed">{item.hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
