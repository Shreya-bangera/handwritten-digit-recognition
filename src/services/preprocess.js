import * as tf from '@tensorflow/tfjs'

export function preprocessCanvas(canvas) {
  // resize to 28x28, convert to grayscale normalized [0,1]
  const off = document.createElement('canvas')
  off.width = 28
  off.height = 28
  const ctx = off.getContext('2d')

  // draw the canvas into the small canvas
  ctx.drawImage(canvas, 0, 0, 28, 28)

  const imgData = ctx.getImageData(0, 0, 28, 28)
  const data = imgData.data
  const gray = new Float32Array(28 * 28)
  for (let i = 0; i < 28 * 28; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    // canvas background is black, strokes white; compute luminance so digit is white (1.0)
    const lum = (r + g + b) / 3
    // normalize to 0..1 (white stroke -> 1)
    gray[i] = lum / 255
  }

  // shape into [1,28,28,1]
  const input = tf.tensor4d(gray, [1, 28, 28, 1])
  return input
}

export function get28x28Data(canvas) {
  const off = document.createElement('canvas')
  off.width = 28
  off.height = 28
  const ctx = off.getContext('2d')
  ctx.drawImage(canvas, 0, 0, 28, 28)
  const imgData = ctx.getImageData(0, 0, 28, 28)
  const data = imgData.data
  const gray = new Float32Array(28 * 28)
  for (let i = 0; i < 28 * 28; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const lum = (r + g + b) / 3
    gray[i] = lum / 255
  }
  return { array: gray, dataUrl: off.toDataURL(), imageData: imgData }
}
