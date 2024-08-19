const express = require('express');
const multer = require('multer');
const fs = require('fs');
const mammoth = require('mammoth');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://umoo:umoo@database.hfh6yj6.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Get the default connection
const db = mongoose.connection;

// Event handlers for database connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.json());
const pathModule = require('path');
app.post('/api/convert', upload.single('file'), (req, res) => {
  const { path } = req.file;

  mammoth.convertToHtml({ path: path })
    .then((result) => {
      const html = result.value;
      const convertedFileName = `${Date.now()}.pdf`;
      const convertedFilePath = pathModule.join(__dirname, 'converted', convertedFileName);

      fs.writeFile(convertedFilePath, html, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error saving converted PDF.');
        } else {
          res.json({ url: `/converted/${convertedFileName}` });
        }
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error converting to PDF.');
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
