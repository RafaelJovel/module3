import { useState } from 'react';
import { CreateApplicationForm } from './components/CreateApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import type { ApplicationResponse } from './types/Application';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleApplicationCreated = (_application: ApplicationResponse) => {
    // Increment refresh trigger to cause ApplicationList to re-fetch
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Configuration Service</h1>
      </header>
      <main>
        <CreateApplicationForm onSuccess={handleApplicationCreated} />
        <ApplicationList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;
