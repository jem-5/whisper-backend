import express from "express";
import multer from "multer";
import cors from "cors";
import whisperpkg from "nodejs-whisper";

const { createWhisper } = whisperpkg;

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "/tmp" });

// 1️⃣ Initialize model CORRECTLY
const whisper = await createWhisper({
  modelName: "tiny",
  modelPath: "./models",
  withCuda: false,
  autoDownloadModelName: "tiny",
  removeWavFileAfterTranscription: true,
});

// 2️⃣ Transcription API
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    const result = await whisper.transcribe(req.file.path, {
      language: "ar",
    });

    res.json({ text: result.text });
  } catch (err) {
    console.error("Whisper error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// 3️⃣ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
