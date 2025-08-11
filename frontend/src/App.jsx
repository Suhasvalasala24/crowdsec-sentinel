import { useEffect, useState } from "react";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const API = "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${API}/alerts`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => setAlerts(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>CrowdSec Sentinel — Alerts</h1>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      <pre>{JSON.stringify(alerts, null, 2)}</pre>
    </div>
  );
}

export default App;
