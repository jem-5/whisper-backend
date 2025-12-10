import express from "express";
import multer from "multer";
import cors from "cors";
import whisperpkg from "nodejs-whisper";

const { nodewhisper } = whisperpkg;

const app = express();
app.use(cors());
app.use(express.json());

// Uploads go in /tmp (Render supports this)
const upload = multer({ dest: "/tmp" });

// 1️⃣ Initialize whisper (only once)
const whisper = await nodewhisper({
  modelName: "tiny", // NOT a file path
  modelPath: "./models", // folder containing ggml-tiny.bin
  options: {
    removeWavFileAfterTranscription: true,
  },
});

// 2️⃣ API route
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    const result = await whisper(req.file.path, {
      language: "ar",
    });

    res.json({ text: result.text ?? result });
  } catch (err) {
    console.error("Whisper error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// 3️⃣ Start server (Render will detect this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
