import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Default marker icon fix for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

export default function AlertsDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Simple geolocation function (replace with a real API for production)
  const geoLookup = (ip) => {
    // This is just placeholder: random coordinates for demo
    return [
      Math.random() * 140 - 70, // lat between -70 and +70
      Math.random() * 360 - 180, // lng between -180 and +180
    ];
  };

  if (loading) return <p>Loading alerts...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h1>CrowdSec Banned IPs Dashboard</h1>

      <div style={{ height: "500px", width: "100%" }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {alerts.map((alert, index) => (
            <Marker
              key={index}
              position={geoLookup(alert.value)}
            >
              <Popup>
                <strong>{alert.value}</strong>
                <br />
                Type: {alert.type}
                <br />
                Duration: {alert.duration}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>IP</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Origin</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert, idx) => (
            <tr key={idx}>
              <td>{alert.value}</td>
              <td>{alert.type}</td>
              <td>{alert.duration}</td>
              <td>{alert.origin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
