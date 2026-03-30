import * as tf from '@tensorflow/tfjs'

function getImageGrayArray(ctx, x, y, w, h) {
  const img = ctx.getImageData(x, y, w, h).data
  const out = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const r = img[i * 4]
    const g = img[i * 4 + 1]
    const b = img[i * 4 + 2]
    out[i] = (r + g + b) / 3
  }
  return out
}

// Center-crop and scale to match MNIST preprocessing: fit into 20x20 box, then pad to 28x28
function toMnist28(canvas) {
  const srcW = canvas.width
  const srcH = canvas.height
  const ctxSrc = canvas.getContext('2d')
  const imgData = ctxSrc.getImageData(0, 0, srcW, srcH).data

  // find bounding box of non-black pixels (threshold)
  const thresh = 10
  let minX = srcW, minY = srcH, maxX = 0, maxY = 0, found = false
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const i = (y * srcW + x) * 4
      const lum = (imgData[i] + imgData[i+1] + imgData[i+2]) / 3
      if (lum > thresh) {
        found = true
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (!found) {
    // return blank 28x28
    const blank = document.createElement('canvas')
    blank.width = 28
    blank.height = 28
    const ctx = blank.getContext('2d')
    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,28,28)
    return blank
  }

  // add small padding
  const pad = 8
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(srcW - 1, maxX + pad)
  maxY = Math.min(srcH - 1, maxY + pad)

  const boxW = maxX - minX + 1
  const boxH = maxY - minY + 1

  // draw cropped to temporary canvas
  const crop = document.createElement('canvas')
  crop.width = boxW
  crop.height = boxH
  const ctxCrop = crop.getContext('2d')
  ctxCrop.drawImage(canvas, minX, minY, boxW, boxH, 0, 0, boxW, boxH)

  // scale to fit into 20x20 while preserving aspect
  const target = 20
  const scale = Math.min(target / boxW, target / boxH)
  const scaledW = Math.max(1, Math.round(boxW * scale))
  const scaledH = Math.max(1, Math.round(boxH * scale))

  const small = document.createElement('canvas')
  small.width = scaledW
  small.height = scaledH
  const ctxSmall = small.getContext('2d')
  // fill black then draw scaled image
  ctxSmall.fillStyle = '#000'
  ctxSmall.fillRect(0,0,scaledW,scaledH)
  ctxSmall.drawImage(crop, 0, 0, boxW, boxH, 0, 0, scaledW, scaledH)

  // create final 28x28 and center the small image
  const out = document.createElement('canvas')
  out.width = 28
  out.height = 28
  const ctxOut = out.getContext('2d')
  ctxOut.fillStyle = '#000'
  ctxOut.fillRect(0,0,28,28)
  const dx = Math.floor((28 - scaledW) / 2)
  const dy = Math.floor((28 - scaledH) / 2)
  ctxOut.drawImage(small, dx, dy, scaledW, scaledH)

  return out
}

export function preprocessCanvas(canvas) {
  // convert input canvas to MNIST-like 28x28 centered canvas and return tensor
  const mn = toMnist28(canvas)
  const ctx = mn.getContext('2d')
  const imgData = ctx.getImageData(0, 0, 28, 28).data
  const gray = new Float32Array(28 * 28)
  for (let i = 0; i < 28 * 28; i++) {
    const r = imgData[i * 4]
    const g = imgData[i * 4 + 1]
    const b = imgData[i * 4 + 2]
    const lum = (r + g + b) / 3
    // normalize so white stroke -> 1.0
    gray[i] = lum / 255
  }
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
