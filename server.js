import express from "express";
import multer from "multer";
import cors from "cors";
import pkg from "nodejs-whisper";

const { nodewhisper } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Upload to /tmp (Render supports it)
const upload = multer({ dest: "/tmp" });

// NO INITIALIZATION
// NO createWhisper
// NO modelName/modelPath object

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    // Direct call (the ONLY allowed API)
    const result = await nodewhisper(req.file.path, {
      autoDownloadModelName: "tiny", // works on Render
      language: "ar",
      removeWavFileAfterTranscription: true,
    });

    res.json({ text: result.text ?? result });
  } catch (err) {
    console.error("Whisper error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
