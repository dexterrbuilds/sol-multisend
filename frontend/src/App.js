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
      <h1 className='header'>ThatDegenDev Multisender</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <div>Token Type</div>
            <select value={token} onChange={(e) => setToken(e.target.value)}>
              <option value="SOL">SOL</option>
              <option value="SPL">SPL Token</option>
            </select>
          </label>
        </div>
        {token === 'SPL' && (
          <div>
            <label>
              <div>SPL Token Mint Address</div>
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
            <div className='address'>
              <input
                type="text"
                className='address'
                name="address"
                placeholder="Recipient Address"
                value={recipient.address}
                onChange={(event) => handleInputChange(index, event)}
              />
            </div>
            <div className='amount'>
              <input
                type="number"
                className='amount'
                name="amount"
                placeholder="Amount (e.g., 0.5)"
                value={recipient.amount}
                onChange={(event) => handleInputChange(index, event)}
              />
            </div>
          </div>
        ))}
        <div className='btns'>
          <button type="button" onClick={handleAddRecipient}>Add Recipient</button>
          <button type="submit">Send</button>
        </div>
      </form>
      {message && <p className='message'>{message}</p>}
    </div>
  );
}

export default App;
