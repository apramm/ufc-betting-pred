import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FightCard from '../components/FightCard';
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

const EventHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const EventTitle = styled.h1`
  color: var(--text-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const EventDetails = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const EventDetail = styled.div`
  text-align: center;
`;

const DetailLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const EventDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
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

const FightsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const ErrorTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  margin-bottom: 2rem;
`;

const RetryButton = styled(motion.button)`
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

const FightCardPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState({});

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock event data
        const mockEvent = {
          id: eventId,
          name: 'UFC 317: Topuria vs Oliveira',
          date: '2025-02-17T22:00:00Z',
          location: 'O2 Arena, London, UK',
          status: 'upcoming',
          description: 'Featherweight Championship bout headlines this stacked card from London.'
        };
        
        // Mock fights data
        const mockFights = [
          {
            id: 1,
            fighter1: {
              id: 1,
              name: 'Ilia Topuria',
              record: '15-0-0',
              ranking: 1,
              image: null
            },
            fighter2: {
              id: 2,
              name: 'Charles Oliveira',
              record: '34-10-0',
              ranking: 2,
              image: null
            },
            weightClass: 'Featherweight',
            cardPosition: 'main',
            odds: {
              fighter1: '-150',
              fighter2: '+130'
            }
          },
          {
            id: 2,
            fighter1: {
              id: 3,
              name: 'Leon Edwards',
              record: '22-3-0',
              ranking: 1,
              image: null
            },
            fighter2: {
              id: 4,
              name: 'Colby Covington',
              record: '17-4-0',
              ranking: 3,
              image: null
            },
            weightClass: 'Welterweight',
            cardPosition: 'co-main',
            odds: {
              fighter1: '-180',
              fighter2: '+160'
            }
          }
        ];
        
        setEvent(mockEvent);
        setFights(mockFights);

      } catch (err) {
        console.error('Error fetching event data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock event data
      const mockEvent = {
        id: eventId,
        name: 'UFC 317: Topuria vs Oliveira',
        date: '2025-02-17T22:00:00Z',
        location: 'O2 Arena, London, UK',
        status: 'upcoming',
        description: 'Featherweight Championship bout headlines this stacked card from London.'
      };
      
      // Mock fights data
      const mockFights = [
        {
          id: 1,
          fighter1: {
            id: 1,
            name: 'Ilia Topuria',
            record: '15-0-0',
            ranking: 1,
            image: null
          },
          fighter2: {
            id: 2,
            name: 'Charles Oliveira',
            record: '34-10-0',
            ranking: 2,
            image: null
          },
          weightClass: 'Featherweight',
          cardPosition: 'main',
          odds: {
            fighter1: '-150',
            fighter2: '+130'
          }
        },
        {
          id: 2,
          fighter1: {
            id: 3,
            name: 'Leon Edwards',
            record: '22-3-0',
            ranking: 1,
            image: null
          },
          fighter2: {
            id: 4,
            name: 'Colby Covington',
            record: '17-4-0',
            ranking: 3,
            image: null
          },
          weightClass: 'Welterweight',
          cardPosition: 'co-main',
          odds: {
            fighter1: '-180',
            fighter2: '+160'
          }
        }
      ];
      
      setEvent(mockEvent);
      setFights(mockFights);

    } catch (err) {
      console.error('Error fetching event data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (fight) => {
    try {
      setLoadingPredictions(prev => ({ ...prev, [fight.id]: true }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock prediction data
      const mockPrediction = {
        winner: fight.fighter1.name,
        method: 'Decision',
        confidence: Math.floor(Math.random() * 30) + 65, // Random confidence between 65-95%
        reasoning: `Based on statistical analysis, ${fight.fighter1.name} has a slight advantage in striking accuracy and takedown defense. However, ${fight.fighter2.name}'s experience and submission skills make this a competitive matchup.`
      };

      setPredictions(prev => ({
        ...prev,
        [fight.id]: mockPrediction
      }));

    } catch (err) {
      console.error('Error getting prediction:', err);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setLoadingPredictions(prev => ({ ...prev, [fight.id]: false }));
    }
  };

  const handleViewDetails = (fight) => {
    navigate(`/fighters`, { 
      state: { 
        fighter1: fight.fighter1, 
        fighter2: fight.fighter2 
      } 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner size="60px" text="Loading fight card..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton
            onClick={fetchEventData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorTitle>Event Not Found</ErrorTitle>
          <ErrorMessage>The event you're looking for doesn't exist.</ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  const formattedDate = formatDate(event.date);
  const mainCardFights = fights.filter(f => ['main', 'co-main', 'main-card'].includes(f.cardPosition));
  const prelimFights = fights.filter(f => f.cardPosition === 'prelims');

  return (
    <Container>
      <BackButton
        onClick={() => navigate('/events')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Events
      </BackButton>

      <EventHeader>
        <EventTitle>{event.name}</EventTitle>
        <EventDetails>
          <EventDetail>
            <DetailLabel>Date</DetailLabel>
            <DetailValue>{formattedDate.date}</DetailValue>
          </EventDetail>
          <EventDetail>
            <DetailLabel>Time</DetailLabel>
            <DetailValue>{formattedDate.time}</DetailValue>
          </EventDetail>
          <EventDetail>
            <DetailLabel>Location</DetailLabel>
            <DetailValue>{event.location}</DetailValue>
          </EventDetail>
        </EventDetails>
        {event.description && (
          <EventDescription>{event.description}</EventDescription>
        )}
      </EventHeader>

      <StatsContainer>
        <StatCard>
          <StatValue>{fights.length}</StatValue>
          <StatLabel>Total Fights</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{mainCardFights.length}</StatValue>
          <StatLabel>Main Card</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{prelimFights.length}</StatValue>
          <StatLabel>Prelims</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{Object.keys(predictions).length}</StatValue>
          <StatLabel>Predictions Made</StatLabel>
        </StatCard>
      </StatsContainer>

      {mainCardFights.length > 0 && (
        <>
          <SectionTitle>🥊 Main Card</SectionTitle>
          <FightsContainer>
            {mainCardFights.map((fight) => (
              <FightCard
                key={fight.id}
                fight={fight}
                onPredict={handlePredict}
                onViewDetails={handleViewDetails}
                showPrediction={!!predictions[fight.id]}
                prediction={predictions[fight.id]}
                isLoading={loadingPredictions[fight.id]}
              />
            ))}
          </FightsContainer>
        </>
      )}

      {prelimFights.length > 0 && (
        <>
          <SectionTitle>🥊 Preliminary Card</SectionTitle>
          <FightsContainer>
            {prelimFights.map((fight) => (
              <FightCard
                key={fight.id}
                fight={fight}
                onPredict={handlePredict}
                onViewDetails={handleViewDetails}
                showPrediction={!!predictions[fight.id]}
                prediction={predictions[fight.id]}
                isLoading={loadingPredictions[fight.id]}
              />
            ))}
          </FightsContainer>
        </>
      )}

      {fights.length === 0 && (
        <ErrorContainer>
          <ErrorTitle>No Fights Available</ErrorTitle>
          <ErrorMessage>Fight card information is not yet available for this event.</ErrorMessage>
        </ErrorContainer>
      )}
    </Container>
  );
};

export default FightCardPage;
