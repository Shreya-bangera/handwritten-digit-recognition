# Handwritten Digit Recognition (React + TensorFlow.js)

Developed a browser-based deep learning application using TensorFlow.js to perform real-time handwritten digit classification using a CNN model trained on the MNIST dataset. The model runs entirely on the client-side without any backend.

Features
- Interactive HTML5 canvas for drawing digits (mouse & touch)
- Client-side model loading and inference with TensorFlow.js
- Preprocessing: resize to 28x28, grayscale, normalize
- Prediction visualization: top digit + probability bars
- Dark theme, mobile-friendly, save drawing as PNG

Quick start
1. Install dependencies

```bash
npm install
```

2. Add a pre-trained TensorFlow.js model

Place your converted TensorFlow.js model files under `public/model/` (e.g. `public/model/model.json` and weight shards). The app loads the model from `./model/model.json` relative to the built site.

If you have a Keras `.h5` or SavedModel, convert it with the TensorFlow.js converter:

```bash
pip install tensorflowjs
tensorflowjs_converter --input_format=keras path/to/model.h5 public/model
```

Alternatively, download any pre-converted MNIST TFJS model and put it in `public/model/`.

3. Run development server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

5. Deploy to GitHub Pages

This repo uses `gh-pages`. Set repository in your remote and then run:

```bash
npm run deploy
```

Notes
- The app expects the model to accept input shape `[1,28,28,1]` and output 10 logits/probabilities for digits 0-9.
- Use relative paths (Vite `base: './'`) so the site is compatible with GitHub Pages.

Files of interest
- `src/components/CanvasDraw.jsx` — canvas interactions and controls
- `src/services/preprocess.js` — Canvas -> [1,28,28,1] tensor preprocessing
- `src/services/model.js` — load and run the TF.js model
