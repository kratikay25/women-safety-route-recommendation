import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";

import { useEffect, useState } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const DELHI_CENTER = [28.6139, 77.2090];

// Fix map sizing when the layout changes
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    const timer = setTimeout(resizeMap, 300);
    window.addEventListener("resize", resizeMap);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
}

// Location search using OpenStreetMap Nominatim
function LocationSearch({ onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setSearchError("");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({
          q: `${trimmedQuery}, Delhi, India`,
          format: "jsonv2",
          limit: "5",
          countrycodes: "in",
          viewbox: "76.8,28.9,77.5,28.4",
          bounded: "0",
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Search is temporarily unavailable.");
        }

        const data = await response.json();

        setSuggestions(
          data.map((item) => ({
            name: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
          }))
        );

        if (data.length === 0) {
          setSearchError("No matching locations found. Try another name.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Location search error:", error);
          setSearchError("Unable to search right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function chooseLocation(location) {
  // Stop the selected address from being searched again.
  setQuery("");
  setSuggestions([]);
  setSearchError("");

  onSelect({
    lat: location.lat,
    lng: location.lng,
  });
}

  return (
    <div className="location-search">
      <div className="location-search-input">
        <FaSearch />

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
        />

        {loading && <span className="search-loading">Searching...</span>}
      </div>

      {suggestions.length > 0 && (
        <div className="location-suggestions">
          {suggestions.map((location, index) => (
            <button
              key={`${location.lat}-${location.lng}-${index}`}
              type="button"
              onClick={() => chooseLocation(location)}
            >
              <FaMapMarkerAlt />
              <span>{location.name}</span>
            </button>
          ))}
        </div>
      )}

      {searchError && (
        <div className="location-search-error">{searchError}</div>
      )}
    </div>
  );
}

// Allows users to select source and destination by clicking the map
function LocationSelector({
  source,
  destination,
  setSource,
  setDestination,
}) {
  useMapEvents({
    click(event) {
      if (!source) {
        setSource(event.latlng);
      } else if (!destination) {
        setDestination(event.latlng);
      }
    },
  });

  return null;
}

// Zoom to selected points and calculated routes
function FitRoutes({ routes, source, destination }) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (source) {
      points.push([source.lat, source.lng]);
    }

    if (destination) {
      points.push([destination.lat, destination.lng]);
    }

    if (routes?.safer_route?.coordinates) {
      points.push(
        ...routes.safer_route.coordinates.map((point) => [
          point.latitude,
          point.longitude,
        ])
      );
    }

    if (routes?.shortest_route?.coordinates) {
      points.push(
        ...routes.shortest_route.coordinates.map((point) => [
          point.latitude,
          point.longitude,
        ])
      );
    }

    if (points.length > 1) {
      map.fitBounds(points, {
        padding: [45, 45],
        maxZoom: 15,
      });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [map, routes, source, destination]);

  return null;
}

function MapView({
  source,
  destination,
  setSource,
  setDestination,
  routes,
}) {
  const saferCoordinates =
    routes?.safer_route?.coordinates?.map((point) => [
      point.latitude,
      point.longitude,
    ]) ?? [];

  const shortestCoordinates =
    routes?.shortest_route?.coordinates?.map((point) => [
      point.latitude,
      point.longitude,
    ]) ?? [];

  return (
    <div className="map-wrapper">
      <div className="map-search-panel">
        <LocationSearch
          placeholder="Search starting location in Delhi"
          onSelect={setSource}
        />

        <LocationSearch
          placeholder="Search destination in Delhi"
          onSelect={setDestination}
        />
      </div>

      <MapContainer
        center={DELHI_CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapResizeHandler />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => {
              console.warn("A map tile failed to load.");
            },
          }}
        />

        <LocationSelector
          source={source}
          destination={destination}
          setSource={setSource}
          setDestination={setDestination}
        />

        <FitRoutes
          routes={routes}
          source={source}
          destination={destination}
        />

        {source && (
          <Marker position={[source.lat, source.lng]}>
            <Popup>Starting location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {shortestCoordinates.length > 1 && (
          <Polyline
            positions={shortestCoordinates}
            pathOptions={{
              color: "#2563eb",
              weight: 5,
              opacity: 0.8,
            }}
          >
            <Popup>Shortest route</Popup>
          </Polyline>
        )}

        {saferCoordinates.length > 1 && (
          <Polyline
            positions={saferCoordinates}
            pathOptions={{
              color: "#16a34a",
              weight: 5,
              opacity: 0.9,
            }}
          >
            <Popup>
              Safer route — based on the available crime data
            </Popup>
          </Polyline>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;