import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 3rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(220, 38, 38, 0.15);
  }
`;

const StatIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const StatDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const PredictionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), transparent);
  }
`;

const PredictionCard = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
  }
`;

const PredictionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FightInfo = styled.div`
  flex: 1;
`;

const FightTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
`;

const FightDetails = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const PredictionStatus = styled.div`
  background: ${props => {
    switch(props.status) {
      case 'correct': return 'var(--success-color)';
      case 'incorrect': return 'var(--error-color)';
      case 'pending': return 'var(--warning-color)';
      default: return 'var(--text-secondary)';
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PredictionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const PredictionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PredictionWinner = styled.div`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const PredictionMethod = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const PredictionConfidence = styled.div`
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: 600;
`;

const ConfidenceBar = styled.div`
  width: 100px;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--primary-color));
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled(motion.button)`
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'var(--primary-hover)' : 'var(--card-bg)'};
    border-color: var(--primary-color);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const EmptyTitle = styled.h3`
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const EmptyDescription = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ActionButton = styled(motion.button)`
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
    transform: translateY(-2px);
  }
`;

const PredictionPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    pending: 0,
    accuracy: 0
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      
      // Mock predictions data
      const mockPredictions = [
        {
          id: 1,
          fight: {
            fighter1: 'Conor McGregor',
            fighter2: 'Dustin Poirier',
            event: 'UFC 264',
            date: '2024-01-20',
            weightClass: 'Lightweight'
          },
          prediction: {
            winner: 'Dustin Poirier',
            method: 'TKO',
            confidence: 78
          },
          status: 'correct',
          result: {
            winner: 'Dustin Poirier',
            method: 'TKO',
            round: 1
          }
        },
        {
          id: 2,
          fight: {
            fighter1: 'Israel Adesanya',
            fighter2: 'Paulo Costa',
            event: 'UFC 253',
            date: '2024-01-15',
            weightClass: 'Middleweight'
          },
          prediction: {
            winner: 'Israel Adesanya',
            method: 'KO',
            confidence: 85
          },
          status: 'correct',
          result: {
            winner: 'Israel Adesanya',
            method: 'TKO',
            round: 2
          }
        },
        {
          id: 3,
          fight: {
            fighter1: 'Jon Jones',
            fighter2: 'Stipe Miocic',
            event: 'UFC 295',
            date: '2024-02-01',
            weightClass: 'Heavyweight'
          },
          prediction: {
            winner: 'Jon Jones',
            method: 'Decision',
            confidence: 72
          },
          status: 'pending',
          result: null
        }
      ];

      setPredictions(mockPredictions);
      
      // Calculate stats
      const total = mockPredictions.length;
      const correct = mockPredictions.filter(p => p.status === 'correct').length;
      const incorrect = mockPredictions.filter(p => p.status === 'incorrect').length;
      const pending = mockPredictions.filter(p => p.status === 'pending').length;
      const accuracy = total > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

      setStats({
        total,
        correct,
        incorrect,
        pending,
        accuracy: isNaN(accuracy) ? 0 : accuracy
      });

    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    if (filter === 'all') return true;
    return prediction.status === filter;
  });

  const filterOptions = [
    { key: 'all', label: 'All Predictions', count: stats.total },
    { key: 'correct', label: 'Correct', count: stats.correct },
    { key: 'incorrect', label: 'Incorrect', count: stats.incorrect },
    { key: 'pending', label: 'Pending', count: stats.pending }
  ];

  if (loading) {
    return (
      <Container>
        <LoadingSpinner size="60px" text="Loading predictions..." />
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>🔮 Prediction Results</PageTitle>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatIcon>🎯</StatIcon>
          <StatValue>{stats.accuracy}%</StatValue>
          <StatLabel>Accuracy Rate</StatLabel>
          <StatDescription>
            {stats.correct} correct out of {stats.correct + stats.incorrect} completed
          </StatDescription>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatIcon>📊</StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Predictions</StatLabel>
          <StatDescription>
            All predictions made across UFC events
          </StatDescription>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatIcon>✅</StatIcon>
          <StatValue>{stats.correct}</StatValue>
          <StatLabel>Correct Predictions</StatLabel>
          <StatDescription>
            Predictions that matched the actual outcome
          </StatDescription>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatIcon>⏳</StatIcon>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending Results</StatLabel>
          <StatDescription>
            Predictions awaiting fight outcomes
          </StatDescription>
        </StatCard>
      </StatsGrid>

      <SectionTitle>📋 Prediction History</SectionTitle>

      <FilterContainer>
        {filterOptions.map(option => (
          <FilterButton
            key={option.key}
            active={filter === option.key}
            onClick={() => setFilter(option.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option.label} ({option.count})
          </FilterButton>
        ))}
      </FilterContainer>

      <PredictionsContainer>
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PredictionHeader>
                <FightInfo>
                  <FightTitle>
                    {prediction.fight.fighter1} vs {prediction.fight.fighter2}
                  </FightTitle>
                  <FightDetails>
                    {prediction.fight.event} • {prediction.fight.weightClass} • {
                      new Date(prediction.fight.date).toLocaleDateString()
                    }
                  </FightDetails>
                </FightInfo>
                <PredictionStatus status={prediction.status}>
                  {prediction.status}
                </PredictionStatus>
              </PredictionHeader>

              <PredictionContent>
                <PredictionDetails>
                  <PredictionWinner>
                    Predicted Winner: {prediction.prediction.winner}
                  </PredictionWinner>
                  <PredictionMethod>
                    Method: {prediction.prediction.method}
                  </PredictionMethod>
                  <PredictionConfidence>
                    Confidence: {prediction.prediction.confidence}%
                  </PredictionConfidence>
                  {prediction.result && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        <strong>Actual Result:</strong> {prediction.result.winner} by {prediction.result.method} (Round {prediction.result.round})
                      </div>
                    </div>
                  )}
                </PredictionDetails>
                <div>
                  <ConfidenceBar>
                    <ConfidenceFill confidence={prediction.prediction.confidence} />
                  </ConfidenceBar>
                </div>
              </PredictionContent>
            </PredictionCard>
          ))
        ) : (
          <EmptyState>
            <EmptyTitle>No Predictions Found</EmptyTitle>
            <EmptyDescription>
              {filter === 'all' 
                ? "You haven't made any predictions yet. Start by viewing upcoming UFC events and making your first prediction!"
                : `No ${filter} predictions found. Try a different filter or make more predictions.`
              }
            </EmptyDescription>
            <ActionButton
              onClick={() => navigate('/events')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Upcoming Events
            </ActionButton>
          </EmptyState>
        )}
      </PredictionsContainer>
    </Container>
  );
};

export default PredictionPage;
