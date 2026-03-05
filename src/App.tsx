import { useEffect, useMemo, useRef, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import './App.css'
import { personas } from './data/personas'
import { scenarios } from './data/scenarios'
import { db, firebaseEnabled } from './firebase'
import type { DialogueEntry, Persona, Scenario, SessionPayload } from './types'

const SCHEMA_VERSION = '1.0'
const INITIAL_TYPING_DELAY = 900
const NEXT_CARD_DELAY = 1200
const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '🫠',
  '🤗',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '🙄',
  '😏',
  '😣',
  '😥',
  '😮',
  '🤐',
  '😯',
  '😪',
  '😭',
  '😤',
  '😡',
  '👍',
  '👎',
  '🙏',
  '🔥',
  '🌟',
  '💡',
  '💪',
  '🎉'
]

type AutoSaveState = 'idle' | 'saving' | 'saved' | 'error'

function App() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([])
  const [scriptIndex, setScriptIndex] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [assistantInput, setAssistantInput] = useState('')
  const [showPersonaBrief, setShowPersonaBrief] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [scenarioReveal, setScenarioReveal] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveState>('idle')
  const [sessionComplete, setSessionComplete] = useState(false)
  const typingTimeoutRef = useRef<number | null>(null)
  const chatWindowRef = useRef<HTMLDivElement | null>(null)

  const lastSpeaker = dialogue.length ? dialogue[dialogue.length - 1].speaker : undefined
  const canSend = !showPersonaBrief && lastSpeaker === 'user' && Boolean(assistantInput.trim())
  const hasMoreCards = Boolean(selectedScenario && scriptIndex < selectedScenario.script.length)

  const sessionPayload: SessionPayload | null = useMemo(() => {
    if (!selectedScenario || !selectedPersona || !sessionId) {
      return null
    }

    return {
      schema_version: SCHEMA_VERSION,
      session_id: sessionId,
      scenario_id: selectedScenario.scenarioId,
      persona_id: selectedPersona.id,
      scenario: {
        title: selectedScenario.title,
        topic: selectedScenario.topic
      },
      persona: {
        name: selectedPersona.name,
        instructions: selectedPersona.instructions
      },
      dialogue
    }
  }, [selectedPersona, selectedScenario, sessionId, dialogue])

  const autoSaveLabel = useMemo(() => {
    if (!firebaseEnabled || !db) return 'Firestore 未配置'
    if (autoSaveStatus === 'saving') return '自动保存中…'
    if (autoSaveStatus === 'saved') return '已自动保存'
    if (autoSaveStatus === 'error') return '保存失败，请检查 Firebase'
    return '等待对话'
  }, [autoSaveStatus, db])

  useEffect(() => {
    startNewSession()
  }, [])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!chatWindowRef.current) return
    chatWindowRef.current.scrollTo({ top: chatWindowRef.current.scrollHeight, behavior: 'smooth' })
  }, [dialogue, isTyping])

  useEffect(() => {
    if (!firebaseEnabled || !db) return
    if (!sessionPayload || dialogue.length === 0) return

    let cancelled = false
    setAutoSaveStatus('saving')
    const docRef = doc(db, 'sessions', sessionPayload.session_id)
    setDoc(docRef, { ...sessionPayload, saved_at: serverTimestamp() }, { merge: true })
      .then(() => {
        if (!cancelled) {
          setAutoSaveStatus('saved')
        }
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) {
          setAutoSaveStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [dialogue, sessionPayload])

  const startNewSession = () => {
    const persona = personas[Math.floor(Math.random() * personas.length)]
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    const newId = `${scenario.id}_${persona.id}_${Date.now()}`
    setSelectedPersona(persona)
    setSelectedScenario(scenario)
    setSessionId(newId)
    setDialogue([])
    setScriptIndex(0)
    setAssistantInput('')
    setShowPersonaBrief(true)
    setIsTyping(false)
    setScenarioReveal(false)
    setAutoSaveStatus('idle')
    setSessionComplete(false)
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const queueNextScriptCard = (delay = NEXT_CARD_DELAY) => {
    if (!selectedScenario) return
    const card = selectedScenario.script[scriptIndex]
    if (!card) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setDialogue((current) => [
        ...current,
        {
          turn: current.length + 1,
          speaker: 'user',
          source: 'script',
          card_id: card.cardId,
          text: card.text
        }
      ])
      setScriptIndex((value) => value + 1)
      setIsTyping(false)
    }, delay)
  }

  const handleConfirmPersona = () => {
    setShowPersonaBrief(false)
    queueNextScriptCard(INITIAL_TYPING_DELAY)
  }

  const handleSendMessage = () => {
    if (!assistantInput.trim() || !canSend) return

    const text = assistantInput.trim()
    setDialogue((current) => [
      ...current,
      {
        turn: current.length + 1,
        speaker: 'assistant',
        source: 'human',
        text
      }
    ])
    setAssistantInput('')

    if (hasMoreCards) {
      queueNextScriptCard()
    } else {
      setSessionComplete(true)
    }
  }

  const appendEmoji = (emoji: string) => {
    setAssistantInput((prev) => `${prev}${emoji}`)
  }

  const exportJson = () => {
    if (!sessionPayload) return
    const blob = new Blob([JSON.stringify(sessionPayload, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sessionPayload.session_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const inputDisabled = !selectedScenario || showPersonaBrief || lastSpeaker !== 'user' || sessionComplete
  const personaLabel = selectedPersona ? `你需要扮演的角色是：${selectedPersona.name}` : '等待抽取角色'

  return (
    <div className="chat-app">
      <header className="top-bar">
        <h1>赛博剧本杀</h1>
        <div className="top-bar-actions">
          <button type="button" onClick={exportJson} disabled={!sessionPayload}>
            下载 JSON
          </button>
          <button type="button" onClick={startNewSession}>
            换一组匹配
          </button>
        </div>
      </header>

      <main className="chat-layout">
        <section className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <p className="session-id">Session: {sessionId || '---'}</p>
              <p className="session-sub">Persona: {selectedPersona ? selectedPersona.id : '--'}</p>
            </div>
            <span className={`autosave ${autoSaveStatus}`}>{autoSaveLabel}</span>
          </div>

          <div className="chat-window" ref={chatWindowRef}>
            {dialogue.length === 0 && !isTyping && (
              <p className="placeholder">等待剧本角色上线…</p>
            )}

            {dialogue.map((item) => (
              <div key={item.turn} className={`bubble ${item.speaker}`}>
                <div className="avatar">{item.speaker === 'user' ? 'NPC' : 'YOU'}</div>
                <div className="bubble-content">
                  <div className="bubble-meta">{item.speaker === 'user' ? '剧本角色' : '你'}</div>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="bubble user typing">
                <div className="avatar">NPC</div>
                <div className="bubble-content">
                  <div className="bubble-meta">剧本角色</div>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>角色正在输入…</small>
                </div>
              </div>
            )}
          </div>

          <div className="input-bar">
            <textarea
              placeholder="输入回复（可搭配 emoji）"
              value={assistantInput}
              onChange={(event) => setAssistantInput(event.target.value)}
              disabled={inputDisabled}
            />
            <div className="emoji-bar">
              {EMOJIS.map((emoji) => (
                <button key={emoji} type="button" onClick={() => appendEmoji(emoji)} disabled={inputDisabled}>
                  {emoji}
                </button>
              ))}
            </div>
            <button type="button" onClick={handleSendMessage} disabled={!canSend || sessionComplete}>
              发送
            </button>
          </div>

          {sessionComplete && (
            <div className="completion-banner">
              <p>感谢你的参与，所有回复已自动保存。</p>
              <button type="button" onClick={startNewSession}>
                再抽新的角色
              </button>
            </div>
          )}
        </section>

        <aside className="persona-panel">
          <p className="eyebrow">Persona Card</p>
          <h3>{personaLabel}</h3>
          {selectedPersona && (
            <>
              <p className="tone">氛围：{selectedPersona.tone}</p>
              <p className="instructions">你需要做的回复：{selectedPersona.instructions}</p>
              {selectedPersona.example && (
                <div className="persona-example">
                  <hr />
                  <p>{selectedPersona.example}</p>
                </div>
              )}
            </>
          )}

          <div className="scenario-hint">
            <p>场景脚本默认隐藏。如需核对剧情，可展开（仅运营可见）。</p>
            <button type="button" onClick={() => setScenarioReveal((prev) => !prev)} disabled={!selectedScenario}>
              {scenarioReveal ? '隐藏脚本' : '展开脚本'}
            </button>
            {scenarioReveal && selectedScenario && (
              <div className="scenario-cards">
                <p>
                  {selectedScenario.id} · {selectedScenario.title}
                </p>
                <ul>
                  {selectedScenario.script.map((card) => (
                    <li key={card.cardId}>
                      <strong>{card.cardId}</strong> {card.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </main>

      {showPersonaBrief && selectedPersona && (
        <div className="modal">
          <div className="persona-card">
            <p className="eyebrow">Persona Card</p>
            <h3>你需要扮演的角色是：{selectedPersona.name}</h3>
            <p className="tone">氛围：{selectedPersona.tone}</p>
            <p className="instructions">你需要做的回复：{selectedPersona.instructions}</p>
            {selectedPersona.example && (
              <div className="persona-example">
                <hr />
                <p>{selectedPersona.example}</p>
              </div>
            )}
            <button type="button" onClick={handleConfirmPersona}>
              我已了解，开始对话
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
