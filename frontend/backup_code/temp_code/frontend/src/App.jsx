import { useEffect, useState } from "react";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/alerts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch alerts");
        return res.json();
      })
      .then(setAlerts)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>CrowdSec Alerts</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <ul>
        {alerts.length === 0 && !error && <li>No alerts found</li>}
        {alerts.map((alert) => (
          <li key={alert.id}>{alert.message || JSON.stringify(alert)}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
