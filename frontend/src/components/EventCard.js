import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Card = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(220, 38, 38, 0.2);
    border-color: var(--primary-red);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-red), var(--primary-gold));
  }
`;

const EventHeader = styled.div`
  margin-bottom: 1rem;
`;

const EventTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  padding-right: 1rem; /* Add some padding for the status badge */
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const StatusAndDateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.div`
  background: ${props => {
    switch(props.status) {
      case 'upcoming': return 'var(--success)';
      case 'live': return 'var(--primary-red)';
      case 'completed': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const EventDate = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: right;
  white-space: nowrap;
`;

const EventLocation = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '📍';
    margin-right: 0.5rem;
  }
`;

const MainEvent = styled.div`
  background: rgba(210, 10, 10, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid var(--primary-red);
`;

const MainEventLabel = styled.div`
  color: var(--primary-red);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const FighterMatchup = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
`;

const EventStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EventCard = ({ event, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else {
      navigate(`/event/${event.id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const formattedDate = formatDate(event.date);

  return (
    <Card
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTapPress={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <EventHeader>
        <EventTitle>{event.name}</EventTitle>
      </EventHeader>
      
      <StatusAndDateContainer>
        <StatusBadge status={event.status}>
          {event.status || 'upcoming'}
        </StatusBadge>
        <EventDate>
          <div>{formattedDate.date}</div>
          <div>{formattedDate.time}</div>
        </EventDate>
      </StatusAndDateContainer>

      <EventLocation>
        {event.location}
      </EventLocation>

      {event.mainEvent && (
        <MainEvent>
          <MainEventLabel>Main Event</MainEventLabel>
          <FighterMatchup>
            {event.mainEvent.fighter1} vs {event.mainEvent.fighter2}
          </FighterMatchup>
        </MainEvent>
      )}

      <EventStats>
        <StatItem>
          <StatValue>{event.totalFights || 0}</StatValue>
          <StatLabel>Fights</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{event.predictions || 0}</StatValue>
          <StatLabel>Predictions</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{event.accuracy || 'N/A'}</StatValue>
          <StatLabel>Accuracy</StatLabel>
        </StatItem>
      </EventStats>
    </Card>
  );
};

export default EventCard;
