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
  const [helpOpen, setHelpOpen] = useState(true)
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
    setHelpOpen(true)
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

  return (
    <div className="chat-app">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Pixel Chatroom</p>
          <h1>沉浸式角色扮演</h1>
          <p className="subtitle">系统会陆续推送对面的话，你仅需以指定人格自然作答。</p>
        </div>
        <div className="top-bar-actions">
          <button type="button" onClick={() => setHelpOpen(true)}>
            Help / Persona
          </button>
          <button type="button" onClick={exportJson} disabled={!sessionPayload}>
            下载 JSON
          </button>
          <button type="button" onClick={startNewSession}>
            换一组匹配
          </button>
        </div>
      </header>

      <main className="chat-container">
        <section className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <h2>实时对话</h2>
              <p>
                Session: {sessionId || '---'} · Persona: {selectedPersona ? `${selectedPersona.id}` : '--'}
              </p>
            </div>
            <span className={`autosave ${autoSaveStatus}`}>{autoSaveLabel}</span>
          </div>

          <div className="chat-window" ref={chatWindowRef}>
            {dialogue.length === 0 && !isTyping && (
              <p className="placeholder">等待系统推送第一句…</p>
            )}

            {dialogue.map((item) => (
              <div key={item.turn} className={`bubble ${item.speaker}`}>
                <div className="avatar">{item.speaker === 'user' ? 'U' : 'A'}</div>
                <div className="bubble-content">
                  <div className="bubble-meta">{item.speaker === 'user' ? '对面' : '你'}</div>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="bubble user typing">
                <div className="avatar">U</div>
                <div className="bubble-content">
                  <div className="bubble-meta">对面</div>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <small>对方正在输入…</small>
                </div>
              </div>
            )}
          </div>

          <div className="input-bar">
            <textarea
              placeholder="输入回复，支持 emoji 🙂🎉"
              value={assistantInput}
              onChange={(event) => setAssistantInput(event.target.value)}
              disabled={inputDisabled}
            />
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
      </main>

      {showPersonaBrief && selectedPersona && (
        <div className="modal">
          <div className="persona-card">
            <p className="eyebrow">Persona Card</p>
            <h3>你需要扮演的角色是：{selectedPersona.name}</h3>
            <p className="tone">氛围：{selectedPersona.tone}</p>
            <p className="instructions">你需要做的回复：{selectedPersona.instructions}</p>
            <button type="button" onClick={handleConfirmPersona}>
              我已了解，开始对话
            </button>
          </div>
        </div>
      )}

      {helpOpen && selectedPersona && (
        <div className="drawer">
          <div className="drawer-card">
            <div className="drawer-header">
              <div>
                <p className="eyebrow">Help</p>
                <h3>角色：{selectedPersona.name}</h3>
                <p className="tone">氛围：{selectedPersona.tone}</p>
              </div>
              <button type="button" onClick={() => setHelpOpen(false)}>
                关闭
              </button>
            </div>
            <p className="instructions">{selectedPersona.instructions}</p>

            <div className="scenario-hint">
              <p>场景脚本对志愿者隐藏，如需调试请手动展开：</p>
              <button type="button" onClick={() => setScenarioReveal((prev) => !prev)}>
                {scenarioReveal ? '隐藏内部脚本' : '显示内部脚本（运营限定）'}
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
          </div>
        </div>
      )}
    </div>
  )
}

export default App
