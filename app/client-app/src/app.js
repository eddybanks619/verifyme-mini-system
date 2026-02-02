import React, { useState } from 'react';
import { verifyIdentity } from './services/verification.service';
import './app.css';

function App() {
  const [type, setType] = useState('NIN');
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyIdentity(type, id);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Identity Verification</h1>
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="NIN">NIN</option>
            <option value="BVN">BVN</option>
            <option value="PASSPORT">Passport</option>
            <option value="DRIVERS_LICENSE">Drivers License</option>
          </select>
        </div>
        <div className="form-group">
          <label>ID Number:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h2>Verification Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;