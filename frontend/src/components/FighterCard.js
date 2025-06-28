import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  text-align: center;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
  }
`;

const FighterImageContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
  background: var(--bg-secondary);
`;

const FighterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-secondary);
  background: linear-gradient(135deg, var(--bg-secondary), var(--card-bg));
`;

const FighterName = styled.h3`
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const FighterNickname = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
  
  &::before, &::after {
    content: '"';
    color: var(--primary-color);
  }
`;

const RecordContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(220, 38, 38, 0.05);
  border-radius: 8px;
`;

const RecordItem = styled.div`
  text-align: center;
`;

const RecordValue = styled.div`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
`;

const RecordLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 6px;
`;

const StatValue = styled.div`
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
`;

const WeightClass = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const FighterCard = ({ fighter, showStats = true, compact = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const parseRecord = (record) => {
    if (!record) return { wins: 0, losses: 0, draws: 0 };
    const parts = record.match(/(\d+)-(\d+)-(\d+)/);
    if (parts) {
      return {
        wins: parseInt(parts[1]),
        losses: parseInt(parts[2]),
        draws: parseInt(parts[3])
      };
    }
    return { wins: 0, losses: 0, draws: 0 };
  };

  const record = parseRecord(fighter.record);

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {fighter.weightClass && (
        <WeightClass>{fighter.weightClass}</WeightClass>
      )}

      <FighterImageContainer>
        {!imageError && fighter.image ? (
          <FighterImage
            src={fighter.image}
            alt={fighter.name}
            onError={handleImageError}
          />
        ) : (
          <PlaceholderImage>🥊</PlaceholderImage>
        )}
      </FighterImageContainer>

      <FighterName>{fighter.name}</FighterName>
      
      {fighter.nickname && (
        <FighterNickname>{fighter.nickname}</FighterNickname>
      )}

      <RecordContainer>
        <RecordItem>
          <RecordValue style={{ color: 'var(--success-color)' }}>
            {record.wins}
          </RecordValue>
          <RecordLabel>Wins</RecordLabel>
        </RecordItem>
        <RecordItem>
          <RecordValue style={{ color: 'var(--error-color)' }}>
            {record.losses}
          </RecordValue>
          <RecordLabel>Losses</RecordLabel>
        </RecordItem>
        <RecordItem>
          <RecordValue style={{ color: 'var(--warning-color)' }}>
            {record.draws}
          </RecordValue>
          <RecordLabel>Draws</RecordLabel>
        </RecordItem>
      </RecordContainer>

      {showStats && !compact && (
        <StatsGrid>
          <StatItem>
            <StatValue>{fighter.reach || 'N/A'}</StatValue>
            <StatLabel>Reach</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{fighter.height || 'N/A'}</StatValue>
            <StatLabel>Height</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{fighter.age || 'N/A'}</StatValue>
            <StatLabel>Age</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{fighter.stance || 'N/A'}</StatValue>
            <StatLabel>Stance</StatLabel>
          </StatItem>
        </StatsGrid>
      )}
    </Card>
  );
};

export default FighterCard;
