const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const { uploadParticipants, getParticipants, getEligibleParticipants } = require('./controllers/participantsController');
const { conductDraw, getDrawHistory, getWinners, clearAllWinners } = require('./controllers/drawController');
const { exportEligibleToExcel, exportEligibleToPDF, exportWinnersToExcel } = require('./controllers/exportController');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Routes
app.post('/api/participants/upload', upload.single('file'), uploadParticipants);
app.get('/api/participants', getParticipants);
app.get('/api/participants/eligible', getEligibleParticipants);

app.post('/api/draw/conduct', conductDraw);
app.get('/api/draw/history', getDrawHistory);
app.get('/api/draw/winners', getWinners);
app.delete('/api/draw/winners', clearAllWinners);

app.get('/api/export/eligible/excel', exportEligibleToExcel);
app.get('/api/export/eligible/pdf', exportEligibleToPDF);
app.get('/api/export/winners/excel', exportWinnersToExcel);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Something went wrong!' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
