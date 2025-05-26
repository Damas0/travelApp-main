import { useState, useEffect } from 'react';
import axios from 'axios';
import './CarsPage.css';
import loadingCar from '../assets/LoadingCar.gif';
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import AddToListModal from "./AddToListModal";

function CarsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cars, setCars] = useState([]);
  const [searchParams, setSearchParams] = useState({
    pickUpDate: '',
    dropOffDate: '',
    pickUpTime: '10:00',
    dropOffTime: '10:00',
    maxPrice: '',
    driverAge: 30
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


  // Gestion de l'authentification et de la modale d'ajout à la liste
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const handleAirportSelect = (airport) => {
    setSelectedAirport(airport);
    setSearchTerm(airport.name);
    setAirports([]);
    // Stockage des coordonnées dans searchParams
    setSearchParams(prev => ({
      ...prev,
      pickUpLatitude: airport.coordinates.latitude,
      pickUpLongitude: airport.coordinates.longitude,
      dropOffLatitude: airport.coordinates.latitude,
      dropOffLongitude: airport.coordinates.longitude
    }));
  };

  const searchCars = async (e) => {
    e.preventDefault();
    if (!selectedAirport) {
      setError('Veuillez sélectionner un aéroport');
      return;
    }
    setLoading(true);
    
    try {
      const response = await axios.get(
        'https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals',
        {
          params: {
            pick_up_latitude: searchParams.pickUpLatitude,
            pick_up_longitude: searchParams.pickUpLongitude,
            drop_off_latitude: searchParams.dropOffLatitude,
            drop_off_longitude: searchParams.dropOffLongitude,
            pick_up_date: searchParams.pickUpDate,
            drop_off_date: searchParams.dropOffDate,
            pick_up_time: searchParams.pickUpTime,
            drop_off_time: searchParams.dropOffTime,
            driver_age: searchParams.driverAge,
            currency_code: 'CAD'
          },
          headers: {
            'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
            'x-rapidapi-key': 'a8b411d693msh9d9e6c31e4b49a3p1671fbjsn56e6211f381d'
          }
        }
      );
      
      const filteredCars = searchParams.maxPrice 
        ? response.data.data.search_results.filter(car => 
            car.pricing_info.price <= searchParams.maxPrice
          )
        : response.data.data.search_results;
      
      setCars(filteredCars);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la recherche de voitures');
      console.error(err);
    }
    setLoading(false);
  };

  // Fonction pour ouvrir la modale avec le véhicule sélectionné
  const handleAddToListClick = (car, e) => {
    e.stopPropagation();
    setSelectedCar(car);
    setModalOpen(true);
  };

  return (
    <div className="search-container">
      <h1>Location de voitures</h1>
      
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="filters-section">
            <div className="filters-left">
              <div className="trip-type-selector">
                <label>Point de location</label>
              </div>
            </div>
      
            <div className="filters-right">
              <select
                className="travel-class-select"
                value={searchParams.driverAge}
                onChange={(e) => setSearchParams({...searchParams, driverAge: e.target.value})}
              >
                <option value="30">Âge du conducteur</option>
                <option value="25">25+</option>
                <option value="30">30+</option>
                <option value="40">40+</option>
              </select>
      
              <input
                type="number"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
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
      
            <input
              type="date"
              value={searchParams.pickUpDate}
              onChange={(e) => setSearchParams({...searchParams, pickUpDate: e.target.value})}
              required
            />
      
            <input
              type="date"
              value={searchParams.dropOffDate}
              onChange={(e) => setSearchParams({...searchParams, dropOffDate: e.target.value})}
              required
            />
      
            <button 
              onClick={searchCars}
              disabled={!selectedAirport || loading}
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
      
          {loading && (
            <div className="loading-bar">
              <img src={loadingCar} alt="" />
            </div>
          )}
          
          <div className="results">
            <div className="cars-grid">
              {cars && cars.map(car => (
                <div key={car.vehicle_id} className="car-card">
                  <div className="car-image-container">
                    <img 
                      src={car.vehicle_info.image_url} 
                      alt={car.vehicle_info.v_name} 
                    />
                    <div className="supplier-badge">
                      <img 
                        src={car.supplier_info.logo_url} 
                        alt={car.supplier_info.name}
                      />
                    </div>
                  </div>
      
                  <div className="car-info">
                    <div>
                      <div className="car-header">
                        <h3 className="car-name">{car.vehicle_info.v_name}</h3>
                        {car.content?.supplier?.rating?.average && (
                          <div className="rating">
                            {car.content.supplier.rating.average}/10  
                            <span className="rating-text">
                              ({car.rating_info.no_of_ratings} avis)
                            </span>
                          </div>
                        )}
                      </div>
      
                      <div className="car-specs">
                        <span>✓ {car.vehicle_info.seats} sièges</span>
                        <span>✓ {car.vehicle_info.transmission}</span>
                        <span>✓ {car.vehicle_info.mileage}</span>
                      </div>
                    </div>
                    <div className="price-section">
                      {user && (
                        <button 
                          className="add-to-list-btn"
                          onClick={(e) => handleAddToListClick(car, e)}
                        >
                          Ajouter à ma liste
                        </button>
                      )}
                      <div className="price-container">
                        <span className="price-amount">
                          ${car.pricing_info.price}
                        </span>
                        <span className="price-currency">
                          {car.pricing_info.currency}
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
      
          {modalOpen && selectedCar && (
            <AddToListModal 
              item={{ type: "car", data: selectedCar }} 
              onClose={() => { setModalOpen(false); setSelectedCar(null); }} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default CarsPage;