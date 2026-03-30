import React, { useEffect, useState } from 'react'
import CanvasDraw from './components/CanvasDraw'
import PredictionResult from './components/PredictionResult'
import { loadModel, predictFromCanvas } from './services/model'

export default function App() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [autoPredict, setAutoPredict] = useState(true)

  useEffect(() => {
    loadModel().then(() => setModelLoaded(true)).catch(console.error)
  }, [])

  async function handlePredict(canvas) {
    if (!modelLoaded) return
    const probs = await predictFromCanvas(canvas)
    setPrediction(probs)
  }

  return (
    <div className="app-root">
      <header className="app-header">Handwritten Digit Recognition</header>

      <main className="app-main">
        <CanvasDraw onPredict={handlePredict} autoPredict={autoPredict} />

        <aside className="sidebar">
          <div className="controls">
            <label className="auto-predict">
              <input type="checkbox" checked={autoPredict} onChange={e => setAutoPredict(e.target.checked)} /> Auto-predict
            </label>
            <div className="status">Model: {modelLoaded ? 'Loaded' : 'Loading...'}</div>
          </div>

          <PredictionResult probs={prediction} />
          <div className="notes">
            <p>Model runs entirely in the browser using TensorFlow.js.</p>
          </div>
        </aside>
      </main>

      <footer className="app-footer">Built with TensorFlow.js • Client-side inference</footer>
    </div>
  )
}
