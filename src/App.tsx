import { useState } from 'react';
import DashboardScreen from './screens/DashboardScreen';
import AntivirusScreen from './screens/AntivirusScreen';
import DataBreachScreen from './screens/DataBreachScreen';
import JunkCleanerScreen from './screens/JunkCleanerScreen';
import BatteryCoolerScreen from './screens/BatteryCoolerScreen';
import PhishingScreen from './screens/PhishingScreen';
import NetworkScreen from './screens/NetworkScreen';
import AppLockScreen from './screens/AppLockScreen';

export type Screen = 'dashboard' | 'antivirus' | 'databreach' | 'junkcleaner' | 'batterycooler' | 'phishing' | 'network' | 'applock';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={navigate} />;
      case 'antivirus':
        return <AntivirusScreen onNavigate={navigate} />;
      case 'databreach':
        return <DataBreachScreen onNavigate={navigate} />;
      case 'junkcleaner':
        return <JunkCleanerScreen onNavigate={navigate} />;
      case 'batterycooler':
        return <BatteryCoolerScreen onNavigate={navigate} />;
      case 'phishing':
        return <PhishingScreen onNavigate={navigate} />;
      case 'network':
        return <NetworkScreen onNavigate={navigate} />;
      case 'applock':
        return <AppLockScreen onNavigate={navigate} />;
      default:
        return <DashboardScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyber-navy via-cyber-darkCard to-cyber-navy font-sans text-gray-200">
      <div className="max-w-4xl mx-auto min-h-screen shadow-2xl bg-cyber-navy/50 relative overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
