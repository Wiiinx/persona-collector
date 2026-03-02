import type { Persona } from '../types'

interface PersonaCardProps {
  persona: Persona
  selected: boolean
  onSelect: (persona: Persona) => void
}

export function PersonaCard({ persona, selected, onSelect }: PersonaCardProps) {
  return (
    <button
      className={`card persona-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(persona)}
      type="button"
    >
      <div className="card-header">
        <span className="badge persona">{persona.id}</span>
        <span className="topic">{persona.tone}</span>
      </div>
      <h3>{persona.name}</h3>
      <p>{persona.instructions}</p>
    </button>
  )
}
