const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ufc_data.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
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
});

// Sample UFC fighter data (since live scraping might be blocked)
const sampleFighters = [
  {
    name: "Jon Jones",
    nickname: "Bones",
    weight_class: "Light Heavyweight",
    height_cm: 193,
    reach_cm: 215,
    stance: "Orthodox",
    wins: 26,
    losses: 1,
    draws: 0,
    win_by_ko: 10,
    win_by_submission: 6,
    win_by_decision: 10
  },
  {
    name: "Islam Makhachev",
    nickname: "",
    weight_class: "Lightweight",
    height_cm: 178,
    reach_cm: 178,
    stance: "Orthodox",
    wins: 24,
    losses: 1,
    draws: 0,
    win_by_ko: 4,
    win_by_submission: 11,
    win_by_decision: 9
  },
  {
    name: "Alexander Volkanovski",
    nickname: "The Great",
    weight_class: "Featherweight",
    height_cm: 168,
    reach_cm: 178,
    stance: "Orthodox",
    wins: 25,
    losses: 3,
    draws: 0,
    win_by_ko: 12,
    win_by_submission: 1,
    win_by_decision: 12
  },
  {
    name: "Leon Edwards",
    nickname: "Rocky",
    weight_class: "Welterweight",
    height_cm: 183,
    reach_cm: 188,
    stance: "Orthodox",
    wins: 22,
    losses: 3,
    draws: 1,
    win_by_ko: 7,
    win_by_submission: 2,
    win_by_decision: 13
  },
  {
    name: "Sean Strickland",
    nickname: "Tarzan",
    weight_class: "Middleweight",
    height_cm: 185,
    reach_cm: 193,
    stance: "Orthodox",
    wins: 28,
    losses: 6,
    draws: 0,
    win_by_ko: 16,
    win_by_submission: 1,
    win_by_decision: 11
  },
  {
    name: "Alex Pereira",
    nickname: "Poatan",
    weight_class: "Light Heavyweight",
    height_cm: 193,
    reach_cm: 201,
    stance: "Orthodox",
    wins: 9,
    losses: 2,
    draws: 0,
    win_by_ko: 7,
    win_by_submission: 0,
    win_by_decision: 2
  },
  {
    name: "Tom Aspinall",
    nickname: "",
    weight_class: "Heavyweight",
    height_cm: 196,
    reach_cm: 208,
    stance: "Orthodox",
    wins: 14,
    losses: 3,
    draws: 0,
    win_by_ko: 8,
    win_by_submission: 4,
    win_by_decision: 2
  },
  {
    name: "Amanda Nunes",
    nickname: "The Lioness",
    weight_class: "Women's Bantamweight",
    height_cm: 173,
    reach_cm: 175,
    stance: "Orthodox",
    wins: 22,
    losses: 5,
    draws: 0,
    win_by_ko: 14,
    win_by_submission: 4,
    win_by_decision: 4
  },
  {
    name: "Zhang Weili",
    nickname: "Magnum",
    weight_class: "Women's Strawweight",
    height_cm: 164,
    reach_cm: 157,
    stance: "Orthodox",
    wins: 24,
    losses: 3,
    draws: 0,
    win_by_ko: 9,
    win_by_submission: 7,
    win_by_decision: 8
  },
  {
    name: "Conor McGregor",
    nickname: "The Notorious",
    weight_class: "Lightweight",
    height_cm: 175,
    reach_cm: 188,
    stance: "Southpaw",
    wins: 22,
    losses: 6,
    draws: 0,
    win_by_ko: 19,
    win_by_submission: 1,
    win_by_decision: 2
  },
  {
    name: "Khabib Nurmagomedov",
    nickname: "The Eagle",
    weight_class: "Lightweight",
    height_cm: 178,
    reach_cm: 178,
    stance: "Orthodox",
    wins: 29,
    losses: 0,
    draws: 0,
    win_by_ko: 8,
    win_by_submission: 11,
    win_by_decision: 10
  },
  {
    name: "Israel Adesanya",
    nickname: "The Last Stylebender",
    weight_class: "Middleweight",
    height_cm: 193,
    reach_cm: 203,
    stance: "Orthodox",
    wins: 24,
    losses: 3,
    draws: 0,
    win_by_ko: 15,
    win_by_submission: 0,
    win_by_decision: 9
  },
  {
    name: "Kamaru Usman",
    nickname: "The Nigerian Nightmare",
    weight_class: "Welterweight",
    height_cm: 183,
    reach_cm: 193,
    stance: "Orthodox",
    wins: 20,
    losses: 4,
    draws: 0,
    win_by_ko: 9,
    win_by_submission: 1,
    win_by_decision: 10
  },
  {
    name: "Francis Ngannou",
    nickname: "The Predator",
    weight_class: "Heavyweight",
    height_cm: 193,
    reach_cm: 211,
    stance: "Orthodox",
    wins: 17,
    losses: 3,
    draws: 0,
    win_by_ko: 12,
    win_by_submission: 4,
    win_by_decision: 1
  },
  {
    name: "Dustin Poirier",
    nickname: "The Diamond",
    weight_class: "Lightweight",
    height_cm: 175,
    reach_cm: 183,
    stance: "Orthodox",
    wins: 29,
    losses: 8,
    draws: 0,
    win_by_ko: 14,
    win_by_submission: 7,
    win_by_decision: 8
  }
];

// Sample fight data
const sampleFights = [
  {
    fighter1_name: "Jon Jones",
    fighter2_name: "Ciryl Gane",
    winner_name: "Jon Jones",
    fight_date: "2023-03-04",
    weight_class: "Heavyweight",
    rounds: 1,
    method: "Submission",
    fight_time: "2:04",
    event_name: "UFC 285"
  },
  {
    fighter1_name: "Islam Makhachev",
    fighter2_name: "Alexander Volkanovski",
    winner_name: "Islam Makhachev",
    fight_date: "2023-02-11",
    weight_class: "Lightweight",
    rounds: 5,
    method: "Decision",
    fight_time: "25:00",
    event_name: "UFC 284"
  },
  {
    fighter1_name: "Leon Edwards",
    fighter2_name: "Kamaru Usman",
    winner_name: "Leon Edwards",
    fight_date: "2022-08-20",
    weight_class: "Welterweight",
    rounds: 5,
    method: "KO",
    fight_time: "4:04",
    event_name: "UFC 278"
  },
  {
    fighter1_name: "Alex Pereira",
    fighter2_name: "Israel Adesanya",
    winner_name: "Alex Pereira",
    fight_date: "2022-11-12",
    weight_class: "Middleweight",
    rounds: 5,
    method: "TKO",
    fight_time: "2:01",
    event_name: "UFC 281"
  },
  {
    fighter1_name: "Zhang Weili",
    fighter2_name: "Amanda Lemos",
    winner_name: "Zhang Weili",
    fight_date: "2023-08-19",
    weight_class: "Women's Strawweight",
    rounds: 3,
    method: "Decision",
    fight_time: "15:00",
    event_name: "UFC 292"
  }
];

async function insertFighters() {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO fighters 
      (name, nickname, weight_class, height_cm, reach_cm, stance, wins, losses, draws, win_by_ko, win_by_submission, win_by_decision)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    const total = sampleFighters.length;

    sampleFighters.forEach(fighter => {
      stmt.run([
        fighter.name,
        fighter.nickname,
        fighter.weight_class,
        fighter.height_cm,
        fighter.reach_cm,
        fighter.stance,
        fighter.wins,
        fighter.losses,
        fighter.draws,
        fighter.win_by_ko,
        fighter.win_by_submission,
        fighter.win_by_decision
      ], function(err) {
        if (err) {
          console.error(`Error inserting fighter ${fighter.name}:`, err);
        } else {
          console.log(`Inserted fighter: ${fighter.name}`);
        }
        
        completed++;
        if (completed === total) {
          stmt.finalize();
          resolve();
        }
      });
    });
  });
}

async function insertFights() {
  return new Promise((resolve, reject) => {
    // First, get fighter IDs
    const getFighterIds = () => {
      return new Promise((resolve, reject) => {
        db.all("SELECT id, name FROM fighters", [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          const fighterMap = {};
          rows.forEach(row => {
            fighterMap[row.name] = row.id;
          });
          resolve(fighterMap);
        });
      });
    };

    getFighterIds().then(fighterMap => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO fights 
        (fighter1_id, fighter2_id, winner_id, fight_date, weight_class, rounds, method, fight_time, event_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      let completed = 0;
      const total = sampleFights.length;

      sampleFights.forEach(fight => {
        const fighter1_id = fighterMap[fight.fighter1_name];
        const fighter2_id = fighterMap[fight.fighter2_name];
        const winner_id = fighterMap[fight.winner_name];

        if (fighter1_id && fighter2_id && winner_id) {
          stmt.run([
            fighter1_id,
            fighter2_id,
            winner_id,
            fight.fight_date,
            fight.weight_class,
            fight.rounds,
            fight.method,
            fight.fight_time,
            fight.event_name
          ], function(err) {
            if (err) {
              console.error(`Error inserting fight:`, err);
            } else {
              console.log(`Inserted fight: ${fight.fighter1_name} vs ${fight.fighter2_name}`);
            }
            
            completed++;
            if (completed === total) {
              stmt.finalize();
              resolve();
            }
          });
        } else {
          console.error(`Missing fighter IDs for fight: ${fight.fighter1_name} vs ${fight.fighter2_name}`);
          completed++;
          if (completed === total) {
            stmt.finalize();
            resolve();
          }
        }
      });
    }).catch(reject);
  });
}

async function scrapeUFCData() {
  console.log('Starting UFC data scraping...');
  
  try {
    console.log('Inserting sample fighters...');
    await insertFighters();
    
    console.log('Inserting sample fights...');
    await insertFights();
    
    console.log('✅ Data scraping completed successfully!');
    console.log(`Added ${sampleFighters.length} fighters and ${sampleFights.length} fights to the database.`);
    
  } catch (error) {
    console.error('❌ Error during data scraping:', error);
  } finally {
    db.close();
  }
}

// Run the scraper
if (require.main === module) {
  scrapeUFCData();
}

module.exports = { scrapeUFCData };
