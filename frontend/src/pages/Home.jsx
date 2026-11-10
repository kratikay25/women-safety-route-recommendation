import { useState } from "react";
import { FaShieldAlt, FaRoute, FaMapMarkerAlt } from "react-icons/fa";
import MapView from "../components/MapView";
import API from "../services/api";

function RouteCard({ title, route, recommended = false }) {
  if (!route) return null;

  const distanceValue = Number(
    route.distance_km ?? route.distance ?? 0
  );

  // Support common backend response field names.
  const score = Number(route.safety_score ?? 0);

  const crimeIndex = Number(
    route.average_crime_index ??
      route.avg_crime_index ??
      route.average_crime ??
      0
  );

  const walkingTime =
    route.estimated_walking_time_min ??
    route.estimated_walking_time ??
    route.walking_time_min ??
    route.walking_time ??
    route.estimated_time_min ??
    null;

  const risk =
    route.risk_category ??
    route.crime_risk ??
    route.dataset_risk_category ??
    "Unavailable";

  const distance = Number.isFinite(distanceValue)
    ? distanceValue
    : 0;

  return (
    <section className={`route-card ${recommended ? "recommended" : ""}`}>
      <div className="route-card-heading">
        {recommended ? <FaShieldAlt /> : <FaRoute />}
        <h2>{title}</h2>

        {recommended && (
          <span className="recommended-badge">Recommended</span>
        )}
      </div>

      <div className="safety-score">
        <div className="score-number">{score}/100</div>

        <div>
          <strong>Relative safety score</strong>
          <div className="score-caption">
            Estimated using available crime data
          </div>
        </div>
      </div>

      <div className="route-stat-grid">
        <div className="route-stat">
          <span className="route-stat-label">Distance</span>
          <span className="route-stat-value">
            {distance.toFixed(2)} km
          </span>
        </div>

        <div className="route-stat">
          <span className="route-stat-label">
            Walking time (estimated)
          </span>
          <span className="route-stat-value">
            {walkingTime != null ? `${walkingTime} min` : "Not provided"}
          </span>
        </div>

        <div className="route-stat">
          <span className="route-stat-label">Average crime index</span>
          <span className="route-stat-value">
            {Number.isFinite(crimeIndex) ? crimeIndex.toFixed(2) : "—"}
          </span>
        </div>

        <div className="route-stat">
          <span className="route-stat-label">Dataset risk category</span>
          <span className="route-stat-value">{risk}</span>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function findRoute() {
    setError("");
    setStatus("");
    setRoutes(null);

    if (!source || !destination) {
      setError("Please select both a starting location and a destination.");
      return;
    }

    const samePoint =
      Math.abs(source.lat - destination.lat) < 0.000001 &&
      Math.abs(source.lng - destination.lng) < 0.000001;

    if (samePoint) {
      setError("Your source and destination are the same. Please choose two different locations.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/safest-route", {
        source_lat: Number(source.lat),
        source_lon: Number(source.lng),
        destination_lat: Number(destination.lat),
        destination_lon: Number(destination.lng),
      });

      const data = response.data;

      if (!data.safer_route || !data.shortest_route) {
        throw new Error(
          "The server did not return both route options. Please check the backend response."
        );
      }

      setRoutes(data);
      setStatus("Routes calculated successfully.");
    } catch (err) {
      console.error("Route calculation failed:", err);

      setError(
        err.response?.data?.error ||
          err.message ||
          "Unable to calculate routes. Please try different locations."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSource(point) {
    setSource(point);
    setRoutes(null);
    setError("");
    setStatus("");
  }

  function updateDestination(point) {
    setDestination(point);
    setRoutes(null);
    setError("");
    setStatus("");
  }

  function resetSelection() {
    setSource(null);
    setDestination(null);
    setRoutes(null);
    setError("");
    setStatus("");
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="brand">
          <div className="brand-icon">
            <FaShieldAlt />
          </div>

          <div>
            <div className="brand-name">Women's Safety</div>
            <div className="brand-caption">
              Delhi route intelligence
            </div>
          </div>
        </header>

        <div className="intro">
          <span className="eyebrow">
            SMART CITY • SAFER JOURNEYS
          </span>

          <h1>Smart Safety Navigation</h1>

          <p className="subtitle">
            Compare routes using the available Delhi road network and crime
            data to explore a potentially safer journey.
          </p>
        </div>

        <div className="selection-panel">
          <h3>Plan your journey</h3>

          <div className="selection-hint">
            <FaMapMarkerAlt />
            Search on the map or click two points to select your locations.
          </div>

          <div className="selected-location">
            <span className="location-dot source-dot" />

            <div>
              <span className="location-label">Starting location</span>

              <strong>
                {source
                  ? `${source.lat.toFixed(5)}, ${source.lng.toFixed(5)}`
                  : "Choose a source on the map"}
              </strong>
            </div>
          </div>

          <div className="selected-location">
            <span className="location-dot destination-dot" />

            <div>
              <span className="location-label">Destination</span>

              <strong>
                {destination
                  ? `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}`
                  : "Choose your destination"}
              </strong>
            </div>
          </div>

          <div className="button-row">
            <button
              className="primary-button"
              onClick={findRoute}
              disabled={loading || !source || !destination}
            >
              {loading ? "Calculating..." : "Find Safest Route"}
            </button>

            <button
              className="secondary-button"
              onClick={resetSelection}
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {status && (
            <div className="status-message" role="status">
              {status}
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>

        {routes && (
          <div className="results-section">
            <div className="results-heading">Route comparison</div>

            <RouteCard
              title="Safer Route"
              route={routes.safer_route}
              recommended
            />

            <RouteCard
              title="Shortest Route"
              route={routes.shortest_route}
            />

            <div className="route-legend">
              <span className="legend-item">
                <span className="legend-line shortest" />
                Shortest route
              </span>

              <span className="legend-item">
                <span className="legend-line safer" />
                Safer route
              </span>
            </div>
          </div>
        )}

        <div className="disclaimer">
          Safety scores and risk categories are estimates based on the
          available dataset. They do not guarantee real-world safety.
        </div>

        <footer className="page-footer">
          <strong>Women Safety Navigation System</strong>
          <br />
          Delhi road network and crime-data analysis
          <br />
          Academic project prototype
        </footer>
      </aside>

      <main className="map-area">
        <div className="map-top-label">
          <span className="map-status-dot" />
          Delhi Road Network
          <span className="map-top-divider">/</span>
          Select locations to plan a route
        </div>

        <MapView
          source={source}
          destination={destination}
          setSource={updateSource}
          setDestination={updateDestination}
          routes={routes}
        />

        <div className="map-bottom-note">
          Routes are estimates based on available road and crime data.
        </div>
      </main>
    </div>
  );
}

export default Home;