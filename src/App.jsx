import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import { getFontSize, applyFontSize } from './utils/fontSize';
import HomeScreen from './screens/HomeScreen';
import RecordScreen from './screens/RecordScreen';
import NewsScreen from './screens/NewsScreen';
import GalleryScreen from './screens/GalleryScreen';
import BooksScreen from './screens/BooksScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingScreen, { loadOnboarding } from './screens/OnboardingScreen';

export default function App() {
  const [tab, setTab] = useState('home');
  const [prefillText, setPrefillText] = useState('');
  useEffect(() => { applyFontSize(getFontSize()); }, []);
  const [onboardingDone, setOnboardingDone] = useState(() => !!loadOnboarding());
  const [userProfile, setUserProfile] = useState(() => loadOnboarding());

  const navigate = (t) => setTab(t);

  const handleOnboardingDone = (profile) => {
    setUserProfile(profile);
    setOnboardingDone(true);
  };

  const handleFillRecord = (text) => {
    setPrefillText(text);
  };

  if (!onboardingDone) {
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  const screen = () => {
    switch (tab) {
      case 'home': return <HomeScreen onNavigate={navigate} onFillRecord={handleFillRecord} />;
      case 'record': return <RecordScreen prefillText={prefillText} onClearPrefill={() => setPrefillText('')} />;
      case 'news': return <NewsScreen onNavigate={navigate} />;
      case 'gallery': return <GalleryScreen onNavigate={navigate} />;
      case 'books': return <BooksScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a3d0a', position: 'relative' }}>
      <div style={{ overflowY: 'auto', height: '100vh', scrollbarWidth: 'none' }}>
        {screen()}
      </div>
      <BottomNav active={tab} onSelect={setTab} />
    </div>
  );
}
