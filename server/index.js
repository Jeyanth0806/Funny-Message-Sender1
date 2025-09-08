const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// In-memory store for messages
const messages = {};

app.post('/api/share', upload.single('image'), (req, res) => {
  const { message } = req.body;
  const id = uuidv4();
  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }
  messages[id] = { message, imageUrl };
  res.json({ link: `/view/${id}` });
});

app.get('/api/message/:id', (req, res) => {
  const { id } = req.params;
  if (messages[id]) {
    res.json(messages[id]);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

app.listen(PORT, () => {
  if (!fs.existsSync(path.join(__dirname, 'uploads'))){
    fs.mkdirSync(path.join(__dirname, 'uploads'));
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
