# Implementation Roadmap - UFC Fight Predictor Backend

## Immediate Action Plan (Next 2 Weeks)

### Phase 1: Research & Foundation (Days 1-3)

#### Data Source Investigation
**Priority Tasks:**
1. **UFC.com Analysis**
   - Inspect UFC events page structure
   - Test scraping main event data
   - Identify anti-bot measures

2. **Fighter Profile Sources**
   - UFC.com fighter pages
   - ESPN fighter profiles
   - Sherdog for historical data

3. **Image Sources Research**
   - UFC.com official photos
   - Fighter Instagram/Twitter accounts
   - MMA media outlets

#### Tools Selection
- **Web Scraping**: Puppeteer or Playwright for JavaScript rendering
- **Database**: PostgreSQL for structured data
- **Image Processing**: Sharp.js for optimization
- **Job Scheduling**: node-cron for automated updates

### Phase 2: MVP Development (Days 4-10)

#### Backend Setup
```bash
backend/
├── package.json
├── server.js
├── config/
│   ├── database.js
│   └── scraping.js
├── models/
│   ├── Event.js
│   ├── Fighter.js
│   └── Fight.js
├── scrapers/
│   ├── ufc-events.js
│   ├── fighter-profiles.js
│   └── fighter-images.js
├── routes/
│   ├── events.js
│   ├── fighters.js
│   └── images.js
└── jobs/
    ├── daily-sync.js
    └── image-sync.js
```

#### Core Features Implementation
1. **Event Scraping**
   - Upcoming UFC events (main events only)
   - Basic event details (name, date, location, main card)

2. **Fighter Data Collection**
   - Fighter profiles for upcoming main events
   - Basic stats (record, physical attributes)
   - Profile images

3. **API Development**
   - REST endpoints for frontend consumption
   - Real-time data serving

### Phase 3: Integration (Days 11-14)

#### Frontend Integration
1. **API Connection**
   - Replace mock data with real API calls
   - Error handling for API failures
   - Loading states

2. **Image Serving**
   - CDN setup for fighter images
   - Image optimization and caching
   - Fallback images

3. **Real-time Updates**
   - Scheduled data refresh
   - Live event status updates

## Technical Implementation Details

### 1. Database Schema (PostgreSQL)

```sql
-- Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    ufc_event_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    venue VARCHAR(200),
    status VARCHAR(20) DEFAULT 'upcoming',
    poster_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fighters table
CREATE TABLE fighters (
    id SERIAL PRIMARY KEY,
    ufc_fighter_id VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    nationality VARCHAR(50),
    age INTEGER,
    height VARCHAR(10),
    reach VARCHAR(20),
    stance VARCHAR(20),
    weight_class VARCHAR(50),
    ranking_position INTEGER,
    is_champion BOOLEAN DEFAULT FALSE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    profile_image_url VARCHAR(500),
    sherdog_url VARCHAR(500),
    instagram_handle VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fights table
CREATE TABLE fights (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    fighter1_id INTEGER REFERENCES fighters(id),
    fighter2_id INTEGER REFERENCES fighters(id),
    weight_class VARCHAR(50),
    card_position VARCHAR(20), -- 'main', 'co-main', 'main-card'
    scheduled_rounds INTEGER DEFAULT 3,
    odds_fighter1 VARCHAR(10),
    odds_fighter2 VARCHAR(10),
    fight_status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fighter images table
CREATE TABLE fighter_images (
    id SERIAL PRIMARY KEY,
    fighter_id INTEGER REFERENCES fighters(id),
    image_type VARCHAR(20), -- 'profile', 'action', 'training'
    original_url VARCHAR(500),
    local_path VARCHAR(500),
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Scraping Strategy

#### UFC Events Scraper
```javascript
// scrapers/ufc-events.js
const puppeteer = require('puppeteer');

class UFCEventsScraper {
    async scrapeUpcomingEvents() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        try {
            await page.goto('https://www.ufc.com/events');
            
            // Focus on main events only
            const events = await page.evaluate(() => {
                const eventCards = document.querySelectorAll('.c-card-event--result');
                return Array.from(eventCards).slice(0, 5).map(card => {
                    // Extract event data
                    const name = card.querySelector('.c-card-event--result__headline')?.textContent?.trim();
                    const date = card.querySelector('.c-card-event--result__date')?.textContent?.trim();
                    const location = card.querySelector('.c-card-event--result__location')?.textContent?.trim();
                    
                    return { name, date, location };
                });
            });
            
            return events;
        } finally {
            await browser.close();
        }
    }
}
```

#### Fighter Profile Scraper
```javascript
// scrapers/fighter-profiles.js
class FighterProfileScraper {
    async scrapeFighterProfile(fighterName) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        try {
            // Search for fighter
            const searchUrl = `https://www.ufc.com/athletes/all?search=${encodeURIComponent(fighterName)}`;
            await page.goto(searchUrl);
            
            // Get fighter profile data
            const fighterData = await page.evaluate(() => {
                // Extract comprehensive fighter data
                const name = document.querySelector('.hero-profile__name')?.textContent?.trim();
                const nickname = document.querySelector('.hero-profile__nickname')?.textContent?.trim();
                const record = document.querySelector('.hero-profile__division-body')?.textContent?.trim();
                
                // Physical stats
                const height = document.querySelector('[data-stat="height"]')?.textContent?.trim();
                const reach = document.querySelector('[data-stat="reach"]')?.textContent?.trim();
                const stance = document.querySelector('[data-stat="stance"]')?.textContent?.trim();
                
                // Profile image
                const profileImage = document.querySelector('.hero-profile__image img')?.src;
                
                return {
                    name,
                    nickname,
                    record,
                    height,
                    reach,
                    stance,
                    profileImage
                };
            });
            
            return fighterData;
        } finally {
            await browser.close();
        }
    }
}
```

### 3. API Routes

```javascript
// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Get all upcoming events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            where: { status: 'upcoming' },
            order: [['date', 'ASC']],
            include: ['fights', 'fighters']
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific event with fight card
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                {
                    model: 'Fight',
                    include: ['fighter1', 'fighter2']
                }
            ]
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### 4. Scheduled Jobs

```javascript
// jobs/daily-sync.js
const cron = require('node-cron');
const UFCEventsScraper = require('../scrapers/ufc-events');
const FighterProfileScraper = require('../scrapers/fighter-profiles');

// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
    console.log('Starting daily data sync...');
    
    try {
        // 1. Scrape upcoming events
        const eventsScraper = new UFCEventsScraper();
        const events = await eventsScraper.scrapeUpcomingEvents();
        
        // 2. For each event, get fighter data
        const fighterScraper = new FighterProfileScraper();
        
        for (const event of events) {
            // Extract fighter names from main event
            const fighters = await extractFightersFromEvent(event);
            
            for (const fighterName of fighters) {
                const fighterData = await fighterScraper.scrapeFighterProfile(fighterName);
                await saveFighterData(fighterData);
                
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log('Daily sync completed successfully');
    } catch (error) {
        console.error('Daily sync failed:', error);
    }
});
```

### 5. Image Management

```javascript
// services/image-service.js
const sharp = require('sharp');
const AWS = require('aws-sdk');

class ImageService {
    async downloadAndOptimizeFighterImage(imageUrl, fighterId) {
        try {
            // Download image
            const response = await fetch(imageUrl);
            const buffer = await response.buffer();
            
            // Optimize image
            const optimizedBuffer = await sharp(buffer)
                .resize(400, 400, { fit: 'cover' })
                .jpeg({ quality: 85 })
                .toBuffer();
            
            // Upload to S3
            const s3Key = `fighters/${fighterId}/profile.jpg`;
            const s3Url = await this.uploadToS3(optimizedBuffer, s3Key);
            
            return s3Url;
        } catch (error) {
            console.error('Image processing failed:', error);
            return null;
        }
    }
    
    async uploadToS3(buffer, key) {
        const s3 = new AWS.S3();
        
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        
        const result = await s3.upload(params).promise();
        return result.Location;
    }
}
```

## Deployment Strategy

### Development Environment
```bash
# Local development
npm install
npm run dev

# Database setup
npm run db:migrate
npm run db:seed
```

### Production Deployment
1. **Database**: AWS RDS PostgreSQL
2. **Server**: AWS EC2 or Heroku
3. **Images**: AWS S3 + CloudFront CDN
4. **Monitoring**: AWS CloudWatch
5. **Scheduling**: AWS EventBridge for cron jobs

## Cost Estimation

### Infrastructure (Monthly)
- **Database**: AWS RDS PostgreSQL (~$50)
- **Server**: AWS EC2 t3.small (~$20)
- **Storage**: AWS S3 (~$10)
- **CDN**: CloudFront (~$5)
- **Monitoring**: CloudWatch (~$10)

**Total: ~$95/month**

## Risk Mitigation

### Technical Risks
1. **Website Changes**: Scrapers may break if source sites change structure
   - Solution: Build flexible scrapers with fallback options
   
2. **Rate Limiting**: Getting blocked by source websites
   - Solution: Implement proper delays and use proxy rotation

3. **Data Quality**: Inconsistent or missing data
   - Solution: Multiple data sources and validation rules

### Legal Risks
1. **Terms of Service**: Violating website ToS
   - Solution: Review and comply with robots.txt and ToS

2. **Image Rights**: Using copyrighted fighter images
   - Solution: Use only official UFC images or get proper permissions

## Success Metrics

### Technical Metrics
- **Data Accuracy**: >95% accuracy for fighter records
- **Uptime**: >99% API uptime
- **Response Time**: <200ms average API response
- **Image Quality**: All fighters have profile images

### Business Metrics
- **Coverage**: 100% of UFC main events covered
- **Freshness**: Data updated within 24 hours
- **User Engagement**: Increased time on site with real data

## Next Immediate Steps

1. **Today**: Set up development environment and database
2. **Tomorrow**: Build basic UFC events scraper
3. **Day 3**: Test fighter profile scraping
4. **Day 4**: Implement image download and optimization
5. **Day 5**: Create API endpoints and test with frontend
