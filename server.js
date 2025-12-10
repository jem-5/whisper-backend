import express from "express";
import multer from "multer";
import cors from "cors";
import pkg from "nodejs-whisper";

const { nodewhisper } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Uploads go in /tmp on Render
const upload = multer({ dest: "/tmp" });

// 🔥 Initialize model ONCE (important!)
await nodewhisper({
  modelName: "models/ggml-tiny.bin", // Must be in the project root
  removeWavFileAfterTranscription: true,
});

// 🎤 POST /api/transcribe
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    // 🔥 Run transcription using nodewhisper(), NOT whisper()
    const result = await nodewhisper(req.file.path, {
      language: "ar",
      removeWavFileAfterTranscription: true,
    });

    res.json({ text: result.text ?? result });
  } catch (err) {
    console.error("Whisper error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Render port requirement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
