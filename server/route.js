const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const unzipper = require('unzipper'); 
const path = require('path');
const fs = require('fs');
const xmlToHtml = require('./xml-to-html');
const port = 1001;

app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const extractPath = path.join(__dirname, 'uploads');

    const directory = await unzipper.Open.file(filePath);
    for(let entry of directory.files) {
      if (entry.path.includes('activities')) {
        const outputPath = path.join(extractPath, entry.path);
        if (entry.type === 'Directory') {
          fs.mkdirSync(outputPath, { recursive: true });
        } else {
          entry.stream().pipe(fs.createWriteStream(outputPath));
        }
      }
    }
    console.log(`Extracted to ${extractPath}`);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/convert', async (req, res) => {
  try {
    const activitiesPath = path.join(__dirname, 'uploads', 'activities');
    await xmlToHtml.convertFiles(activitiesPath);
    res.json({ message: "Conversion successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get('/preview', function(req, res) {
  const file = path.join(__dirname, '..', 'output', 'output.html');
  res.sendFile(file);
});

app.get('/download', function(req, res){
  const file = path.join(__dirname, '..', 'output', 'output.docx');
  res.download(file); // Set disposition and send it.
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
