# UFC Fight Predictor

A modern UFC fight prediction application that provides real-time data and analytics for upcoming UFC events with detailed fighter analysis.

## Current Status

**Frontend Complete**: Beautiful, responsive React application with mock data
**Backend**: In development - will provide real-time data collection and fighter analytics

## Features

### Current (Frontend)
- **Modern UI**: Beautiful, responsive React frontend with event cards and fight predictions
- **Event Browsing**: View upcoming UFC events with detailed fight cards
- **Fighter Profiles**: Browse fighter information and statistics
- **Real-time Analytics**: Interface ready for live data integration

### Planned (Backend)
- **Live Data Collection**: Automated scraping of upcoming UFC events and fighter data
- **Comprehensive Fighter Database**: Detailed fighter profiles with fight history, training, recovery data
- **Image Management**: Automated fighter photo collection and serving
- **Prediction Engine**: ML-powered fight outcome predictions
- **Data Persistence**: Database storage for all collected information

## Tech Stack

### Frontend ✅
- React 18
- Styled Components  
- React Router
- Framer Motion
- Lucide React for icons

### Backend (Planned) 🚧
- Node.js with Express
- PostgreSQL/MongoDB database
- Python data collection scripts
- Image processing and CDN
- Machine Learning integration

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ufc-betting-pred
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database with sample data**
   ```bash
   npm run scrape-data
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

## Usage

### Making Predictions

1. Navigate to the **Predict** page
2. Select two fighters from the dropdown menus
3. Choose optional parameters:
   - Weight class
   - Number of rounds (3 or 5)
4. Click "Generate Prediction" to get AI-powered analysis

### Viewing Fighters

- Browse the **Fighters** page to see all available fighters
- Search by name, nickname, or weight class
- View detailed statistics including:
  - Win/loss record
  - Win rate
  - Finish rates (KO/TKO, submissions)
  - Physical attributes (height, reach, stance)

### Prediction History

- View all past predictions on the **History** page
- See prediction confidence levels
- Track model performance over time

## API Endpoints

### Fighters
- `GET /api/fighters` - Get all fighters
- `GET /api/fighters/search?q={query}` - Search fighters
- `GET /api/fighters/:id` - Get specific fighter
- `GET /api/fighters/:id/fights` - Get fighter's fight history

### Predictions
- `POST /api/predict` - Generate fight prediction
- `GET /api/predictions` - Get prediction history

### Utilities
- `GET /api/weight-classes` - Get available weight classes
- `GET /api/health` - Health check

## Machine Learning Model

The prediction model uses a Random Forest classifier trained on:

- **Fighter Statistics**:
  - Win/loss records
  - Win rates
  - Finish rates (KO, submission, decision)
  - Fighting experience

- **Physical Attributes**:
  - Height and reach advantages
  - Stance matchups (orthodox vs southpaw)

- **Historical Performance**:
  - Recent fight outcomes
  - Performance against similar opponents

### Model Features

1. **Win Rate Analysis**: Compares historical win percentages
2. **Finish Rate Comparison**: Analyzes knockout and submission rates  
3. **Physical Advantages**: Factors in height and reach differences
4. **Experience Gap**: Considers total fights and career length
5. **Style Matchups**: Evaluates stance and fighting style compatibility

## Development

### Adding New Fighters

Edit the `scripts/scrape-ufc-data.js` file to add new fighters to the sample data, then run:

```bash
npm run scrape-data
```

### Training the Model

The machine learning model automatically trains when making predictions. To manually retrain:

```bash
npm run train-model
```

### Database Schema

The application uses SQLite with three main tables:

- **fighters**: Fighter profiles and statistics
- **fights**: Historical fight data
- **predictions**: Generated predictions with metadata

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Create a `.env` file:

```
NODE_ENV=production
PORT=5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- [ ] Real-time data integration with UFC APIs
- [ ] More advanced ML models (neural networks, ensemble methods)
- [ ] Betting odds integration
- [ ] Mobile app development
- [ ] Live fight tracking and results verification
- [ ] Social features (user predictions, leaderboards)

## License

MIT License - see LICENSE file for details

## Disclaimer

This application is for educational and entertainment purposes only. Predictions are based on historical data and should not be used for actual betting or gambling decisions.
