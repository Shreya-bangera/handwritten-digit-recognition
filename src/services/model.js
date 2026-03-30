import * as tf from '@tensorflow/tfjs'
import { preprocessCanvas } from './preprocess'

let model = null

function buildModelJS() {
  const m = tf.sequential()
  m.add(tf.layers.inputLayer({ inputShape: [28, 28, 1] }))
  m.add(tf.layers.conv2d({ filters: 16, kernelSize: 3, activation: 'relu' }))
  m.add(tf.layers.maxPool2d({ poolSize: 2 }))
  m.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu' }))
  m.add(tf.layers.maxPool2d({ poolSize: 2 }))
  m.add(tf.layers.flatten())
  m.add(tf.layers.dense({ units: 64, activation: 'relu' }))
  m.add(tf.layers.dense({ units: 10, activation: 'softmax' }))
  return m
}

export async function loadModel() {
  if (model) return model
  const base = (import.meta.env.BASE_URL || './') + 'model/'
  const res = await fetch(base + 'weights.json')
  if (!res.ok) throw new Error('Failed to fetch weights.json')
  const weightsArr = await res.json()

  const m = buildModelJS()

  // convert to tensors in same order
  const tensors = weightsArr.map(w => tf.tensor(w.data, w.shape))
  m.setWeights(tensors)

  // dispose temp tensors after setWeights (setWeights clones them)
  tensors.forEach(t => t.dispose())

  model = m
  return model
}

export async function predictFromCanvas(canvas) {
  if (!model) await loadModel()
  const input = preprocessCanvas(canvas)
  const logits = model.predict(input)
  const probs = await logits.data()
  input.dispose()
  if (logits.dispose) logits.dispose()
  return Array.from(probs)
}
