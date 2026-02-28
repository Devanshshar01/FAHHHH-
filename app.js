// ============================================
// FAHHH! — Core Game Logic
// Camera capture + TF.js inference + scoring
// ============================================

(async function () {
  'use strict';

  // ---------- DOM Elements ----------
  const video       = document.getElementById('webcam');
  const overlay     = document.getElementById('overlay');
  const statusBadge = document.getElementById('status');
  const scoreValue  = document.getElementById('score-value');
  const fahhhText   = document.getElementById('fahhh-text');
  const fahhhSound  = document.getElementById('fahhh-sound');

  // ---------- Constants ----------
  const MODEL_PATH       = './model/model.json';
  const INPUT_SIZE       = 224;           // MobileNetV2 expected input
  const OPEN_THRESHOLD   = 0.85;          // confidence needed to trigger
  const INFERENCE_MS     = 200;           // run prediction every 200ms
  const COOLDOWN_MS      = 1500;          // minimum gap between FAHHH triggers
  const OPEN_CLASS_INDEX = 1;             // index for "open_mouth" (alphabetical)

  // ---------- State ----------
  let model          = null;
  let score        = 0;
  let lastTrigger  = 0;   // timestamp of last FAHHH trigger
  let loopId       = null;

  // Hidden canvas used to capture & resize frames for inference
  const inferCanvas = document.createElement('canvas');
  inferCanvas.width  = INPUT_SIZE;
  inferCanvas.height = INPUT_SIZE;
  const inferCtx = inferCanvas.getContext('2d');

  // =============================================
  // 1. Load the TensorFlow.js model
  // =============================================
  async function loadModel() {
    try {
      console.log('[FAHHH] Loading model from', MODEL_PATH);
      // Try graph model first (from tensorflowjs_converter), fall back to layers model
      try {
        model = await tf.loadGraphModel(MODEL_PATH);
        console.log('[FAHHH] Graph model loaded successfully.');
      } catch (_) {
        model = await tf.loadLayersModel(MODEL_PATH);
        console.log('[FAHHH] Layers model loaded successfully.');
      }
    } catch (err) {
      console.error('[FAHHH] Model load failed:', err);
      alert(
        '❌ Could not load the mouth-detection model.\n\n' +
        'Make sure "model/model.json" exists and the page is served over HTTP (not file://).'
      );
    }
  }

  // =============================================
  // 2. Start the webcam
  // =============================================
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      // Wait until the video dimensions are known, then size the overlay
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          overlay.width  = video.videoWidth;
          overlay.height = video.videoHeight;
          resolve();
        };
      });

      console.log('[FAHHH] Camera started:', video.videoWidth, 'x', video.videoHeight);
    } catch (err) {
      console.error('[FAHHH] Camera error:', err);
      alert(
        '📷 Camera access was denied or unavailable.\n\n' +
        'Please allow camera permissions and reload the page.'
      );
    }
  }

  // =============================================
  // 3. Run inference on a single frame
  // =============================================
  function predictFrame() {
    if (!model || video.readyState < 2) return null;

    // Draw the current video frame into the small inference canvas (224×224)
    inferCtx.drawImage(video, 0, 0, INPUT_SIZE, INPUT_SIZE);

    // Create a tensor, normalise pixels to [0, 1], add batch dimension
    const tensor = tf.tidy(() => {
      return tf.browser
        .fromPixels(inferCanvas)        // shape [224, 224, 3]  uint8
        .toFloat()
        .div(255.0)                     // normalise to [0, 1]
        .expandDims(0);                 // shape [1, 224, 224, 3]
    });

    // Run prediction — works with both graph models (.execute) and layers models (.predict)
    const prediction = model.predict ? model.predict(tensor) : model.execute(tensor);
    const probs = prediction.dataSync();  // Float32Array of length 2

    // Dispose tensors to prevent memory leaks
    tensor.dispose();
    prediction.dispose();

    return probs;
  }

  // =============================================
  // 4. FAHHH! trigger (sound + animation + score)
  // =============================================
  function triggerFahhh() {
    const now = Date.now();

    // Enforce cooldown so it doesn't fire repeatedly
    if (now - lastTrigger < COOLDOWN_MS) return;
    lastTrigger = now;

    // --- Increment score ---
    score += 1;
    scoreValue.textContent = score;

    // --- Play sound ---
    fahhhSound.currentTime = 0;
    fahhhSound.play().catch(() => {
      // Browsers may block autoplay until user interacts with the page
    });

    // --- Show comic pop text ---
    fahhhText.classList.remove('hidden', 'show');
    // Force reflow so the animation restarts even if already visible
    void fahhhText.offsetWidth;
    fahhhText.classList.add('show');

    // Hide again after the animation + a short display time
    setTimeout(() => {
      fahhhText.classList.remove('show');
      fahhhText.classList.add('hidden');
    }, 900);
  }

  // =============================================
  // 5. Draw bounding feedback on overlay canvas
  // =============================================
  function drawOverlay(isOpen, confidence) {
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Draw a coloured border frame as visual feedback
    const colour = isOpen ? 'rgba(255, 26, 26, 0.8)' : 'rgba(100, 255, 100, 0.5)';
    const lineW  = isOpen ? 6 : 3;
    ctx.strokeStyle = colour;
    ctx.lineWidth   = lineW;
    ctx.strokeRect(lineW / 2, lineW / 2, overlay.width - lineW, overlay.height - lineW);

    // Confidence label
    ctx.font      = '18px "Press Start 2P", monospace';
    ctx.fillStyle = colour;
    ctx.fillText(
      `${(confidence * 100).toFixed(1)}%`,
      12,
      overlay.height - 14
    );
  }

  // =============================================
  // 6. Main inference loop (runs every 200ms)
  // =============================================
  function startInferenceLoop() {
    loopId = setInterval(() => {
      const probs = predictFrame();
      if (!probs) return;

      const openConf = probs[OPEN_CLASS_INDEX];
      const isOpen   = openConf >= OPEN_THRESHOLD;

      // Update status badge
      if (isOpen) {
        statusBadge.textContent       = '👄 OPEN';
        statusBadge.dataset.state     = 'open';
        statusBadge.classList.add('open');
        triggerFahhh();
      } else {
        statusBadge.textContent       = '😐 CLOSED';
        statusBadge.dataset.state     = 'closed';
        statusBadge.classList.remove('open');
      }

      // Visual feedback on the overlay canvas
      drawOverlay(isOpen, openConf);
    }, INFERENCE_MS);
  }

  // =============================================
  // 7. Initialise everything
  // =============================================
  await loadModel();
  await startCamera();

  if (model && video.srcObject) {
    startInferenceLoop();
    console.log('[FAHHH] Game running — open your mouth!');
  }
})();
