import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras

def build_model():
    model = keras.models.Sequential([
        keras.layers.Input(shape=(28,28,1)),
        keras.layers.Conv2D(16, 3, activation='relu'),
        keras.layers.MaxPool2D(2),
        keras.layers.Conv2D(32, 3, activation='relu'),
        keras.layers.MaxPool2D(2),
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dense(10, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def main():
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    x_train = x_train.astype('float32') / 255.0
    x_test = x_test.astype('float32') / 255.0
    x_train = x_train[..., None]
    x_test = x_test[..., None]

    model = build_model()
    model.fit(x_train, y_train, epochs=3, batch_size=128, validation_split=0.1)

    loss, acc = model.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {acc:.4f}")

    out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'model')
    os.makedirs(out_dir, exist_ok=True)

    # Save weights to JSON (shape + flattened list)
    weights = model.get_weights()
    serial = []
    for w in weights:
        arr = np.asarray(w)
        serial.append({
            'shape': arr.shape,
            'data': arr.flatten().tolist()
        })

    with open(os.path.join(out_dir, 'weights.json'), 'w') as f:
        json.dump(serial, f)

    # Save a small metadata file with ordering info
    meta = { 'num_weights': len(serial) }
    with open(os.path.join(out_dir, 'meta.json'), 'w') as f:
        json.dump(meta, f)

    print(f"Exported weights to {out_dir}/weights.json")

if __name__ == '__main__':
    main()
