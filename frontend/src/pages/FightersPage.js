import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FighterCard from '../components/FighterCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled(motion.button)`
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateX(-2px);
  }
`;

const PageTitle = styled.h1`
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 2rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FightersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
  margin-bottom: 3rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const VSContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;

  @media (max-width: 968px) {
    order: -1;
    padding: 1rem;
  }
`;

const VSText = styled.div`
  color: var(--text-primary);
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ComparisonContainer = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
`;

const ComparisonTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  }
`;

// Removed unused ComparisonGrid component

const StatComparison = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
  text-align: ${props => props.align || 'left'};
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  font-weight: 600;
`;

const AdvantageIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.hasAdvantage ? 'var(--success-color)' : 'transparent'};
  margin: ${props => props.align === 'right' ? '0 0 0 0.5rem' : '0 0.5rem 0 0'};
`;

const PredictionSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
  text-align: center;
`;

const PredictionButton = styled(motion.button)`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PredictionResult = styled.div`
  background: rgba(220, 38, 38, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid var(--primary-color);
`;

const PredictionWinner = styled.div`
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PredictionMethod = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const PredictionConfidence = styled.div`
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const PredictionReasoning = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: left;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SearchButton = styled(motion.button)`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FightersPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const [fighter1Name, setFighter1Name] = useState('');
  const [fighter2Name, setFighter2Name] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    // Check if fighters were passed from navigation state
    if (location.state?.fighter1 && location.state?.fighter2) {
      setFighter1(location.state.fighter1);
      setFighter2(location.state.fighter2);
      setFighter1Name(location.state.fighter1.name);
      setFighter2Name(location.state.fighter2.name);
    }
  }, [location.state]);

  const searchFighters = async () => {
    if (!fighter1Name.trim() || !fighter2Name.trim()) {
      alert('Please enter both fighter names');
      return;
    }

    try {
      setSearchLoading(true);
      
      // Search for fighters (mock data for now)
      const mockFighter1 = {
        id: 1,
        name: fighter1Name,
        record: '20-3-0',
        weightClass: 'Lightweight',
        ranking: 1,
        age: 28,
        height: '5\'10"',
        reach: '72"',
        stance: 'Orthodox',
        image: null,
        stats: {
          strikeAccuracy: 85,
          takedownAccuracy: 45,
          submissionAttempts: 12,
          knockdowns: 8
        }
      };

      const mockFighter2 = {
        id: 2,
        name: fighter2Name,
        record: '18-5-0',
        weightClass: 'Lightweight',
        ranking: 3,
        age: 30,
        height: '5\'11"',
        reach: '74"',
        stance: 'Southpaw',
        image: null,
        stats: {
          strikeAccuracy: 78,
          takedownAccuracy: 52,
          submissionAttempts: 6,
          knockdowns: 15
        }
      };

      setFighter1(mockFighter1);
      setFighter2(mockFighter2);
      setPrediction(null);

    } catch (error) {
      console.error('Error searching fighters:', error);
      alert('Failed to search fighters. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const getPrediction = async () => {
    if (!fighter1 || !fighter2) return;

    try {
      setLoadingPrediction(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock prediction data
      const mockPrediction = {
        winner: Math.random() > 0.5 ? fighter1.name : fighter2.name,
        method: ['Decision', 'TKO', 'Submission', 'KO'][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 30) + 65, // Random confidence between 65-95%
        reasoning: `Based on comprehensive analysis of fighting styles, recent performance, and statistical advantages, this prediction considers striking accuracy, takedown defense, cardio, and experience factors. Both fighters have shown excellent skills in their recent fights.`
      };

      setPrediction(mockPrediction);

    } catch (error) {
      console.error('Error getting prediction:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const compareStats = (stat1, stat2) => {
    const val1 = parseFloat(stat1) || 0;
    const val2 = parseFloat(stat2) || 0;
    return val1 > val2 ? 1 : val1 < val2 ? -1 : 0;
  };

  return (
    <Container>
      <BackButton
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </BackButton>

      <PageTitle>Fighter Comparison</PageTitle>

      <SearchContainer>
        <SearchInput
          placeholder="Enter first fighter name..."
          value={fighter1Name}
          onChange={(e) => setFighter1Name(e.target.value)}
        />
        <SearchInput
          placeholder="Enter second fighter name..."
          value={fighter2Name}
          onChange={(e) => setFighter2Name(e.target.value)}
        />
        <SearchButton
          onClick={searchFighters}
          disabled={searchLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {searchLoading ? <LoadingSpinner size="16px" showText={false} /> : 'Search'}
        </SearchButton>
      </SearchContainer>

      {fighter1 && fighter2 && (
        <>
          <FightersGrid>
            <FighterCard fighter={fighter1} showStats={true} />
            <VSContainer>
              <VSText>VS</VSText>
            </VSContainer>
            <FighterCard fighter={fighter2} showStats={true} />
          </FightersGrid>

          <ComparisonContainer>
            <ComparisonTitle>📊 Statistical Comparison</ComparisonTitle>
            <StatComparison>
              <StatRow>
                <StatValue>
                  <AdvantageIndicator 
                    hasAdvantage={compareStats(fighter1.stats?.strikeAccuracy, fighter2.stats?.strikeAccuracy) > 0} 
                  />
                  {fighter1.stats?.strikeAccuracy || 'N/A'}%
                </StatValue>
                <StatLabel>Strike Accuracy</StatLabel>
                <StatValue align="right">
                  {fighter2.stats?.strikeAccuracy || 'N/A'}%
                  <AdvantageIndicator 
                    align="right"
                    hasAdvantage={compareStats(fighter2.stats?.strikeAccuracy, fighter1.stats?.strikeAccuracy) > 0} 
                  />
                </StatValue>
              </StatRow>

              <StatRow>
                <StatValue>
                  <AdvantageIndicator 
                    hasAdvantage={compareStats(fighter1.stats?.takedownAccuracy, fighter2.stats?.takedownAccuracy) > 0} 
                  />
                  {fighter1.stats?.takedownAccuracy || 'N/A'}%
                </StatValue>
                <StatLabel>Takedown Accuracy</StatLabel>
                <StatValue align="right">
                  {fighter2.stats?.takedownAccuracy || 'N/A'}%
                  <AdvantageIndicator 
                    align="right"
                    hasAdvantage={compareStats(fighter2.stats?.takedownAccuracy, fighter1.stats?.takedownAccuracy) > 0} 
                  />
                </StatValue>
              </StatRow>

              <StatRow>
                <StatValue>
                  <AdvantageIndicator 
                    hasAdvantage={compareStats(fighter1.stats?.knockdowns, fighter2.stats?.knockdowns) > 0} 
                  />
                  {fighter1.stats?.knockdowns || 0}
                </StatValue>
                <StatLabel>Knockdowns</StatLabel>
                <StatValue align="right">
                  {fighter2.stats?.knockdowns || 0}
                  <AdvantageIndicator 
                    align="right"
                    hasAdvantage={compareStats(fighter2.stats?.knockdowns, fighter1.stats?.knockdowns) > 0} 
                  />
                </StatValue>
              </StatRow>

              <StatRow>
                <StatValue>
                  <AdvantageIndicator 
                    hasAdvantage={compareStats(fighter1.stats?.submissionAttempts, fighter2.stats?.submissionAttempts) > 0} 
                  />
                  {fighter1.stats?.submissionAttempts || 0}
                </StatValue>
                <StatLabel>Submission Attempts</StatLabel>
                <StatValue align="right">
                  {fighter2.stats?.submissionAttempts || 0}
                  <AdvantageIndicator 
                    align="right"
                    hasAdvantage={compareStats(fighter2.stats?.submissionAttempts, fighter1.stats?.submissionAttempts) > 0} 
                  />
                </StatValue>
              </StatRow>
            </StatComparison>
          </ComparisonContainer>

          <PredictionSection>
            <PredictionButton
              onClick={getPrediction}
              disabled={loadingPrediction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loadingPrediction ? <LoadingSpinner size="20px" showText={false} /> : 'Get AI Prediction'}
            </PredictionButton>

            {prediction && (
              <PredictionResult>
                <PredictionWinner>
                  🏆 Winner: {prediction.winner}
                </PredictionWinner>
                <PredictionMethod>
                  Method: {prediction.method}
                </PredictionMethod>
                <PredictionConfidence>
                  Confidence: {prediction.confidence}%
                </PredictionConfidence>
                {prediction.reasoning && (
                  <PredictionReasoning>
                    <strong>Analysis:</strong><br />
                    {prediction.reasoning}
                  </PredictionReasoning>
                )}
              </PredictionResult>
            )}
          </PredictionSection>
        </>
      )}

      {!fighter1 && !fighter2 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Compare UFC Fighters
          </h3>
          <p>Enter two fighter names above to see a detailed comparison and AI prediction.</p>
        </div>
      )}
    </Container>
  );
};

export default FightersPage;
