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
      case 'record': return <RecordScreen prefillText={prefillText} onClearPrefill={() => setPrefillText('')} onNavigate={navigate} />;
      case 'news': return <NewsScreen onNavigate={navigate} />;
      case 'gallery': return <GalleryScreen onNavigate={navigate} />;
      case 'books': return <BooksScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: `#163308 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23163308'/%3E%3Cline x1='8' y1='80' x2='5' y2='62' stroke='%231e4a0a' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='8' y1='80' x2='11' y2='63' stroke='%23205210' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='30' y1='80' x2='27' y2='66' stroke='%231e4a0a' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='30' y1='80' x2='33' y2='67' stroke='%23205210' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='55' y1='80' x2='52' y2='65' stroke='%231e4a0a' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='55' y1='80' x2='58' y2='66' stroke='%23205210' stroke-width='1.2' stroke-linecap='round'/%3E%3Cline x1='72' y1='80' x2='70' y2='68' stroke='%231e4a0a' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='19' y1='80' x2='18' y2='70' stroke='%231a4208' stroke-width='1' stroke-linecap='round'/%3E%3Cline x1='44' y1='80' x2='43' y2='69' stroke='%231a4208' stroke-width='1' stroke-linecap='round'/%3E%3Cline x1='65' y1='80' x2='64' y2='71' stroke='%231a4208' stroke-width='1' stroke-linecap='round'/%3E%3Cellipse cx='22' cy='72' rx='5' ry='2.5' fill='%231c4509' opacity='0.7' transform='rotate(-20 22 72)'/%3E%3Cellipse cx='58' cy='74' rx='4' ry='2' fill='%231c4509' opacity='0.6' transform='rotate(15 58 74)'/%3E%3Cellipse cx='40' cy='76' rx='3.5' ry='1.8' fill='%23174008' opacity='0.5' transform='rotate(-10 40 76)'/%3E%3Cellipse cx='70' cy='75' rx='4' ry='2' fill='%231c4509' opacity='0.55' transform='rotate(25 70 75)'/%3E%3Cellipse cx='6' cy='75' rx='3' ry='1.5' fill='%231c4509' opacity='0.5' transform='rotate(-30 6 75)'/%3E%3Cellipse cx='14' cy='78' rx='2.5' ry='1.8' fill='%23122a06' opacity='0.6'/%3E%3Cellipse cx='47' cy='77' rx='2' ry='1.5' fill='%23122a06' opacity='0.5'/%3E%3Cellipse cx='62' cy='78' rx='3' ry='2' fill='%230f2405' opacity='0.55'/%3E%3Cellipse cx='35' cy='79' rx='1.8' ry='1.2' fill='%23122a06' opacity='0.45'/%3E%3C/svg%3E") repeat` }}>
      <div style={{ overflowY: 'auto', height: '100vh', scrollbarWidth: 'none' }}>
        {screen()}
      </div>
      <BottomNav active={tab} onSelect={setTab} />
    </div>
  );
}
