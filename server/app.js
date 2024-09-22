import express from "express";
import { createReadStream, createWriteStream, statSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/video", (req, res) => {
  const filePath = path.join(__dirname, "public/demo.mp4");

  try {
    const stat = statSync(filePath);
    const range = req.headers.range;

    if (!range) {
      return res.status(400).send("Requires Range header");
    }

    const chunkSize = 10 ** 6; // Set a reasonable chunk size (1MB)
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, stat.size - 1);
    const contentLength = end - start + 1;

    const header = {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, header);

    const fileStream = createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).send("File not found or an error occurred.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
