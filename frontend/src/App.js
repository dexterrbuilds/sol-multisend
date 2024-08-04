// src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [token, setToken] = useState('SOL'); // Default token is SOL
  const [tokenMint, setTokenMint] = useState(''); // SPL token mint address
  const [message, setMessage] = useState('');

  const handleInputChange = (index, event) => {
    const values = [...recipients];
    values[index][event.target.name] = event.target.value;
    setRecipients(values);
  };

  const handleAddRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { recipients };
      if (token !== 'SOL') {
        payload.token = tokenMint;
      } else {
        payload.token = 'SOL';
      }
      const response = await axios.post('http://localhost:3000/send', payload);
      setMessage(response.data);
    } catch (error) {
      setMessage(error.response ? error.response.data : 'An error occurred');
    }
  };

  return (
    <div className="App">
      <h1>Send Tokens</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Token Type:
            <select value={token} onChange={(e) => setToken(e.target.value)}>
              <option value="SOL">SOL</option>
              <option value="SPL">SPL Token</option>
            </select>
          </label>
        </div>
        {token === 'SPL' && (
          <div>
            <label>
              SPL Token Mint Address:
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                placeholder="Enter SPL Token Mint Address"
              />
            </label>
          </div>
        )}
        {recipients.map((recipient, index) => (
          <div key={index} className="recipient">
            <input
              type="text"
              name="address"
              placeholder="Recipient Address"
              value={recipient.address}
              onChange={(event) => handleInputChange(index, event)}
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (e.g., 0.5)"
              value={recipient.amount}
              onChange={(event) => handleInputChange(index, event)}
            />
          </div>
        ))}
        <button type="button" onClick={handleAddRecipient}>Add Recipient</button>
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
