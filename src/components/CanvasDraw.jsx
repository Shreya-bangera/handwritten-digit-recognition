import React, { useEffect, useRef, useState } from 'react'
import { saveAs } from '../utils/helpers'
import { preprocessCanvas, get28x28Data } from '../services/preprocess'
import { predictFromCanvas } from '../services/model'

export default function CanvasDraw({ onPredict, autoPredict = true }) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = 280
    canvas.height = 280
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 18
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#fff'
    ctxRef.current = ctx
  }, [])

  function pointerDown(e) {
    drawing.current = true
    const { x, y } = getPos(e)
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(x, y)
  }

  function pointerMove(e) {
    if (!drawing.current) return
    const { x, y } = getPos(e)
    ctxRef.current.lineTo(x, y)
    ctxRef.current.stroke()
    if (autoPredict) triggerPredictDebounced()
  }

  function pointerUp() {
    drawing.current = false
  }

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function clearCanvas() {
    const c = canvasRef.current
    const ctx = ctxRef.current
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, c.width, c.height)
  }

  async function predictNow() {
    const c = canvasRef.current
    if (!c) return
    // provide debug preview
    const preview = get28x28Data(c)
    // show preview image in console and call onPredict
    console.log('28x28 data (first 20):', Array.from(preview.array).slice(0, 20))
    const imgEl = document.getElementById('preview-img')
    if (imgEl) imgEl.src = preview.dataUrl
    if (onPredict) onPredict(c)
  }

  function saveImage() {
    saveAs(canvasRef.current.toDataURL('image/png'), 'digit.png')
  }

  // debounce simple
  let predictTimer = null
  function triggerPredictDebounced() {
    clearTimeout(predictTimer)
    predictTimer = setTimeout(() => predictNow(), 250)
  }

  return (
    <div className="canvas-panel">
      <canvas
        ref={canvasRef}
        className="draw-canvas"
        onMouseDown={pointerDown}
        onMouseMove={pointerMove}
        onMouseUp={pointerUp}
        onMouseLeave={pointerUp}
        onTouchStart={pointerDown}
        onTouchMove={pointerMove}
        onTouchEnd={pointerUp}
      />

      <div className="canvas-actions">
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={predictNow}>Predict</button>
        <button onClick={saveImage}>Save</button>
      </div>
      <div className="preview">
        <img alt="28x28 preview" id="preview-img" style={{marginTop:8,width:84,height:84,background:'#111',borderRadius:6}} />
      </div>
    </div>
  )
}

// small effect to update preview img when user predicts
// Note: this file uses DOM directly to keep changes minimal
const origAddEventListener = window.addEventListener
window.addEventListener = function (ev, fn, opt) {
  origAddEventListener(ev, fn, opt)
}
