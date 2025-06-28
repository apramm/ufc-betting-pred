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

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const EventCard = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--border-color);
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
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

const EventDetails = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const EventStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  text-align: center;
`;

const StatItem = styled.div`
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 8px;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
`;

const FightsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const FightResult = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid ${props => {
    if (props.predictionStatus === 'correct') return 'var(--success-color)';
    if (props.predictionStatus === 'incorrect') return 'var(--error-color)';
    return 'var(--text-secondary)';
  }};
`;

const FightHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FightMatchup = styled.div`
  flex: 1;
`;

const FighterNames = styled.h3`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
`;

const FightInfo = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const ResultBadge = styled.div`
  background: ${props => {
    if (props.status === 'correct') return 'var(--success-color)';
    if (props.status === 'incorrect') return 'var(--error-color)';
    return 'var(--text-secondary)';
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const ResultDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultSection = styled.div`
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
`;

const SectionTitle = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const SectionContent = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
`;

const WinnerHighlight = styled.span`
  color: var(--success-color);
  font-weight: 600;
`;

const ConfidenceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ConfidenceBar = styled.div`
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.confidence >= 80) return 'var(--success-color)';
    if (props.confidence >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  }};
  width: ${props => props.confidence}%;
  transition: width 0.3s ease;
`;

const ConfidenceValue = styled.div`
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 35px;
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

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Mock results data
      const mockResults = [
        {
          id: 1,
          event: {
            name: 'UFC 300',
            date: '2024-01-20',
            location: 'Las Vegas, Nevada'
          },
          fights: [
            {
              id: 101,
              fighters: ['Alex Pereira', 'Jamahal Hill'],
              weightClass: 'Light Heavyweight',
              cardPosition: 'main',
              result: {
                winner: 'Alex Pereira',
                method: 'KO',
                round: 1,
                time: '3:14'
              },
              prediction: {
                winner: 'Alex Pereira',
                method: 'KO',
                confidence: 85
              },
              predictionStatus: 'correct'
            },
            {
              id: 102,
              fighters: ['Zhang Weili', 'Yan Xiaonan'],
              weightClass: 'Strawweight',
              cardPosition: 'co-main',
              result: {
                winner: 'Zhang Weili',
                method: 'Decision',
                round: 3,
                time: '5:00'
              },
              prediction: {
                winner: 'Yan Xiaonan',
                method: 'Decision',
                confidence: 62
              },
              predictionStatus: 'incorrect'
            }
          ],
          stats: {
            totalFights: 2,
            correctPredictions: 1,
            accuracy: 50
          }
        },
        {
          id: 2,
          event: {
            name: 'UFC 299',
            date: '2024-01-15',
            location: 'Miami, Florida'
          },
          fights: [
            {
              id: 201,
              fighters: ['Sean O\'Malley', 'Marlon Vera'],
              weightClass: 'Bantamweight',
              cardPosition: 'main',
              result: {
                winner: 'Sean O\'Malley',
                method: 'Decision',
                round: 3,
                time: '5:00'
              },
              prediction: {
                winner: 'Sean O\'Malley',
                method: 'Decision',
                confidence: 78
              },
              predictionStatus: 'correct'
            }
          ],
          stats: {
            totalFights: 1,
            correctPredictions: 1,
            accuracy: 100
          }
        }
      ];

      setResults(mockResults);

    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.fights.some(fight => fight.predictionStatus === filter);
  });

  const overallStats = results.reduce((acc, result) => {
    acc.totalFights += result.stats.totalFights;
    acc.correctPredictions += result.stats.correctPredictions;
    return acc;
  }, { totalFights: 0, correctPredictions: 0 });

  const overallAccuracy = overallStats.totalFights > 0 
    ? Math.round((overallStats.correctPredictions / overallStats.totalFights) * 100) 
    : 0;

  const filterOptions = [
    { key: 'all', label: 'All Events' },
    { key: 'correct', label: 'Correct Predictions' },
    { key: 'incorrect', label: 'Incorrect Predictions' }
  ];

  if (loading) {
    return (
      <Container>
        <LoadingSpinner size="60px" text="Loading results..." />
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>🏆 Fight Results</PageTitle>

      <FilterContainer>
        {filterOptions.map(option => (
          <FilterButton
            key={option.key}
            active={filter === option.key}
            onClick={() => setFilter(option.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option.label}
          </FilterButton>
        ))}
        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Overall Accuracy: <strong style={{ color: 'var(--primary-color)' }}>{overallAccuracy}%</strong>
        </div>
      </FilterContainer>

      <EventsContainer>
        {filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <EventCard
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EventHeader>
                <EventInfo>
                  <EventTitle>{result.event.name}</EventTitle>
                  <EventDetails>
                    <span>{new Date(result.event.date).toLocaleDateString()}</span>
                    <span>{result.event.location}</span>
                  </EventDetails>
                </EventInfo>
                <EventStats>
                  <StatItem>
                    <StatValue>{result.stats.totalFights}</StatValue>
                    <StatLabel>Fights</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{result.stats.correctPredictions}</StatValue>
                    <StatLabel>Correct</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{result.stats.accuracy}%</StatValue>
                    <StatLabel>Accuracy</StatLabel>
                  </StatItem>
                </EventStats>
              </EventHeader>

              <FightsContainer>
                {result.fights.map((fight) => (
                  <FightResult key={fight.id} predictionStatus={fight.predictionStatus}>
                    <FightHeader>
                      <FightMatchup>
                        <FighterNames>
                          {fight.fighters[0]} vs {fight.fighters[1]}
                        </FighterNames>
                        <FightInfo>
                          {fight.weightClass} • {fight.cardPosition === 'main' ? 'Main Event' : 
                           fight.cardPosition === 'co-main' ? 'Co-Main Event' : 'Main Card'}
                        </FightInfo>
                      </FightMatchup>
                      <ResultBadge status={fight.predictionStatus}>
                        {fight.predictionStatus}
                      </ResultBadge>
                    </FightHeader>

                    <ResultDetails>
                      <ResultSection>
                        <SectionTitle>🥊 Actual Result</SectionTitle>
                        <SectionContent>
                          <WinnerHighlight>{fight.result.winner}</WinnerHighlight> won by {fight.result.method}
                          <br />
                          Round {fight.result.round} at {fight.result.time}
                        </SectionContent>
                      </ResultSection>

                      <ResultSection>
                        <SectionTitle>🤖 AI Prediction</SectionTitle>
                        <SectionContent>
                          Predicted <strong>{fight.prediction.winner}</strong> by {fight.prediction.method}
                          <ConfidenceIndicator>
                            <ConfidenceBar>
                              <ConfidenceFill confidence={fight.prediction.confidence} />
                            </ConfidenceBar>
                            <ConfidenceValue>{fight.prediction.confidence}%</ConfidenceValue>
                          </ConfidenceIndicator>
                        </SectionContent>
                      </ResultSection>
                    </ResultDetails>
                  </FightResult>
                ))}
              </FightsContainer>
            </EventCard>
          ))
        ) : (
          <EmptyState>
            <EmptyTitle>No Results Found</EmptyTitle>
            <EmptyDescription>
              {filter === 'all' 
                ? "No fight results are available yet. Results will appear here after UFC events conclude."
                : `No results found for ${filter} predictions. Try a different filter.`
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
      </EventsContainer>
    </Container>
  );
};

export default ResultsPage;
