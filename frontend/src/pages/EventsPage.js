import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp } from 'lucide-react';
import styled from 'styled-components';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, rgba(210, 10, 10, 0.1) 0%, rgba(139, 0, 0, 0.1) 100%);
  border-bottom: 1px solid var(--border);
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.$primary ? 'var(--gradient-primary)' : 'var(--card-bg)'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid ${props => props.$primary ? 'transparent' : 'var(--border)'};
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
`;

const StatsSection = styled.section`
  padding: 4rem 0;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: var(--dark-bg);
  border-radius: 16px;
  border: 1px solid var(--border);
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-weight: 500;
`;

const EventsSection = styled.section`
  padding: 4rem 0;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

// Sample UFC events data
const sampleEvents = [
  {
    id: 'ufc-317',
    name: 'UFC 317: Topuria vs Oliveira',
    date: '2025-02-17T22:00:00Z',
    location: 'O2 Arena, London, UK',
    status: 'upcoming',
    mainEvent: {
      fighter1: 'Ilia Topuria',
      fighter2: 'Charles Oliveira'
    },
    totalFights: 12,
    predictions: 0,
    accuracy: 'N/A',
    description: 'Featherweight Championship bout headlines this stacked card from London.'
  },
  {
    id: 'ufc-318',
    name: 'UFC 318: Holloway vs Poirier 3',
    date: '2025-03-08T22:00:00Z',
    location: 'T-Mobile Arena, Las Vegas, NV',
    status: 'upcoming',
    mainEvent: {
      fighter1: 'Max Holloway',
      fighter2: 'Dustin Poirier'
    },
    totalFights: 11,
    predictions: 0,
    accuracy: 'N/A',
    description: 'The trilogy fight everyone has been waiting for in the lightweight division.'
  },
  {
    id: 'ufc-319',
    name: 'UFC 319: Jones vs Miocic',
    date: '2025-03-29T22:00:00Z',
    location: 'Madison Square Garden, New York, NY',
    status: 'upcoming',
    mainEvent: {
      fighter1: 'Jon Jones',
      fighter2: 'Stipe Miocic'
    },
    totalFights: 13,
    predictions: 0,
    accuracy: 'N/A',
    description: 'Heavyweight championship unification bout at the world\'s most famous arena.'
  },
  {
    id: 'ufc-316',
    name: 'UFC 316: Adesanya vs Whittaker 3',
    date: '2025-01-25T22:00:00Z',
    location: 'RAC Arena, Perth, Australia',
    status: 'completed',
    mainEvent: {
      fighter1: 'Israel Adesanya',
      fighter2: 'Robert Whittaker'
    },
    totalFights: 10,
    predictions: 8,
    accuracy: '75%',
    description: 'The decisive trilogy fight in the middleweight division.'
  }
];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Use sample data - in production, this would fetch from API
      setEvents(sampleEvents);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { number: '15+', label: 'Upcoming Events' },
    { number: '95%', label: 'Prediction Accuracy' },
    { number: '500+', label: 'Fighters Analyzed' },
    { number: '13', label: 'Weight Classes' },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>UFC Fight Predictor - Real-time MMA Analytics</title>
        <meta name="description" content="View upcoming UFC events and get real-time analytics with detailed fighter analysis." />
      </Helmet>

      <HeroSection>
        <HeroContent>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeroTitle>UFC Fight Predictor</HeroTitle>
            <HeroSubtitle>
              Real-time data and advanced analytics for upcoming UFC fights. 
              Get detailed statistical analysis, fighter comparisons, and insights.
            </HeroSubtitle>
            <CTAButtons>
              <CTAButton to="/fighters" $primary>
                <Users size={20} />
                Browse Fighters
              </CTAButton>
              <CTAButton to="/results">
                <TrendingUp size={20} />
                View Results
              </CTAButton>
            </CTAButtons>
          </motion.div>
        </HeroContent>
      </HeroSection>

      <StatsSection>
        <StatsGrid>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatCard>
                <StatNumber>{stat.number}</StatNumber>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            </motion.div>
          ))}
        </StatsGrid>
      </StatsSection>

      <EventsSection>
        <SectionContent>
          <SectionHeader>
            <SectionTitle>Upcoming Events</SectionTitle>
            <SectionSubtitle>
              Click on any event to view the full fight card and generate AI predictions
            </SectionSubtitle>
          </SectionHeader>

          {loading ? (
            <LoadingSpinner message="Loading upcoming events..." />
          ) : error ? (
            <EmptyState>
              <EmptyIcon>⚠️</EmptyIcon>
              <EmptyTitle>Error Loading Events</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
              <CTAButton onClick={fetchEvents}>Try Again</CTAButton>
            </EmptyState>
          ) : events.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>No Upcoming Events</EmptyTitle>
              <EmptyDescription>
                There are no UFC events scheduled at the moment. Check back soon for updates!
              </EmptyDescription>
            </EmptyState>
          ) : (
            <EventsGrid>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </EventsGrid>
          )}
        </SectionContent>
      </EventsSection>
    </PageContainer>
  );
};

export default EventsPage;
