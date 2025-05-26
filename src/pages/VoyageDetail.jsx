import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./VoyageDetail.css";
import { FaPlane, FaHotel, FaCar, FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaClock, FaMoneyBillWave,FaUsers, FaRoad } from 'react-icons/fa';

function VoyageDetail() {
  const { id } = useParams();
  const [voyage, setVoyage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoyage = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "voyages", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVoyage({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("Voyage inexistant !");
        }
      } catch (error) {
        console.error("Erreur de récupération du voyage :", error);
      }
      setLoading(false);
    };

    fetchVoyage();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des détails...</p>
      </div>
    );
  }

  if (!voyage) {
    return (
      <div className="error-container">
        <h2>Voyage introuvable</h2>
        <Link to="/liste-voyages" className="back-link">
          <FaArrowLeft /> Retour à la liste
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="voyage-detail-container">
      <div className="voyage-header">
        <h1>{voyage.titre}</h1>
        <div className="voyage-meta">
          <span><FaMapMarkerAlt /> {voyage.destination}</span>
          <span><FaCalendar /> {formatDate(voyage.dateDepart)} - {formatDate(voyage.dateRetour)}</span>
        </div>
      </div>

      <div className="voyage-image-container">
        <img src={voyage.imageUrl} alt="Voyage" className="voyage-detail-image" />
      </div>

      {voyage.items && voyage.items.length > 0 && (
        <div className="voyage-items">
          <h2>Vos Réservations</h2>
          <div className="items-grid">
            {voyage.items.map((item, index) => (
              <div key={index} className={`item-card ${item.type}`}>
                {item.type === "flight" && (
                  <div className="item-content">
                    <div className="item-header">
                      <FaPlane className="item-icon" />
                      <h3>Vol {item.data.validatingAirlineCodes?.[0]}</h3>
                    </div>
                    <div className="flight-timeline">
                      <div className="timeline-point departure">
                        <div className="time">{formatTime(item.data.itineraries?.[0]?.segments[0]?.departure?.at)}</div>
                        <div className="location">{item.data.itineraries?.[0]?.segments[0]?.departure?.iataCode}</div>
                      </div>
                      <div className="timeline-line">
                        <span className="duration">{item.data.itineraries?.[0]?.duration?.replace('PT', '').replace('H', 'h ')}</span>
                      </div>
                      <div className="timeline-point arrival">
                        <div className="time">{formatTime(item.data.itineraries?.[0]?.segments[0]?.arrival?.at)}</div>
                        <div className="location">{item.data.itineraries?.[0]?.segments[0]?.arrival?.iataCode}</div>
                      </div>
                    </div>
                  </div>
                )}

                {item.type === "hotel" && (
                  <div className="item-content">
                    <div className="item-header">
                      <FaHotel className="item-icon" />
                      <h3>{item.data.name}</h3>
                    </div>
                    <div className="hotel-details">
                      <div className="detail-row">
                        <FaMapMarkerAlt />
                        <span>À {item.data.distance.value} {item.data.distance.unit}</span>
                      </div>
                      <div className="rating">
                        {Array(item.data.rating).fill('★').join('')}
                      </div>
                    </div>
                  </div>
                )}
            {item.type === "car" && (
              <div className="item-content car-layout">
                <div className="car-left-section">
                  <img src={item.data.vehicle_info?.image_url} alt="Vehicle" className="car-image" />
                  <div className="supplier-info">
                    <img 
                      src={item.data.supplier?.imageUrl} 
                      alt={item.data.supplier?.name} 
                      className="supplier-logo"
                    />
                    <span>{item.data.supplier?.name}</span>
                  </div>
                </div>
                <div className="car-right-section">
                  <div className="item-header">
                    <FaCar className="item-icon" />
                    <h3>{item.data.vehicle_info?.v_name}</h3>
                  </div>
                  <div className="car-details">
                    <div className="car-info">
                      <div className="detail-row">
                        <FaClock />
                        <span>{item.data.vehicle_info?.transmission}</span>
                      </div>
                      <div className="detail-row">
                        <FaMoneyBillWave />
                        <span>{item.data.pricing_info?.price} {item.data.pricing_info?.currency}</span>
                      </div>
                      {item.data.vehicle_info?.seats && (
                        <div className="detail-row">
                          <FaUsers />
                          <span>{item.data.vehicle_info.seats} sièges</span>
                        </div>
                      )}
                      {item.data.vehicle_info?.mileage && (
                        <div className="detail-row">
                          <FaRoad />
                          <span>{item.data.vehicle_info.mileage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/liste-voyages" className="back-link">
        <FaArrowLeft /> Retour à la liste
      </Link>
    </div>
  );
}

export default VoyageDetail;