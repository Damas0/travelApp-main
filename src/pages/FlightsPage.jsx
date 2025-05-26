import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './FlightsPage.css';
import LoadingFlight from "../assets/LoadingFlight.gif";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AddToListModal from "./AddToListModal";

function FlightsPage() {
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination');
  const [user, setUser] = useState(null);

  // Suivi de l'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fonction pour obtenir la date d'aujourd'hui formatée en YYYY-MM-DD
  const getFutureDate = (daysToAdd) => {
    const today = new Date();
    today.setDate(today.getDate() + daysToAdd);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Cache pour les noms des aéroports
  const airportCache = {};

  // Fonction pour obtenir le nom complet de l'aéroport à partir du code
  const getAirportName = async (code) => {
    if (airportCache[code]) {
      return airportCache[code];
    }
    try {
      const token = await getAccessToken();
      const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/locations`, {
        params: {
          subType: 'CITY,AIRPORT',
          keyword: code,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const airport = response.data.data.find((location) => location.iataCode === code);
      const airportName = airport ? airport.name : code;
      airportCache[code] = airportName;
      return airportName;
    } catch (error) {
      console.error('Failed to fetch airport name', error);
      return code;
    }
  };

  const airlineCache = {};

  // Fonction pour obtenir le nom complet de la compagnie aérienne à partir du code
  const getAirlineName = async (code) => {
    if (airlineCache[code]) {
      return airlineCache[code];
    }
    try {
      const token = await getAccessToken();
      const response = await axios.get(`https://test.api.amadeus.com/v1/reference-data/airlines`, {
        params: {
          airlineCodes: code,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const airline = response.data.data.find((airline) => airline.iataCode === code);
      const airlineName = airline ? airline.commonName : code;
      airlineCache[code] = airlineName;
      return airlineName;
    } catch (error) {
      console.error('Failed to fetch airline name', error);
      return code;
    }
  };

  // Base states
  const [origin, setOrigin] = useState('YUL');
  const [destination, setDestination] = useState(destinationParam || 'PAR');
  const [departureDate, setDepartureDate] = useState(getFutureDate(7));
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('oneWay');
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [maxPrice, setMaxPrice] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDetails, setOpenDetails] = useState([]);
  const [searchTermOrigin, setSearchTermOrigin] = useState('');
  const [searchTermDestination, setSearchTermDestination] = useState('');

  // Suggestions states
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);

  // États pour la modale d'ajout à la liste
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Effet pour pré-remplir la destination si elle est passée en paramètre
  useEffect(() => {
    if (destinationParam) {
      setDestination(destinationParam);
      fetchFlights();
    }
  }, [destinationParam]);

  const formatDuration = (duration) => {
    return duration.replace('PT', '').toLowerCase();
  };

  const toggleDetails = (index) => {
    const newOpenDetails = [...openDetails];
    newOpenDetails[index] = !newOpenDetails[index];
    setOpenDetails(newOpenDetails);
  };

  const getAccessToken = async () => {
    const clientId = 'gU3FFhuh8AiqFEU7ouwVxu0MQgK37hB2';
    const clientSecret = '5HcoGXVG48VG1LuF';
    try {
      const response = await axios.post(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data.access_token;
    } catch (err) {
      throw new Error('Erreur lors de la récupération du token : ' + err.message);
    }
  };

  const fetchFlights = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      const params = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: '1',
        travelClass: travelClass,
        ...(tripType === 'roundTrip' && returnDate && { returnDate }),
        ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
        currencyCode: 'CAD',
        max: 10
      };

      const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setFlights(response.data.data || []);
      if ((response.data.data || []).length === 0) {
        setError('Aucun vol trouvé pour ces critères');
      }
    } catch (err) {
      setError('Erreur lors de la recherche : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchAirports = async (query, type) => {
  if (query.length < 2) {
    type === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
    return;
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(
      'https://test.api.amadeus.com/v1/reference-data/locations',
      {
        params: {
          subType: 'AIRPORT',
          keyword: query,
          'page[limit]': 5
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const airports = response.data.data.map(loc => ({
      iata_code: loc.iataCode,
      name: loc.name
    }));

    if (type === 'origin') {
      setOriginSuggestions(airports);
      setDestinationSuggestions([]);
    } else {
      setDestinationSuggestions(airports);
      setOriginSuggestions([]);
    }
  } catch (err) {
    console.error('Erreur lors de la recherche des aéroports:', err);
    type === 'origin' ? setOriginSuggestions([]) : setDestinationSuggestions([]);
  }
};

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    if (type === 'origin') {
      setSearchTermOrigin(value);
      searchAirports(value, 'origin');
    } else {
      setSearchTermDestination(value);
      searchAirports(value, 'destination');
    }
  };

  const handleSuggestionSelect = (airport, type) => {
    if (type === 'origin') {
      setOrigin(airport.iata_code);
      setSearchTermOrigin(airport.name);
      setOriginSuggestions([]);
    } else {
      setDestination(airport.iata_code);
      setSearchTermDestination(airport.name);
      setDestinationSuggestions([]);
    }
    setActiveInput(null);
  };

  const [airportNames, setAirportNames] = useState({});
  const [airlineNames, setAirlineNames] = useState({});

  const fetchAirportNames = async (iataCodes) => {
    const names = {};
    for (const code of iataCodes) {
      names[code] = await getAirportName(code);
    }
    setAirportNames(names);
  };

  const fetchAirlineNames = async (iataCodes) => {
    const names = {};
    for (const code of iataCodes) {
      names[code] = await getAirlineName(code);
    }
    setAirlineNames(names);
  };

  useEffect(() => {
    const iataCodes = flights.flatMap(flight => [
      flight.itineraries[0].segments[0].departure.iataCode,
      flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
    ]);
    fetchAirportNames(iataCodes);

    const airlineCodes = flights.flatMap(flight => flight.validatingAirlineCodes);
    fetchAirlineNames(airlineCodes);
  }, [flights]);

  const getNumberOfStops = (segments) => {
    const stops = segments.length - 1;
    return stops === 0 ? 'Sans escales' : `${stops} escale(s)`;
  };

  const generateStopPoints = (stops) => {
    const points = [];
    for (let i = 1; i <= stops; i++) {
      points.push(<div key={i} className="stop" style={{ left: `${(i / (stops + 1)) * 100}%` }}></div>);
    }
    return points;
  };

  // Fonction pour ouvrir la modale avec le vol sélectionné
  const handleAddToListClick = (flight) => {
    setSelectedFlight(flight);
    setModalOpen(true);
  };

  return (
    <div className="search-container">
      <h1>Rechercher des vols</h1>
      <div className="filters-section">
        <div className="filters-left">
          <div className="trip-type-selector">
            <label>
              <input
                type="radio"
                value="oneWay"
                checked={tripType === 'oneWay'}
                onChange={(e) => setTripType(e.target.value)}
              />
              Aller simple
            </label>
            <label>
              <input
                type="radio"
                value="roundTrip"
                checked={tripType === 'roundTrip'}
                onChange={(e) => setTripType(e.target.value)}
              />
              Aller-retour
            </label>
          </div>
        </div>

        <div className="filters-right">
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="travel-class-select"
          >
            <option value="ECONOMY">Économique</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Affaires</option>
            <option value="FIRST">Première classe</option>
          </select>

          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Prix maximum"
            className="max-price-input"
            min="0"
          />
        </div>
      </div>

      <div className="search-form">
        <div className="input-container">
        <input
          type="text"
          value={searchTermOrigin}
          onChange={(e) => handleInputChange(e, 'origin')}
          onFocus={() => setActiveInput('origin')}
          placeholder="Départ"
          className={activeInput === 'origin' ? 'active' : ''}
        />
          {activeInput === 'origin' && originSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {originSuggestions.map((airport) => (
                <li
                  key={airport.iata_code}
                  onClick={() => handleSuggestionSelect(airport, 'origin')}
                  className="suggestion-item"
                >
                  <div className="airport-name">{airport.name}</div>
                  <div className="airport-code">{airport.iata_code}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="input-container">
        <input
          type="text"
          value={searchTermDestination}
          onChange={(e) => handleInputChange(e, 'destination')}
          onFocus={() => setActiveInput('destination')}
          placeholder="Destination"
          className={activeInput === 'destination' ? 'active' : ''}
        />
          {activeInput === 'destination' && destinationSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {destinationSuggestions.map((airport) => (
                <li
                  key={airport.iata_code}
                  onClick={() => handleSuggestionSelect(airport, 'destination')}
                  className="suggestion-item"
                >
                  <div className="airport-name">{airport.name}</div>
                  <div className="airport-code">{airport.iata_code}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />

        {tripType === 'roundTrip' && (
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate}
          />
        )}

        <button onClick={fetchFlights} disabled={loading}>
          {loading ? 'Chargement...' : 'Rechercher'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="flights">
        {loading && (
          <div className="loading-bar">
            <img src={LoadingFlight} alt="Loading..." />
          </div>
        )}
        {flights.map((flight, index) => (
          <div key={index} className="flight-card">
            <div className="flight-main-content">
              <div className="flight-times-section">
                <div className="time-container">
                  <span className="time">
                    {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className="connection-line">
                    {generateStopPoints(flight.itineraries[0].segments.length - 1)}
                  </div>
                  <span className="time">
                    {new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length-1].arrival.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="airports-code">
                  <span>{airportNames[flight.itineraries[0].segments[0].departure.iataCode] || flight.itineraries[0].segments[0].departure.iataCode}</span> ({flight.itineraries[0].segments[0].departure.iataCode}) - <span>{airportNames[flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode] || flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}</span> ({flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode})
                </div>
                <div className="airline">
                  {airlineNames[flight.validatingAirlineCodes[0]] || flight.validatingAirlineCodes[0]}
                </div>
              </div>

              <div className="flight-duration">
                {formatDuration(flight.itineraries[0].duration)} • {getNumberOfStops(flight.itineraries[0].segments)}
              </div>
              <div className="price-section">
                <div className="price">
                  {flight.price.grandTotal} $ {flight.price.currency}
                </div>
                <div className="trip-type-label">
                  {tripType === 'oneWay' ? 'Aller simple' : 'Aller-retour'}
                </div>
              </div>
            </div>

            <div className="card-divider"></div>
            <div className="button-container">
              <button className="details-toggle" onClick={() => toggleDetails(index)}>
                {openDetails[index] ? 'Masquer les détails' : 'Voir les détails'}
              </button>
              {user && (
                <button 
                  className="add-to-list-btn"
                  onClick={() => handleAddToListClick(flight)}
                >
                  Ajouter à ma liste
                </button>
              )}
            </div>

            {openDetails[index] && (
              <div className="flight-details">
                {flight.itineraries.map((itinerary, i) => (
                  <div key={i} className="itinerary">
                    <h4>{i === 0 ? 'Aller' : 'Retour'}</h4>
                    {itinerary.segments.map((segment, j) => (
                      <div key={j} className="segment">
                        <p>
                          <strong>{segment.departure.iataCode}</strong> →{' '}
                          <strong>{segment.arrival.iataCode}</strong>
                        </p>
                        <p>Départ : {new Date(segment.departure.at).toLocaleString()}</p>
                        <p>Arrivée : {new Date(segment.arrival.at).toLocaleString()}</p>
                        <p>Compagnie : {segment.carrierCode}</p>
                        <p>Vol : {segment.number}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && selectedFlight && (
        <AddToListModal 
          item={{ type: "flight", data: selectedFlight }} 
          onClose={() => { setModalOpen(false); setSelectedFlight(null); }} 
        />
      )}
    </div>
  );
}

export default FlightsPage;
