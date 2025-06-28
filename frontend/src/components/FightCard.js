import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Card = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => {
      if (props.isMainEvent) return 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
      if (props.isCoMain) return 'linear-gradient(90deg, var(--secondary-color), var(--primary-color))';
      return 'var(--border-color)';
    }};
  }
`;

const FightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FightType = styled.div`
  background: ${props => {
    if (props.isMainEvent) return 'var(--primary-color)';
    if (props.isCoMain) return 'var(--secondary-color)';
    return 'var(--text-secondary)';
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const WeightClass = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
`;

const FightersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FighterSection = styled.div`
  text-align: ${props => props.align || 'left'};
`;

const FighterImageContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);
  margin: ${props => props.align === 'right' ? '0 0 1rem auto' : '0 auto 1rem 0'};
  background: var(--bg-secondary);
  position: relative;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const FighterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--text-secondary);
`;

const FighterName = styled.h3`
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FighterRecord = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const FighterRanking = styled.div`
  color: var(--primary-color);
  font-size: 0.8rem;
  font-weight: 600;
`;

const VSContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
`;

const VSText = styled.div`
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const OddsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  text-align: center;
`;

const OddsItem = styled.div`
  color: var(--text-secondary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  background: ${props => {
    if (props.variant === 'primary') return 'var(--primary-color)';
    if (props.variant === 'secondary') return 'transparent';
    return 'var(--card-bg)';
  }};
  color: ${props => {
    if (props.variant === 'primary') return 'white';
    if (props.variant === 'secondary') return 'var(--primary-color)';
    return 'var(--text-primary)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'secondary') return 'var(--primary-color)';
    return 'var(--border-color)';
  }};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PredictionContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(220, 38, 38, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
`;

const PredictionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const PredictionTitle = styled.div`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
`;

const Confidence = styled.div`
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.85rem;
`;

const PredictionText = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
`;

const FightCard = ({ 
  fight, 
  onPredict, 
  onViewDetails, 
  showPrediction = false,
  prediction = null,
  isLoading = false 
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (fighterId) => {
    setImageErrors(prev => ({ ...prev, [fighterId]: true }));
  };

  const isMainEvent = fight.cardPosition === 'main';
  const isCoMain = fight.cardPosition === 'co-main';

  const handlePredict = () => {
    if (onPredict && !isLoading) {
      onPredict(fight);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(fight);
    }
  };

  return (
    <Card
      isMainEvent={isMainEvent}
      isCoMain={isCoMain}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FightHeader>
        <FightType isMainEvent={isMainEvent} isCoMain={isCoMain}>
          {isMainEvent ? 'Main Event' : isCoMain ? 'Co-Main Event' : 'Main Card'}
        </FightType>
        <WeightClass>{fight.weightClass}</WeightClass>
      </FightHeader>

      <FightersContainer>
        <FighterSection align="left">
          <FighterImageContainer align="left">
            {!imageErrors[fight.fighter1.id] && fight.fighter1.image ? (
              <FighterImage
                src={fight.fighter1.image}
                alt={fight.fighter1.name}
                onError={() => handleImageError(fight.fighter1.id)}
              />
            ) : (
              <PlaceholderImage>🥊</PlaceholderImage>
            )}
          </FighterImageContainer>
          <FighterName>{fight.fighter1.name}</FighterName>
          <FighterRecord>{fight.fighter1.record}</FighterRecord>
          {fight.fighter1.ranking && (
            <FighterRanking>#{fight.fighter1.ranking}</FighterRanking>
          )}
        </FighterSection>

        <VSContainer>
          <VSText>VS</VSText>
          {fight.odds && (
            <OddsContainer>
              <OddsItem>{fight.odds.fighter1}</OddsItem>
              <OddsItem>{fight.odds.fighter2}</OddsItem>
            </OddsContainer>
          )}
        </VSContainer>

        <FighterSection align="right">
          <FighterImageContainer align="right">
            {!imageErrors[fight.fighter2.id] && fight.fighter2.image ? (
              <FighterImage
                src={fight.fighter2.image}
                alt={fight.fighter2.name}
                onError={() => handleImageError(fight.fighter2.id)}
              />
            ) : (
              <PlaceholderImage>🥊</PlaceholderImage>
            )}
          </FighterImageContainer>
          <FighterName>{fight.fighter2.name}</FighterName>
          <FighterRecord>{fight.fighter2.record}</FighterRecord>
          {fight.fighter2.ranking && (
            <FighterRanking>#{fight.fighter2.ranking}</FighterRanking>
          )}
        </FighterSection>
      </FightersContainer>

      <ActionButtons>
        <ActionButton
          variant="primary"
          onClick={handlePredict}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? <LoadingSpinner size="16px" showText={false} /> : 'Get Prediction'}
        </ActionButton>
        <ActionButton
          variant="secondary"
          onClick={handleViewDetails}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Details
        </ActionButton>
      </ActionButtons>

      {showPrediction && prediction && (
        <PredictionContainer>
          <PredictionHeader>
            <PredictionTitle>AI Prediction</PredictionTitle>
            <Confidence>{prediction.confidence}% Confidence</Confidence>
          </PredictionHeader>
          <PredictionText>
            <strong>{prediction.winner}</strong> - {prediction.method}
            {prediction.reasoning && (
              <div style={{ marginTop: '0.5rem' }}>
                {prediction.reasoning}
              </div>
            )}
          </PredictionText>
        </PredictionContainer>
      )}
    </Card>
  );
};

export default FightCard;
