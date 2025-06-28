import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Calendar, Users, TrendingUp } from 'lucide-react';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 80px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  
  .logo-icon {
    background: var(--gradient-primary);
    border-radius: 50%;
    padding: 0.5rem;
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logo-text {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: ${props => props.$active ? 'var(--primary-red)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: var(--primary-red);
    background: rgba(210, 10, 10, 0.1);
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
  
  ${props => props.$active && `
    background: rgba(210, 10, 10, 0.1);
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 1rem;
      right: 1rem;
      height: 2px;
      background: var(--gradient-primary);
      border-radius: 2px;
    }
  `}
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--card-bg);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(10, 10, 10, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 1rem;
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: ${props => props.$active ? 'var(--primary-red)' : 'var(--text-secondary)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-red);
    background: rgba(210, 10, 10, 0.1);
  }
  
  .icon {
    width: 20px;
    height: 20px;
  }
  
  ${props => props.$active && `
    background: rgba(210, 10, 10, 0.1);
    border-left: 3px solid var(--primary-red);
  `}
`;

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Events', icon: Calendar },
    { path: '/fighters', label: 'Fighters', icon: Users },
    { path: '/results', label: 'Results', icon: TrendingUp },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/" onClick={closeMobileMenu}>
          <span className="logo-text">UFC Fight Predictor</span>
        </Logo>
        
        <NavLinks>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                $active={location.pathname === item.path}
              >
                <Icon className="icon" />
                {item.label}
              </NavLink>
            );
          })}
        </NavLinks>

        <MobileMenuButton onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
      </NavContent>

      {mobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <MobileNavLink
                key={item.path}
                to={item.path}
                $active={location.pathname === item.path}
                onClick={closeMobileMenu}
              >
                <Icon className="icon" />
                {item.label}
              </MobileNavLink>
            );
          })}
        </MobileMenu>
      )}
    </NavContainer>
  );
};

export default Navbar;
