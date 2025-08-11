import { useState, useEffect } from 'react';
import axios from 'axios';
import HotelMap from './HotelMap';
import './HotelsPage.css';
import Hotels from '../assets/hotels.jpg';
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AddToListModal from "./AddToListModal";
import PropTypes from 'prop-types';

const defaultHotels = [
  {
    hotelId: '1',
    name: 'Hotel A',
    distance: { value: 1.2, unit: 'km' },
    chainCode: 'HA',
    geoCode: { latitude: 48.8566, longitude: 2.3522 },
    iataCode: 'CDG',
    address: { countryCode: 'FR' }
  },
  {
    hotelId: '2',
    name: 'Hotel B',
    distance: { value: 2.5, unit: 'km' },
    chainCode: 'HB',
    geoCode: { latitude: 40.7128, longitude: -74.0060 },
    iataCode: 'JFK',
    address: { countryCode: 'US' }
  },
  {
    hotelId: '3',
    name: 'Hotel C',
    distance: { value: 3.0, unit: 'km' },
    chainCode: 'HC',
    geoCode: { latitude: 34.0522, longitude: -118.2437 },
    iataCode: 'LAX',
    address: { countryCode: 'US' }
  },
  {
    hotelId: '4',
    name: 'Hotel D',
    distance: { value: 4.5, unit: 'km' },
    chainCode: 'HD',
    geoCode: { latitude: 51.5074, longitude: -0.1278 },
    iataCode: 'LHR',
    address: { countryCode: 'GB' }
  },
  {
    hotelId: '5',
    name: 'Hotel E',
    distance: { value: 5.0, unit: 'km' },
    chainCode: 'HE',
    geoCode: { latitude: 35.6895, longitude: 139.6917 },
    iataCode: 'NRT',
    address: { countryCode: 'JP' }
  },
  {
    hotelId: '6',
    name: 'Hotel F',
    distance: { value: 6.0, unit: 'km' },
    chainCode: 'HF',
    geoCode: { latitude: -33.8688, longitude: 151.2093 },
    iataCode: 'SYD',
    address: { countryCode: 'AU' }
  }
];

function HotelsPage() {
  const [cityCode, setCityCode] = useState('');
  const [radius, setRadius] = useState('');
  const [hotels, setHotels] = useState(defaultHotels);
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [user, setUser] = useState(null);
  // Ajouter ces états au début du composant HotelsPage
  const [searchTerm, setSearchTerm] = useState('');
  const [airports, setAirports] = useState([]);
  
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400 ms

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      searchAirports(debouncedSearchTerm);
    } else {
      setAirports([]);
    }
  }, [debouncedSearchTerm]);

const searchAirports = async (query) => {
  if (query.length < 2) {
    setAirports([]);
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

    setAirports(
      response.data.data.map(loc => ({
        iata_code: loc.iataCode,
        name: loc.name,
        coordinates: loc.geoCode
      }))
    );
  } catch (err) {
    console.error('Erreur lors de la recherche des aéroports:', err);
    setAirports([]);
  }
};

// Gérer la sélection d'un aéroport
const handleAirportSelect = (airport) => {
  setSearchTerm(airport.name);
  setCityCode(airport.iata_code);
  setAirports([]);
};

  // États pour la modale d'ajout à la liste
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getAccessToken = async () => {
    const clientId = 'gU3FFhuh8AiqFEU7ouwVxu0MQgK37hB2';
    const clientSecret = '5HcoGXVG48VG1LuF';
    try {
      const response = await axios.post(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data.access_token;
    } catch (err) {
      throw new Error('Erreur token: ' + err.message);
    }
  };

  const searchHotels = async () => {
    setLoading(true);
    setError('');
    if (!cityCode.trim()) {
      setError("Veuillez entrer un code de ville valide.");
      setLoading(false);
      return;
    }
    if (!radius || isNaN(radius) || radius <= 0) {
      setError("Le rayon doit être un nombre positif.");
      setLoading(false);
      return;
    }
    try {
      const token = await getAccessToken();
      const formattedRatings = rating.trim() ? rating.split(',').map(r => r.trim()).join(',') : undefined;
      const response = await axios.get(
        'https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city',
        {
          params: {
            cityCode: cityCode.trim(),
            radius: parseInt(radius, 10),
            radiusUnit: 'KM',
            hotelSource: 'ALL',
            ratings: formattedRatings,
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const limitedHotels = (response.data.data || []).slice(0, 10);
      setHotels(limitedHotels);
    } catch (err) {
      setError('Erreur recherche: ' + err.message);
    }
    setLoading(false);
  };

  // Fonction pour ouvrir la modale avec l'hôtel sélectionné
  const handleAddToListClick = (hotel, e) => {
    e.stopPropagation();
    setSelectedHotel(hotel);
    setModalOpen(true);
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  RatingStars.propTypes = {
    rating: PropTypes.number.isRequired,
  };
  

  return (
    <div className="hotels-page">
      <div className="search-section">
        <h1>{"Recherche d'hôtels"}</h1>
        <div className="search-form">
        <div className="input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un aéroport"
          />
          {airports.length > 0 && (
            <ul className="suggestions-list">
              {airports.map((airport) => (
                <li
                  key={airport.iata_code}
                  onClick={() => handleAirportSelect(airport)}
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
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              placeholder="Rayon (km)"
              min="1"
              max="100"
            />
          </div>
          <div className="input-container">
            <input
              type="text"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Étoiles (ex: 3,4,5)"
            />
          </div>
          <button onClick={searchHotels} disabled={loading}>
            Rechercher
          </button>
        </div>
      </div>

      {loading && <div className="loading-bar" />}
      {error && <div className="error">{error}</div>}

      <div className="hotels-layout">
        <div className="map-container">
          <img src={Hotels} alt="Hotels" />
        </div>

        {hotels.slice(0, 2).map((hotel) => (
          <div 
            key={hotel.hotelId}
            className={`hotel-card ${selectedHotel?.hotelId === hotel.hotelId ? 'selected' : ''}`}
            onClick={() => setSelectedHotel(hotel)}
          >
            <div className="card-content">
              <div className="mini-map">
                <HotelMap
                  latitude={hotel.geoCode.latitude}
                  longitude={hotel.geoCode.longitude}
                  name={hotel.name}
                  miniMap={true}
                />
              </div>
              <div className="hotel-details">
                <h3>{hotel.name}</h3>
                <RatingStars rating={parseInt(hotel.rating) || 3} />
                <p>Distance: {hotel.distance.value} {hotel.distance.unit}</p>
                <p>Chaîne: {hotel.chainCode}</p>
                <div className="button-info-container">
                  {user && (
                    <button 
                      className="add-to-list-btn"
                      onClick={(e) => handleAddToListClick(hotel, e)}
                    >
                      Ajouter à ma liste
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="hotels-list">
          {hotels.slice(2).map((hotel) => (
            <div 
              key={hotel.hotelId}
              className={`hotel-card ${selectedHotel?.hotelId === hotel.hotelId ? 'selected' : ''}`}
              onClick={() => setSelectedHotel(hotel)}
            >
              <div className="card-content">
                <div className="mini-map">
                  <HotelMap
                    latitude={hotel.geoCode.latitude}
                    longitude={hotel.geoCode.longitude}
                    name={hotel.name}
                    miniMap={true}
                  />
                </div>
                <div className="hotel-details">
                  <h3>{hotel.name}</h3>
                  <RatingStars rating={parseInt(hotel.rating) || 3} />
                  <p>Distance: {hotel.distance.value} {hotel.distance.unit}</p>
                  <p>Chaîne: {hotel.chainCode}</p>
                  <div className="button-info-container">
                    {user && (
                      <button 
                        className="add-to-list-btn"
                        onClick={(e) => handleAddToListClick(hotel, e)}
                      >
                        Ajouter à ma liste
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && selectedHotel && (
        <AddToListModal 
          item={{ type: "hotel", data: selectedHotel }} 
          onClose={() => { setModalOpen(false); setSelectedHotel(null); }} 
        />
      )}
    </div>
  );
}

export default HotelsPage;
