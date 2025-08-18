import { useEffect } from 'react';
import { SponsorWall } from './components/sponsor-wall/SponsorWall';

function App() {
  useEffect(() => {
    console.log('App component mounted');
    return () => console.log('App component unmounting');
  }, []);

  try {
    console.log('App rendering...');
    return (
      <div className="min-h-screen bg-cyber-dark">
        <SponsorWall />
      </div>
    );
  } catch (error) {
    console.error('Error rendering App:', error);
    throw error;
  }
}

export default App;