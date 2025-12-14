import { ApplicationList } from './components/ApplicationList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Configuration Service</h1>
      </header>
      <main>
        <ApplicationList />
      </main>
    </div>
  );
}

export default App;
