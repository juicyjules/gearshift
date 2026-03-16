import { TransmissionProvider } from './providers/TransmissionProvider';
import { OAuthProvider } from './providers/OAuthProvider';
import Main from './components/Main';
import { useOAuth } from './hooks/useOAuth';
import LoginScreen from './components/LoginScreen';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useOAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Could replace with a better spinner
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <TransmissionProvider>
      <Main />
    </TransmissionProvider>
  );
};

function App() {
  return (
    <OAuthProvider>
      <AppContent />
    </OAuthProvider>
  );
}

export default App;
