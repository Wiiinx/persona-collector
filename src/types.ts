export type DialogueSpeaker = 'user' | 'assistant'
export type DialogueSource = 'script' | 'human'

export interface ScriptCard {
  cardId: string
  text: string
}

export interface Scenario {
  id: string
  title: string
  scenarioId: string
  topic: string
  description: string
  script: ScriptCard[]
}

export interface Persona {
  id: string
  name: string
  instructions: string
  tone: string
}

export interface DialogueEntry {
  turn: number
  speaker: DialogueSpeaker
  source: DialogueSource
  card_id?: string
  text: string
}

export interface SessionPayload {
  schema_version: '1.0'
  session_id: string
  scenario_id: string
  persona_id: string
  scenario: {
    title: string
    topic: string
  }
  persona: {
    name: string
    instructions: string
  }
  dialogue: DialogueEntry[]
}
