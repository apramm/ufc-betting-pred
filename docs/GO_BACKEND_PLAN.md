# UFC Fight Predictor - Go Backend Implementation

## Why Go for This Backend?

### Perfect Match for Requirements:
- **Web Scraping**: Excellent HTTP client and HTML parsing libraries
- **Concurrency**: Goroutines perfect for parallel data collection
- **Performance**: Fast API responses and efficient data processing
- **Database**: Great ORM and database handling
- **Deployment**: Single binary deployment, easy containerization

## Go Backend Architecture

### Project Structure
```
backend/
├── main.go
├── go.mod
├── go.sum
├── cmd/
│   ├── server/
│   │   └── main.go
│   └── scraper/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── events.go
│   │   │   ├── fighters.go
│   │   │   └── images.go
│   │   ├── middleware/
│   │   │   ├── cors.go
│   │   │   └── logging.go
│   │   └── routes.go
│   ├── models/
│   │   ├── event.go
│   │   ├── fighter.go
│   │   └── fight.go
│   ├── database/
│   │   ├── connection.go
│   │   └── migrations/
│   ├── scrapers/
│   │   ├── ufc_events.go
│   │   ├── fighter_profiles.go
│   │   └── images.go
│   ├── services/
│   │   ├── event_service.go
│   │   ├── fighter_service.go
│   │   └── image_service.go
│   └── utils/
│       ├── http_client.go
│       └── image_processor.go
├── pkg/
│   └── config/
│       └── config.go
├── scripts/
│   └── migrate.go
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/
    └── api.md
```

## Implementation Details

### 1. Dependencies (go.mod)

```go
module ufc-backend

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1              // Web framework
    github.com/colly/colly/v2 v2.1.0            // Web scraping
    gorm.io/gorm v1.25.5                        // ORM
    gorm.io/driver/postgres v1.5.4              // PostgreSQL driver
    github.com/robfig/cron/v3 v3.0.1            // Cron jobs
    github.com/disintegration/imaging v1.6.2    // Image processing
    github.com/aws/aws-sdk-go v1.45.19          // AWS S3
    github.com/joho/godotenv v1.4.0             // Environment variables
    github.com/sirupsen/logrus v1.9.3           // Logging
    github.com/golang-migrate/migrate/v4 v4.16.2 // Database migrations
)
```

### 2. Models

```go
// internal/models/event.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type Event struct {
    ID           uint      `json:"id" gorm:"primaryKey"`
    UFCEventID   string    `json:"ufc_event_id" gorm:"uniqueIndex;not null"`
    Name         string    `json:"name" gorm:"not null"`
    Date         time.Time `json:"date" gorm:"not null"`
    Location     string    `json:"location"`
    Venue        string    `json:"venue"`
    Status       string    `json:"status" gorm:"default:upcoming"`
    PosterURL    string    `json:"poster_url"`
    Fights       []Fight   `json:"fights" gorm:"foreignKey:EventID"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

// internal/models/fighter.go
type Fighter struct {
    ID              uint      `json:"id" gorm:"primaryKey"`
    UFCFighterID    string    `json:"ufc_fighter_id" gorm:"uniqueIndex"`
    Name            string    `json:"name" gorm:"not null"`
    Nickname        string    `json:"nickname"`
    Nationality     string    `json:"nationality"`
    Age             int       `json:"age"`
    Height          string    `json:"height"`
    Reach           string    `json:"reach"`
    Stance          string    `json:"stance"`
    WeightClass     string    `json:"weight_class"`
    RankingPosition int       `json:"ranking_position"`
    IsChampion      bool      `json:"is_champion" gorm:"default:false"`
    Wins            int       `json:"wins" gorm:"default:0"`
    Losses          int       `json:"losses" gorm:"default:0"`
    Draws           int       `json:"draws" gorm:"default:0"`
    ProfileImageURL string    `json:"profile_image_url"`
    SherdogURL      string    `json:"sherdog_url"`
    InstagramHandle string    `json:"instagram_handle"`
    Images          []FighterImage `json:"images" gorm:"foreignKey:FighterID"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
}

// internal/models/fight.go
type Fight struct {
    ID             uint    `json:"id" gorm:"primaryKey"`
    EventID        uint    `json:"event_id"`
    Event          Event   `json:"event" gorm:"foreignKey:EventID"`
    Fighter1ID     uint    `json:"fighter1_id"`
    Fighter1       Fighter `json:"fighter1" gorm:"foreignKey:Fighter1ID"`
    Fighter2ID     uint    `json:"fighter2_id"`
    Fighter2       Fighter `json:"fighter2" gorm:"foreignKey:Fighter2ID"`
    WeightClass    string  `json:"weight_class"`
    CardPosition   string  `json:"card_position"` // main, co-main, main-card
    ScheduledRounds int    `json:"scheduled_rounds" gorm:"default:3"`
    OddsFighter1   string  `json:"odds_fighter1"`
    OddsFighter2   string  `json:"odds_fighter2"`
    FightStatus    string  `json:"fight_status" gorm:"default:scheduled"`
    CreatedAt      time.Time `json:"created_at"`
}

type FighterImage struct {
    ID         uint   `json:"id" gorm:"primaryKey"`
    FighterID  uint   `json:"fighter_id"`
    ImageType  string `json:"image_type"` // profile, action, training
    OriginalURL string `json:"original_url"`
    LocalPath  string `json:"local_path"`
    Width      int    `json:"width"`
    Height     int    `json:"height"`
    FileSize   int64  `json:"file_size"`
    CreatedAt  time.Time `json:"created_at"`
}
```

### 3. Web Scraping

```go
// internal/scrapers/ufc_events.go
package scrapers

import (
    "fmt"
    "strings"
    "time"
    
    "github.com/colly/colly/v2"
    "github.com/sirupsen/logrus"
)

type UFCEventsScraper struct {
    collector *colly.Collector
}

type EventData struct {
    Name     string
    Date     string
    Location string
    Venue    string
    Fighters []string
}

func NewUFCEventsScraper() *UFCEventsScraper {
    c := colly.NewCollector(
        colly.Async(true),
        colly.UserAgent("Mozilla/5.0 (compatible; UFC-Bot/1.0)"),
    )
    
    // Rate limiting
    c.Limit(&colly.LimitRule{
        DomainGlob:  "*ufc.com*",
        Parallelism: 2,
        Delay:       2 * time.Second,
    })
    
    return &UFCEventsScraper{collector: c}
}

func (s *UFCEventsScraper) ScrapeUpcomingEvents() ([]EventData, error) {
    var events []EventData
    
    s.collector.OnHTML(".c-card-event--result", func(e *colly.HTMLElement) {
        // Only process upcoming events (main events focus)
        status := e.ChildText(".c-card-event--result__status")
        if !strings.Contains(strings.ToLower(status), "upcoming") {
            return
        }
        
        event := EventData{
            Name:     strings.TrimSpace(e.ChildText(".c-card-event--result__headline")),
            Date:     strings.TrimSpace(e.ChildText(".c-card-event--result__date")),
            Location: strings.TrimSpace(e.ChildText(".c-card-event--result__location")),
        }
        
        // Extract main event fighters
        mainEvent := e.ChildText(".c-card-event--result__main-card")
        if mainEvent != "" {
            fighters := s.extractFighterNames(mainEvent)
            event.Fighters = fighters
        }
        
        if event.Name != "" {
            events = append(events, event)
        }
    })
    
    s.collector.OnError(func(r *colly.Response, err error) {
        logrus.Errorf("Error scraping UFC events: %v", err)
    })
    
    err := s.collector.Visit("https://www.ufc.com/events")
    if err != nil {
        return nil, fmt.Errorf("failed to visit UFC events page: %w", err)
    }
    
    s.collector.Wait()
    return events, nil
}

func (s *UFCEventsScraper) extractFighterNames(mainEventText string) []string {
    // Parse "Fighter1 vs Fighter2" format
    parts := strings.Split(mainEventText, " vs ")
    if len(parts) == 2 {
        return []string{
            strings.TrimSpace(parts[0]),
            strings.TrimSpace(parts[1]),
        }
    }
    return []string{}
}
```

```go
// internal/scrapers/fighter_profiles.go
package scrapers

import (
    "fmt"
    "strings"
    "time"
    
    "github.com/colly/colly/v2"
)

type FighterProfileScraper struct {
    collector *colly.Collector
}

type FighterData struct {
    Name            string
    Nickname        string
    Nationality     string
    Age             int
    Height          string
    Reach           string
    Stance          string
    WeightClass     string
    Record          string
    Wins            int
    Losses          int
    Draws           int
    ProfileImageURL string
    RankingPosition int
    IsChampion      bool
}

func NewFighterProfileScraper() *FighterProfileScraper {
    c := colly.NewCollector(
        colly.UserAgent("Mozilla/5.0 (compatible; UFC-Bot/1.0)"),
    )
    
    c.Limit(&colly.LimitRule{
        DomainGlob:  "*ufc.com*",
        Parallelism: 1,
        Delay:       3 * time.Second,
    })
    
    return &FighterProfileScraper{collector: c}
}

func (s *FighterProfileScraper) ScrapeFighterProfile(fighterName string) (*FighterData, error) {
    var fighter FighterData
    found := false
    
    s.collector.OnHTML(".c-bio", func(e *colly.HTMLElement) {
        found = true
        
        fighter.Name = strings.TrimSpace(e.ChildText(".hero-profile__name"))
        fighter.Nickname = strings.TrimSpace(e.ChildText(".hero-profile__nickname"))
        
        // Parse stats
        e.ForEach(".c-bio__field", func(i int, field *colly.HTMLElement) {
            label := strings.ToLower(field.ChildText(".c-bio__label"))
            value := strings.TrimSpace(field.ChildText(".c-bio__text"))
            
            switch label {
            case "height":
                fighter.Height = value
            case "reach":
                fighter.Reach = value
            case "stance":
                fighter.Stance = value
            case "place of birth":
                fighter.Nationality = value
            }
        })
        
        // Get profile image
        fighter.ProfileImageURL = e.ChildAttr(".hero-profile__image img", "src")
        
        // Parse record
        record := e.ChildText(".hero-profile__division-body")
        fighter.Record = record
        // Parse wins-losses-draws from record string
        s.parseRecord(record, &fighter)
    })
    
    searchURL := fmt.Sprintf("https://www.ufc.com/athlete/%s", 
        strings.ReplaceAll(strings.ToLower(fighterName), " ", "-"))
    
    err := s.collector.Visit(searchURL)
    if err != nil {
        return nil, fmt.Errorf("failed to visit fighter profile: %w", err)
    }
    
    if !found {
        return nil, fmt.Errorf("fighter profile not found: %s", fighterName)
    }
    
    return &fighter, nil
}

func (s *FighterProfileScraper) parseRecord(record string, fighter *FighterData) {
    // Parse "20-3-0" format
    parts := strings.Split(record, "-")
    if len(parts) >= 3 {
        if wins, err := strconv.Atoi(parts[0]); err == nil {
            fighter.Wins = wins
        }
        if losses, err := strconv.Atoi(parts[1]); err == nil {
            fighter.Losses = losses
        }
        if draws, err := strconv.Atoi(parts[2]); err == nil {
            fighter.Draws = draws
        }
    }
}
```

### 4. API Handlers

```go
// internal/api/handlers/events.go
package handlers

import (
    "net/http"
    "strconv"
    
    "github.com/gin-gonic/gin"
    "ufc-backend/internal/services"
)

type EventHandler struct {
    eventService *services.EventService
}

func NewEventHandler(eventService *services.EventService) *EventHandler {
    return &EventHandler{
        eventService: eventService,
    }
}

func (h *EventHandler) GetEvents(c *gin.Context) {
    events, err := h.eventService.GetUpcomingEvents()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch events",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "events": events,
        "count":  len(events),
    })
}

func (h *EventHandler) GetEvent(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseUint(idStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid event ID",
        })
        return
    }
    
    event, err := h.eventService.GetEventByID(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Event not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, event)
}

func (h *EventHandler) GetEventFights(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseUint(idStr, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid event ID",
        })
        return
    }
    
    fights, err := h.eventService.GetEventFights(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Event fights not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "fights": fights,
        "count":  len(fights),
    })
}
```

### 5. Services

```go
// internal/services/event_service.go
package services

import (
    "ufc-backend/internal/models"
    "gorm.io/gorm"
)

type EventService struct {
    db *gorm.DB
}

func NewEventService(db *gorm.DB) *EventService {
    return &EventService{db: db}
}

func (s *EventService) GetUpcomingEvents() ([]models.Event, error) {
    var events []models.Event
    
    err := s.db.Where("status = ? AND date > NOW()", "upcoming").
        Preload("Fights").
        Preload("Fights.Fighter1").
        Preload("Fights.Fighter2").
        Order("date ASC").
        Find(&events).Error
    
    return events, err
}

func (s *EventService) GetEventByID(id uint) (*models.Event, error) {
    var event models.Event
    
    err := s.db.Where("id = ?", id).
        Preload("Fights").
        Preload("Fights.Fighter1").
        Preload("Fights.Fighter2").
        First(&event).Error
    
    if err != nil {
        return nil, err
    }
    
    return &event, nil
}

func (s *EventService) GetEventFights(eventID uint) ([]models.Fight, error) {
    var fights []models.Fight
    
    err := s.db.Where("event_id = ?", eventID).
        Preload("Fighter1").
        Preload("Fighter2").
        Order("card_position DESC").
        Find(&fights).Error
    
    return fights, err
}

func (s *EventService) CreateOrUpdateEvent(eventData *models.Event) error {
    return s.db.Save(eventData).Error
}
```

### 6. Main Server

```go
// cmd/server/main.go
package main

import (
    "log"
    "os"
    
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "ufc-backend/internal/api/handlers"
    "ufc-backend/internal/database"
    "ufc-backend/internal/services"
    "ufc-backend/pkg/config"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }
    
    // Load configuration
    cfg := config.Load()
    
    // Initialize database
    db, err := database.Initialize(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    // Initialize services
    eventService := services.NewEventService(db)
    fighterService := services.NewFighterService(db)
    imageService := services.NewImageService(cfg.AWSS3Bucket)
    
    // Initialize handlers
    eventHandler := handlers.NewEventHandler(eventService)
    fighterHandler := handlers.NewFighterHandler(fighterService)
    imageHandler := handlers.NewImageHandler(imageService)
    
    // Setup router
    router := gin.Default()
    
    // CORS middleware
    router.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })
    
    // API routes
    api := router.Group("/api")
    {
        // Events
        api.GET("/events", eventHandler.GetEvents)
        api.GET("/events/:id", eventHandler.GetEvent)
        api.GET("/events/:id/fights", eventHandler.GetEventFights)
        
        // Fighters
        api.GET("/fighters", fighterHandler.GetFighters)
        api.GET("/fighters/:id", fighterHandler.GetFighter)
        api.GET("/fighters/search", fighterHandler.SearchFighters)
        
        // Images
        api.GET("/images/fighter/:id", imageHandler.GetFighterImage)
    }
    
    // Health check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "healthy"})
    })
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Server starting on port %s", port)
    log.Fatal(router.Run(":" + port))
}
```

### 7. Scheduled Jobs

```go
// internal/jobs/scraper_job.go
package jobs

import (
    "log"
    "time"
    
    "github.com/robfig/cron/v3"
    "ufc-backend/internal/scrapers"
    "ufc-backend/internal/services"
)

type ScraperJob struct {
    eventService   *services.EventService
    fighterService *services.FighterService
    imageService   *services.ImageService
}

func NewScraperJob(eventService *services.EventService, fighterService *services.FighterService, imageService *services.ImageService) *ScraperJob {
    return &ScraperJob{
        eventService:   eventService,
        fighterService: fighterService,
        imageService:   imageService,
    }
}

func (j *ScraperJob) Start() {
    c := cron.New()
    
    // Daily at 6 AM
    c.AddFunc("0 6 * * *", j.runDailySync)
    
    // Image sync every 6 hours
    c.AddFunc("0 */6 * * *", j.runImageSync)
    
    c.Start()
    log.Println("Scraper jobs started")
}

func (j *ScraperJob) runDailySync() {
    log.Println("Starting daily sync...")
    
    // Scrape events
    eventScraper := scrapers.NewUFCEventsScraper()
    events, err := eventScraper.ScrapeUpcomingEvents()
    if err != nil {
        log.Printf("Failed to scrape events: %v", err)
        return
    }
    
    // Process each event
    for _, eventData := range events {
        // Save event
        event := j.convertToEventModel(eventData)
        if err := j.eventService.CreateOrUpdateEvent(event); err != nil {
            log.Printf("Failed to save event: %v", err)
            continue
        }
        
        // Scrape fighters
        fighterScraper := scrapers.NewFighterProfileScraper()
        for _, fighterName := range eventData.Fighters {
            go func(name string) {
                fighterData, err := fighterScraper.ScrapeFighterProfile(name)
                if err != nil {
                    log.Printf("Failed to scrape fighter %s: %v", name, err)
                    return
                }
                
                fighter := j.convertToFighterModel(fighterData)
                if err := j.fighterService.CreateOrUpdateFighter(fighter); err != nil {
                    log.Printf("Failed to save fighter: %v", err)
                }
                
                // Download and optimize images
                if fighterData.ProfileImageURL != "" {
                    go j.imageService.ProcessFighterImage(fighter.ID, fighterData.ProfileImageURL)
                }
                
                time.Sleep(2 * time.Second) // Rate limiting
            }(fighterName)
        }
    }
    
    log.Println("Daily sync completed")
}

func (j *ScraperJob) runImageSync() {
    log.Println("Starting image sync...")
    // Implementation for image sync
}
```

## Deployment

### Docker Setup

```dockerfile
# docker/Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/.env .

EXPOSE 8080
CMD ["./main"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ufc_db
      POSTGRES_USER: ufc_user
      POSTGRES_PASSWORD: ufc_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://ufc_user:ufc_password@postgres:5432/ufc_db?sslmode=disable
      - PORT=8080
    depends_on:
      - postgres
    volumes:
      - ../logs:/app/logs

volumes:
  postgres_data:
```

## Getting Started

### 1. Initialize Project
```bash
# Create backend directory
mkdir backend && cd backend

# Initialize Go module
go mod init ufc-backend

# Create basic structure
mkdir -p cmd/server internal/{api/{handlers,middleware},models,database,scrapers,services,utils} pkg/config scripts docker docs
```

### 2. Install Dependencies
```bash
go get github.com/gin-gonic/gin
go get github.com/colly/colly/v2
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/robfig/cron/v3
go get github.com/disintegration/imaging
go get github.com/aws/aws-sdk-go
go get github.com/joho/godotenv
go get github.com/sirupsen/logrus
```

### 3. Environment Setup
```bash
# .env file
DATABASE_URL=postgres://user:password@localhost:5432/ufc_db?sslmode=disable
PORT=8080
AWS_S3_BUCKET=ufc-fighter-images
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 4. Run Development
```bash
# Start database
docker-compose up postgres -d

# Run migrations
go run scripts/migrate.go

# Start server
go run cmd/server/main.go
```

## Advantages of Go for This Project

1. **Performance**: Fast HTTP server and efficient scraping
2. **Concurrency**: Goroutines for parallel data collection
3. **Simple Deployment**: Single binary, easy containerization  
4. **Strong Typing**: Compile-time error catching
5. **Great Libraries**: Excellent ecosystem for web scraping and APIs
6. **Low Resource Usage**: Efficient memory and CPU usage

Want me to start implementing any specific part of this Go backend?
