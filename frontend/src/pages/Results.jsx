import { useLocation, useNavigate } from "react-router-dom";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  if (!data) {
    return (
      <div>
        <h2>No route data found</h2>
        <button onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">

      <h1>Route Analysis</h1>

      <div className="result-card">
        <h3>Safety Score</h3>
        <p>{data.safety_score}</p>
      </div>

      <div className="result-card">
        <h3>Crime Risk</h3>
        <p>{data.crime_risk}</p>
      </div>

      <div className="result-card">
        <h3>Distance</h3>
        <p>{data.distance}</p>
      </div>

      <div className="result-card">
        <h3>Estimated Time</h3>
        <p>{data.estimated_time}</p>
      </div>

      <button onClick={() => navigate("/")}>
        Back
      </button>

    </div>
  );
}

export default Results;