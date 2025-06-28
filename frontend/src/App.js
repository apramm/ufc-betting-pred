import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import EventsPage from './pages/EventsPage';
import FightCardPage from './pages/FightCardPage';
import PredictionPage from './pages/PredictionPage';
import FightersPage from './pages/FightersPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>UFC Fight Predictor - AI-Powered MMA Predictions</title>
        <meta name="description" content="Get AI-powered predictions for upcoming UFC fights with detailed analysis, fighter stats, and historical data." />
      </Helmet>
      
      <Navbar />
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventsPage />
                </motion.div>
              } 
            />
            <Route 
              path="/events" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventsPage />
                </motion.div>
              } 
            />
            <Route 
              path="/event/:eventId" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FightCardPage />
                </motion.div>
              } 
            />
            <Route 
              path="/predictions" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PredictionPage />
                </motion.div>
              } 
            />
            <Route 
              path="/fighters" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FightersPage />
                </motion.div>
              } 
            />
            <Route 
              path="/results" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResultsPage />
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
