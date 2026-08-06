import { useState } from 'react';
import DashboardScreen from './screens/DashboardScreen';
import AntivirusScreen from './screens/AntivirusScreen';
import DataBreachScreen from './screens/DataBreachScreen';
import JunkCleanerScreen from './screens/JunkCleanerScreen';
import BatteryCoolerScreen from './screens/BatteryCoolerScreen';
import AppLockScreen from './screens/AppLockScreen';
import PhishingScreen from './screens/PhishingScreen';
import NetworkGuardScreen from './screens/NetworkGuardScreen';

export type Screen = 'dashboard' | 'antivirus' | 'databreach' | 'junkcleaner' | 'batterycooler' | 'applock' | 'phishing' | 'networkguard' | 'unimplemented';

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
      case 'applock':
        return <AppLockScreen onNavigate={navigate} />;
      case 'phishing':
        return <PhishingScreen onNavigate={navigate} />;
      case 'networkguard':
        return <NetworkGuardScreen onNavigate={navigate} />;
      case 'unimplemented':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <h2 className="text-2xl font-bold text-cyber-cyanAccent mb-4">Module Locked / In Development</h2>
            <p className="text-gray-400 mb-8 max-w-md">
              This security module is not available in the web version or is currently undergoing maintenance.
            </p>
            <button
              onClick={() => navigate('dashboard')}
              className="px-6 py-2 bg-cyber-bluePrimary hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        );
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
