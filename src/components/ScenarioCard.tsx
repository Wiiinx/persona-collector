import type { Scenario } from '../types'

interface ScenarioCardProps {
  scenario: Scenario
  selected: boolean
  onSelect: (scenario: Scenario) => void
}

export function ScenarioCard({ scenario, selected, onSelect }: ScenarioCardProps) {
  return (
    <button
      className={`card scenario-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(scenario)}
      type="button"
    >
      <div className="card-header">
        <span className="badge">{scenario.id}</span>
        <span className="topic">{scenario.topic}</span>
      </div>
      <h3>{scenario.title}</h3>
      <p>{scenario.description}</p>
      <small>{scenario.script.length} 张脚本卡</small>
    </button>
  )
}
