import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import BuildersPage from './pages/BuildersPage';
import TeamsPage from './pages/TeamsPage';
import ProfilePage from './pages/ProfilePage';
import CreateSuperheroPage from './pages/CreateSuperheroPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-dreamy-gradient">
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/builders" element={<BuildersPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/create-superhero" element={<CreateSuperheroPage />} />
          </Routes>
          
          <Footer />
          
          {/* Floating background elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-20 left-10 w-16 h-16 bg-sky-blue opacity-20 rounded-full animate-float"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-sunset-coral opacity-15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-moss-green opacity-10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-60 right-1/3 w-8 h-8 bg-sunset-coral opacity-25 rounded-full animate-bounce-slow" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;