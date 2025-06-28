import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid var(--card-bg);
  border-top: 3px solid var(--primary-red);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-left: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const LoadingSpinner = ({ size, text, showText = true }) => {
  return (
    <SpinnerContainer>
      <Spinner size={size} />
      {showText && <LoadingText>{text || 'Loading...'}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
