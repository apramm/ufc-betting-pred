const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database setup
const dbPath = path.join(__dirname, '../data/ufc_data.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Fighters table
  db.run(`CREATE TABLE IF NOT EXISTS fighters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    nickname TEXT,
    weight_class TEXT,
    height_cm REAL,
    reach_cm REAL,
    stance TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    win_by_ko INTEGER DEFAULT 0,
    win_by_submission INTEGER DEFAULT 0,
    win_by_decision INTEGER DEFAULT 0,
    avg_fight_time REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Fights table
  db.run(`CREATE TABLE IF NOT EXISTS fights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fighter1_id INTEGER,
    fighter2_id INTEGER,
    winner_id INTEGER,
    fight_date DATE,
    weight_class TEXT,
    rounds INTEGER,
    method TEXT,
    fight_time TEXT,
    event_name TEXT,
    FOREIGN KEY (fighter1_id) REFERENCES fighters (id),
    FOREIGN KEY (fighter2_id) REFERENCES fighters (id),
    FOREIGN KEY (winner_id) REFERENCES fighters (id)
  )`);

  // Predictions table
  db.run(`CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fighter1_id INTEGER,
    fighter2_id INTEGER,
    predicted_winner_id INTEGER,
    confidence REAL,
    prediction_factors TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter1_id) REFERENCES fighters (id),
    FOREIGN KEY (fighter2_id) REFERENCES fighters (id),
    FOREIGN KEY (predicted_winner_id) REFERENCES fighters (id)
  )`);
});

// API Routes

// Get all fighters
app.get('/api/fighters', (req, res) => {
  const query = `
    SELECT f.*, 
           COUNT(fights.id) as total_fights,
           AVG(CASE WHEN fights.winner_id = f.id THEN 1 ELSE 0 END) as win_rate
    FROM fighters f
    LEFT JOIN fights ON (f.id = fights.fighter1_id OR f.id = fights.fighter2_id)
    GROUP BY f.id
    ORDER BY f.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Search fighters
app.get('/api/fighters/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  const query = `
    SELECT * FROM fighters 
    WHERE name LIKE ? OR nickname LIKE ?
    ORDER BY name
    LIMIT 10
  `;
  
  db.all(query, [`%${q}%`, `%${q}%`], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get fighter by ID
app.get('/api/fighters/:id', (req, res) => {
  const query = `
    SELECT f.*,
           COUNT(fights.id) as total_fights,
           SUM(CASE WHEN fights.winner_id = f.id THEN 1 ELSE 0 END) as wins,
           SUM(CASE WHEN fights.winner_id != f.id AND fights.winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses
    FROM fighters f
    LEFT JOIN fights ON (f.id = fights.fighter1_id OR f.id = fights.fighter2_id)
    WHERE f.id = ?
    GROUP BY f.id
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Fighter not found' });
      return;
    }
    res.json(row);
  });
});

// Get fighter's fight history
app.get('/api/fighters/:id/fights', (req, res) => {
  const query = `
    SELECT f.*,
           f1.name as fighter1_name,
           f2.name as fighter2_name,
           winner.name as winner_name,
           CASE 
             WHEN f.fighter1_id = ? THEN f2.name
             ELSE f1.name
           END as opponent_name
    FROM fights f
    JOIN fighters f1 ON f.fighter1_id = f1.id
    JOIN fighters f2 ON f.fighter2_id = f2.id
    LEFT JOIN fighters winner ON f.winner_id = winner.id
    WHERE f.fighter1_id = ? OR f.fighter2_id = ?
    ORDER BY f.fight_date DESC
  `;
  
  db.all(query, [req.params.id, req.params.id, req.params.id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create prediction
app.post('/api/predict', (req, res) => {
  const { fighter1_id, fighter2_id, weight_class, rounds } = req.body;

  if (!fighter1_id || !fighter2_id) {
    return res.status(400).json({ error: 'Both fighters are required' });
  }

  // Call Python prediction script
  const pythonScript = spawn('python', [
    path.join(__dirname, '../scripts/predict_simple.py'),
    fighter1_id.toString(),
    fighter2_id.toString(),
    weight_class || '',
    rounds ? rounds.toString() : '3'
  ]);

  let result = '';
  let error = '';

  pythonScript.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonScript.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonScript.on('close', (code) => {
    if (code !== 0) {
      console.error('Python script error:', error);
      // Fallback to simple prediction based on win rates
      const query = `
        SELECT f.id, f.name,
               COUNT(fights.id) as total_fights,
               AVG(CASE WHEN fights.winner_id = f.id THEN 1 ELSE 0 END) as win_rate
        FROM fighters f
        LEFT JOIN fights ON (f.id = fights.fighter1_id OR f.id = fights.fighter2_id)
        WHERE f.id IN (?, ?)
        GROUP BY f.id
      `;
      
      db.all(query, [fighter1_id, fighter2_id], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (rows.length !== 2) {
          res.status(400).json({ error: 'Invalid fighter IDs' });
          return;
        }

        const [fighter1, fighter2] = rows;
        const predicted_winner = fighter1.win_rate > fighter2.win_rate ? fighter1 : fighter2;
        const confidence = Math.abs(fighter1.win_rate - fighter2.win_rate) * 100;

        const prediction = {
          fighter1,
          fighter2,
          predicted_winner,
          confidence: Math.min(confidence + 50, 95), // Ensure reasonable confidence
          factors: ['Win rate comparison', 'Historical performance'],
          prediction_method: 'Fallback win rate comparison'
        };

        // Save prediction to database
        const insertQuery = `
          INSERT INTO predictions (fighter1_id, fighter2_id, predicted_winner_id, confidence, prediction_factors)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [
          fighter1_id,
          fighter2_id,
          predicted_winner.id,
          prediction.confidence,
          JSON.stringify(prediction.factors)
        ], function(err) {
          if (err) {
            console.error('Error saving prediction:', err);
          }
        });

        res.json(prediction);
      });
    } else {
      try {
        const prediction = JSON.parse(result);
        res.json(prediction);
      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        res.status(500).json({ error: 'Error processing prediction' });
      }
    }
  });
});

// Get weight classes
app.get('/api/weight-classes', (req, res) => {
  const weightClasses = [
    'Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight',
    'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight',
    'Heavyweight', 'Women\'s Strawweight', 'Women\'s Flyweight',
    'Women\'s Bantamweight', 'Women\'s Featherweight'
  ];
  res.json(weightClasses);
});

// Get recent predictions
app.get('/api/predictions', (req, res) => {
  const query = `
    SELECT p.*,
           f1.name as fighter1_name,
           f2.name as fighter2_name,
           winner.name as predicted_winner_name
    FROM predictions p
    JOIN fighters f1 ON p.fighter1_id = f1.id
    JOIN fighters f2 ON p.fighter2_id = f2.id
    JOIN fighters winner ON p.predicted_winner_id = winner.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
