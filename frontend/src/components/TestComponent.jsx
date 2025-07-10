import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendered');

  return (
    <div style={{
      padding: '20px',
      border: '2px solid blue',
      margin: '10px',
      backgroundColor: '#e6f3ff'
    }}>
      <h2>🎉 React is Working!</h2>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestComponent;
