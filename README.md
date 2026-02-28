<p align="center">
  <img src="https://img.shields.io/badge/FAHHH!-🎮_Mouth_Detection_Game-ff1a1a?style=for-the-badge&labelColor=0a0a0a" alt="FAHHH! Badge" />
</p>

<h1 align="center">😱 FAHHH!</h1>

<p align="center">
  <strong>A retro-arcade browser game that detects when you open your mouth — and screams back at you.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=flat-square&logo=tensorflow&logoColor=white" />
  <img src="https://img.shields.io/badge/MobileNetV2-Transfer_Learning-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
</p>

---

## 📖 About

**FAHHH!** is a fun, webcam-powered browser game built with TensorFlow.js. A custom-trained MobileNetV2 binary classifier watches your face through the webcam and detects whether your mouth is **open** or **closed** in real-time. Every time you open your mouth wide enough, the game:

- 🔊 Plays the iconic *"FAHHH!"* sound effect
- 💥 Flashes a comic-book style pop animation
- 🏆 Increments your score

The entire experience runs **client-side** — no server, no API calls, no data leaves your browser.

---

## 🎮 Demo

| Mouth Closed | Mouth Open |
|:---:|:---:|
| 😐 Status: **CLOSED** (grey badge) | 👄 Status: **OPEN** (glowing red badge) |
| Score unchanged | Score +1, *FAHHH!* triggered |

---

## 🗂️ Project Structure

```
FAHHHH-/
├── index.html                 # Main game page
├── style.css                  # Retro-arcade / comic book theme
├── app.js                     # Core game logic (camera + inference + scoring)
├── fahhhhhhhhhhhhhh.mp3       # The legendary FAHHH sound effect
├── train_model.ipynb          # Jupyter notebook to train the classifier
├── training/
│   └── dataset/
│       ├── open_mouth/        # Training images — mouth open
│       └── closed_mouth/      # Training images — mouth closed
├── model_export/              # TF.js model output from training
├── model/
│   ├── model.json             # TF.js model (loaded by app.js)
│   └── group1-shard1of1.bin   # Model weights
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (for training)
- **Node.js** or any local HTTP server (for serving the game)
- A modern browser with webcam support (Chrome, Edge, Firefox)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/FAHHHH-.git
cd FAHHHH-
```

### 2. Prepare the Dataset

Add your images to the dataset folders:

```
training/dataset/open_mouth/    → images of open mouths
training/dataset/closed_mouth/  → images of closed mouths
```

> 💡 **Tip:** Aim for **200+ images per class** for good accuracy. Use varied lighting, angles, and faces. Webcam selfies work best since that's what the game uses at runtime.

### 3. Train the Model

Open `train_model.ipynb` in VS Code or Jupyter and run all cells. The notebook will:

1. Install dependencies (`tensorflow`, `tensorflowjs`)
2. Load & augment images with `ImageDataGenerator`
3. Build a MobileNetV2 transfer learning model
4. Train for 15 epochs
5. Plot accuracy & loss curves
6. Export the model to `model_export/`

### 4. Deploy the Model

Copy the exported model into the `model/` folder:

```bash
# Windows PowerShell
Copy-Item -Path "model_export\*" -Destination "model\" -Recurse

# macOS / Linux
cp -r model_export/* model/
```

### 5. Run the Game

Start a local HTTP server from the project root:

```bash
python -m http.server 8000
```

Open **http://localhost:8000** in your browser, allow camera access, and start FAHHHing!

---

## 🧠 Model Architecture

| Layer | Details |
|-------|---------|
| **Base** | MobileNetV2 (ImageNet, frozen) |
| **Pooling** | Global Average Pooling 2D |
| **Regularisation** | Dropout (0.3) |
| **Hidden** | Dense — 128 units, ReLU |
| **Output** | Dense — 2 units, Softmax |

- **Input size:** 224 × 224 × 3
- **Classes:** `closed_mouth` (0), `open_mouth` (1)
- **Optimizer:** Adam (lr = 1e-3)
- **Loss:** Categorical Cross-Entropy

---

## ⚙️ Game Configuration

Key constants in `app.js` you can tweak:

| Constant | Default | Description |
|----------|---------|-------------|
| `OPEN_THRESHOLD` | `0.85` | Confidence needed to trigger FAHHH |
| `INFERENCE_MS` | `200` | Prediction interval (ms) |
| `COOLDOWN_MS` | `1500` | Minimum gap between triggers (ms) |
| `OPEN_CLASS_INDEX` | `1` | Index of "open_mouth" in model output |

---

## 🎨 Design

The UI features a **retro-arcade / comic book** aesthetic:

- 🖤 Deep black background with CRT scanline overlay
- 🟡 "Bangers" Google Font title in bright yellow with text-stroke
- 🔴 Comic-panel webcam frame with red glow box-shadow
- 💥 `fahhhPop` CSS animation — scales from 0 → 1.2 → 1
- 🟢 Pill-shaped status badge with glow transitions
- 🕹️ "Press Start 2P" monospace font for HUD elements
- 📱 Fully responsive flexbox layout

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **TensorFlow / Keras** | Model training (Python) |
| **TensorFlow.js** | Browser-side inference |
| **MobileNetV2** | Pre-trained feature extractor |
| **ImageDataGenerator** | Data augmentation |
| **Web Audio API** | Sound playback |
| **Canvas API** | Overlay drawing & frame capture |
| **getUserMedia** | Webcam access |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Open your mouth. Score points. FAHHH!</strong>
</p>
