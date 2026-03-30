import React from 'react'

function Bar({ value }) {
  const pct = Math.round(value * 100)
  return (
    <div className="prob-row">
      <div className="prob-label">{pct}%</div>
      <div className="prob-bar">
        <div className="prob-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function PredictionResult({ probs }) {
  if (!probs) return <div className="prediction-placeholder">Draw a digit to predict.</div>

  const maxIdx = probs.indexOf(Math.max(...probs))

  return (
    <div className="prediction-result">
      <div className="pred-main">
        <div className="pred-digit">{maxIdx}</div>
        <div className="pred-confidence">{(probs[maxIdx] * 100).toFixed(1)}%</div>
      </div>

      <div className="prob-list">
        {probs.map((p, i) => (
          <div key={i} className={`prob-item ${i === maxIdx ? 'top' : ''}`}>
            <div className="prob-index">{i}</div>
            <Bar value={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
