import React from 'react';
import BlogList from './components/BlogList';
import './components/BlogList.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Blog Frontend</h1>
        <p>React frontend connected to Django REST API</p>
      </header>
      <main>
        <BlogList />
      </main>
    </div>
  );
}

export default App;
