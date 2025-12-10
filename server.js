import express from "express";
import multer from "multer";
import cors from "cors";
import pkg from "nodejs-whisper";

const { nodewhisper } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Uploads go in /tmp
const upload = multer({ dest: "/tmp" });

// ✅ 1. Initialize ONCE
const whisper = await nodewhisper({
  modelName: "models/ggml-tiny.bin", // must be inside repo
  removeWavFileAfterTranscription: true,
});

// ✅ 2. API route
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    // 🎤 Transcribe using the instance
    const result = await whisper(req.file.path, {
      language: "ar",
    });

    res.json({ text: result.text ?? result });
  } catch (err) {
    console.error("Whisper error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Required for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
