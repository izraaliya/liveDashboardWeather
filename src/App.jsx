import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "./App.css"; // pastikan file ini ada

function App() {
  const [city, setCity] = useState("Jakarta"); // kota aktif
  const [inputCity, setInputCity] = useState("Jakarta"); // input pencarian
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "http://127.0.0.1:5000"; // alamat backend Flask

  const fetchForecast = async (cityName) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/forecast?city=${cityName}&days=5`);
      const data = await res.json();

      if (res.ok) {
        const formatted = data.forecast.map((d) => ({
          date: d.date,
          temp: d.avgtemp_c,
          max: d.maxtemp_c,
          min: d.mintemp_c,
          humidity: d.humidity,
          uv: d.uv,
        }));
        setForecast(formatted);
        setCity(cityName); // update nama kota yang tampil
      } else {
        setError(data.error || "Failed to fetch forecast");
      }
    } catch (err) {
      setError("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(city);
  }, []);

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#A569BD"];

  return (
    <div
      className="min-vh-100 text-white"
      style={{
        background:
          "linear-gradient(135deg, #09131a 0%, #0c2029 50%, #12313f 100%)",
      }}
    >
      {/* NAVBAR */}
      <nav
        className="navbar navbar-dark sticky-top py-3 shadow"
        style={{
          background: "rgba(10, 25, 40, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0 text-gradient">🌤️ Weather Dashboard</h3>
          <form
            className="d-flex"
            onSubmit={(e) => {
              e.preventDefault();
              fetchForecast(inputCity);
            }}
          >
            <input
              type="text"
              className="form-control bg-dark text-white border-0 me-2 px-3"
              style={{ width: "230px", borderRadius: "12px", opacity: 0.85 }}
              placeholder="Search city..."
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
            />
            <button
              className="btn btn-primary fw-semibold px-4 rounded-3"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="container py-4">
        {loading ? (
          <h5 className="text-center text-info mt-5">Loading weather data...</h5>
        ) : error ? (
          <h5 className="text-center text-danger mt-5">{error}</h5>
        ) : (
          <>
            <h4 className="text-center mb-4 text-info fw-semibold tracking-wide">
              {city}
            </h4>

            {/* GRID */}
            <div className="row g-4 justify-content-center">
              {/* CARD 1 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">🌡️ Temperature Trend (°C)</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3a47" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#00BFFF"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">🔥 Max & ❄️ Min Temperature</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3a47" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="max" fill="#ff6363" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="min" fill="#63a4ff" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">💧 Humidity (%)</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3a47" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stroke="#00FFFF"
                        fill="#00FFFF22"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 4 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">🌤️ UV Index</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3a47" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="#FFD700"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 5 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">🧩 Daily Average Temp</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={forecast}
                        dataKey="temp"
                        nameKey="date"
                        outerRadius={90}
                        label
                      >
                        {forecast.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 6 */}
              <div className="col-xl-6 col-lg-6 col-md-12">
                <div className="glass-card p-4 rounded-4">
                  <h6 className="fw-semibold mb-3">📊 Humidity vs UV</h6>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3a47" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="humidity"
                        fill="#00C49F"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar dataKey="uv" fill="#FFD700" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
