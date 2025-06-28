# UFC Fight Predictor - Backend Implementation Plan

## Overview
This document outlines the backend architecture for collecting real-time UFC data, managing fighter information, and serving it to the frontend application.

## Requirements Summary
1. **Data Collection**: Automated scraping of upcoming UFC events
2. **Fighter Data**: Comprehensive fighter profiles with detailed statistics
3. **Image Management**: Fighter photos and media assets
4. **Focus**: Prioritize main events to keep scope manageable

## Architecture

### 1. Data Collection Service

#### UFC Event Scraping
**Sources to explore:**
- UFC.com official events page
- ESPN MMA events
- MMA news sites (MMAJunkie, MMAFighting)
- Sherdog.com for historical data

**Data Points:**
```javascript
{
  eventId: "ufc-300",
  name: "UFC 300: Pereira vs Hill",
  date: "2024-04-13T20:00:00Z",
  location: "T-Mobile Arena, Las Vegas",
  status: "upcoming", // upcoming, live, completed
  fights: [
    {
      fightId: "main-event-300",
      cardPosition: "main", // main, co-main, main-card, prelims
      weightClass: "Light Heavyweight",
      fighter1: { id: "alex-pereira", name: "Alex Pereira" },
      fighter2: { id: "jamahal-hill", name: "Jamahal Hill" },
      odds: { fighter1: "-140", fighter2: "+120" }
    }
  ]
}
```

#### Fighter Data Collection
**Sources to explore:**
- UFC.com fighter profiles
- Sherdog fighter pages
- ESPN athlete profiles
- Social media for training updates

**Comprehensive Fighter Profile:**
```javascript
{
  fighterId: "alex-pereira",
  basicInfo: {
    name: "Alex Pereira",
    nickname: "Poatan",
    nationality: "Brazil",
    age: 36,
    height: "6'4\"",
    reach: "79\"",
    stance: "orthodox"
  },
  physicalAttributes: {
    weightClass: "Light Heavyweight",
    naturalWeight: "205 lbs",
    cuttingWeight: true, // if fighting outside natural class
    fightingOutOf: "São Paulo, Brazil"
  },
  fightRecord: {
    wins: 8,
    losses: 2,
    draws: 0,
    noContests: 0,
    finishRate: {
      ko: 85.7,
      submission: 0,
      decision: 14.3
    }
  },
  fightHistory: [
    {
      date: "2023-11-11",
      opponent: "Jiri Prochazka",
      result: "W",
      method: "TKO",
      round: 2,
      event: "UFC 295"
    }
  ],
  currentStatus: {
    rankingPosition: 1,
    champion: true,
    lastFight: "2023-11-11",
    nextFight: "2024-04-13",
    injuryStatus: "healthy" // healthy, injured, recovering
  },
  trainingInfo: {
    gym: "Fighting Nerds",
    coaches: ["Plinio Cruz"],
    trainingPartners: ["Israel Adesanya"],
    lastTrainingUpdate: "2024-04-01"
  },
  media: {
    profileImage: "https://cdn.ufc.com/alex-pereira-profile.jpg",
    actionShots: ["url1", "url2"],
    lastUpdated: "2024-04-01"
  }
}
```

### 2. Backend Services Architecture

```
backend/
├── services/
│   ├── scrapers/
│   │   ├── ufc-events-scraper.js
│   │   ├── fighter-data-scraper.js
│   │   └── image-scraper.js
│   ├── data-processor/
│   │   ├── event-processor.js
│   │   ├── fighter-processor.js
│   │   └── odds-processor.js
│   └── api/
│       ├── events-api.js
│       ├── fighters-api.js
│       └── images-api.js
├── database/
│   ├── models/
│   │   ├── Event.js
│   │   ├── Fighter.js
│   │   ├── Fight.js
│   │   └── Image.js
│   └── migrations/
├── jobs/
│   ├── daily-event-sync.js
│   ├── fighter-update-job.js
│   └── image-sync-job.js
└── utils/
    ├── rate-limiter.js
    ├── proxy-manager.js
    └── image-optimizer.js
```

### 3. Database Design

#### Events Table
```sql
CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(200),
  venue VARCHAR(200),
  status ENUM('upcoming', 'live', 'completed'),
  main_event_id VARCHAR(50),
  poster_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Fighters Table
```sql
CREATE TABLE fighters (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  nationality VARCHAR(50),
  age INTEGER,
  height VARCHAR(10),
  reach VARCHAR(10),
  stance ENUM('orthodox', 'southpaw', 'switch'),
  weight_class VARCHAR(50),
  natural_weight VARCHAR(20),
  ranking_position INTEGER,
  is_champion BOOLEAN DEFAULT FALSE,
  profile_image VARCHAR(500),
  gym VARCHAR(200),
  record_wins INTEGER DEFAULT 0,
  record_losses INTEGER DEFAULT 0,
  record_draws INTEGER DEFAULT 0,
  injury_status ENUM('healthy', 'injured', 'recovering'),
  last_fight_date DATE,
  next_fight_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Fights Table
```sql
CREATE TABLE fights (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) REFERENCES events(id),
  fighter1_id VARCHAR(50) REFERENCES fighters(id),
  fighter2_id VARCHAR(50) REFERENCES fighters(id),
  weight_class VARCHAR(50),
  card_position ENUM('main', 'co-main', 'main-card', 'prelims'),
  scheduled_rounds INTEGER,
  odds_fighter1 VARCHAR(10),
  odds_fighter2 VARCHAR(10),
  result ENUM('pending', 'fighter1_win', 'fighter2_win', 'draw', 'no_contest'),
  method VARCHAR(50),
  round_finished INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Images Table
```sql
CREATE TABLE images (
  id VARCHAR(50) PRIMARY KEY,
  fighter_id VARCHAR(50) REFERENCES fighters(id),
  image_type ENUM('profile', 'action', 'training'),
  url VARCHAR(500) NOT NULL,
  local_path VARCHAR(500),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Data Collection Strategy

#### Phase 1: Core Event Data
1. **Daily Event Sync**
   - Scrape upcoming events from UFC.com
   - Focus on main events only initially
   - Store basic event information

2. **Fighter Profile Collection**
   - For each fighter in upcoming main events
   - Collect comprehensive profile data
   - Download and optimize profile images

#### Phase 2: Enhanced Data
1. **Fight History Integration**
   - Historical fight data for context
   - Performance statistics
   - Recent form analysis

2. **Training & Recovery Data**
   - Social media monitoring for training updates
   - Injury reports from MMA news sources
   - Camp information

#### Phase 3: Real-time Updates
1. **Live Event Tracking**
   - Real-time fight results
   - Odds movement tracking
   - Performance metrics

### 5. API Endpoints

```javascript
// Events
GET /api/events                 // Get all upcoming events
GET /api/events/:id            // Get specific event details
GET /api/events/:id/fights     // Get fights for an event

// Fighters
GET /api/fighters              // Get all fighters (with filtering)
GET /api/fighters/:id          // Get detailed fighter profile
GET /api/fighters/:id/fights   // Get fighter's fight history
GET /api/fighters/:id/images   // Get fighter images

// Images
GET /api/images/fighter/:id    // Get optimized fighter image
GET /api/images/event/:id      // Get event poster

// Admin (for data management)
POST /api/admin/sync-events    // Trigger event sync
POST /api/admin/sync-fighter/:id // Trigger specific fighter sync
```

### 6. Implementation Phases

#### Week 1-2: Foundation
- Set up Node.js/Express server
- Database schema and models
- Basic UFC events scraper
- Simple fighter data collection

#### Week 3-4: Core Features
- Comprehensive fighter profiles
- Image collection and optimization
- API endpoints for frontend integration
- Basic admin interface for monitoring

#### Week 5-6: Enhancement
- Advanced data points (training, recovery)
- Automated job scheduling
- Error handling and monitoring
- Performance optimization

#### Week 7-8: Integration & Polish
- Frontend API integration
- Real-time data updates
- Testing and debugging
- Documentation

### 7. Technical Considerations

#### Web Scraping
- **Rate Limiting**: Respect website robots.txt and implement delays
- **Proxy Rotation**: Use proxy services to avoid IP blocking
- **Error Handling**: Robust error handling for failed scrapes
- **Data Validation**: Validate scraped data before storing

#### Image Management
- **CDN**: Use AWS S3 + CloudFront for image delivery
- **Optimization**: Automatic image resizing and compression
- **Fallbacks**: Default images for missing fighter photos

#### Performance
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Proper indexes for fast queries
- **API Rate Limiting**: Protect API from abuse

#### Monitoring
- **Logging**: Comprehensive logging for debugging
- **Health Checks**: API health monitoring
- **Alerting**: Notifications for failed scraping jobs

### 8. Data Sources Research

#### Primary Sources (To Investigate)
1. **UFC.com** - Official event listings and fighter profiles
2. **ESPN MMA** - Event schedules and fighter stats
3. **Sherdog.com** - Comprehensive fight database
4. **MMAJunkie** - News and event coverage
5. **Tapology** - Fighter rankings and event data

#### Fighter Images
1. **UFC.com** official fighter photos
2. **Getty Images** (if accessible)
3. **Fighter social media** (Instagram, Twitter)
4. **MMA media sites** action shots

#### Training/Recovery Data
1. **Fighter social media** for training updates
2. **MMA news sites** for injury reports
3. **Gym social media** for training footage
4. **UFC embedded videos** for fight week content

### 9. Budget Considerations

#### Infrastructure Costs (Monthly)
- **Database**: PostgreSQL on AWS RDS (~$50-100)
- **File Storage**: AWS S3 for images (~$20-50)
- **CDN**: CloudFront for image delivery (~$10-30)
- **Server**: AWS EC2 or similar (~$50-100)
- **Proxy Services**: For scraping (~$50-100)

**Total estimated: $180-380/month**

### 10. Legal Considerations

- **Robots.txt Compliance**: Respect website scraping policies
- **Fair Use**: Ensure data usage falls under fair use
- **Image Rights**: Be cautious with copyrighted fighter images
- **Rate Limiting**: Don't overload source websites

### Next Steps

1. **Research Data Sources**: Identify the most reliable sources for each data type
2. **Set up Development Environment**: Database, server, and basic scraping tools
3. **Build MVP Scraper**: Start with basic UFC event data collection
4. **Create Database Schema**: Implement the proposed database structure
5. **Develop API Endpoints**: Basic CRUD operations for events and fighters

Would you like me to start implementing any specific part of this plan, or would you prefer to discuss and refine certain aspects first?
