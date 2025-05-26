import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Paris from '../assets/paris.jpg';
import Tokyo from '../assets/tokyo.jpg';
import NewYork from '../assets/newyorkcity.jpg';
import Hawaii from '../assets/hawaii.jpg';
import Cancun from '../assets/mexique2.jpg';
import Voyage from '../assets/voyage-avion.jpg';
import Reykjavik from '../assets/iceland.jpg';
import London from '../assets/london.jpg';
import Nice from '../assets/nice.jpg';

import { FaPlane, FaHotel, FaCar, FaMapMarkerAlt, FaGlobe, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate();

    const redirectToFlights = (destination) => {
        navigate(`/flights?destination=${destination}`);
    };

    const scrollLeft = () => {
        const container = document.querySelector('.destination-scroll');
        container.scrollBy({ left: -900, behavior: 'smooth' });
    };

    const scrollRight = () => {
        const container = document.querySelector('.destination-scroll');
        container.scrollBy({ left: 900, behavior: 'smooth' });
    };

    return (
        <div className="homepage">
            {/* Bloc 1 */}
            <div className="block1">
                <div className="text-container">
                    <h1 className='title'>Trouver vols, hôtels, locations, inspirations voyages</h1>
                    <p className="description">
                        SkyHigh vous permet de trouver facilement des destinations de voyage, que ce soit pour des vols, des hôtels ou des locations de voitures. Explorez une large sélection de destinations à travers le monde, comparez les meilleures options et réservez en toute simplicité pour organiser votre voyage de rêve, que ce soit pour un séjour détente ou une aventure excitante.
                    </p>
                    <button className="find-flight-btn" onClick={() => redirectToFlights('')}>
                        Trouver un vol
                    </button>
                </div>
                <div className="image-container">
                    <img src={Voyage} alt="Travel Hero" className="hero-image" />
                </div>
            </div>

            <div className="popular-destinations">
                <h2 className="destination-title">| Destinations Populaires</h2>
                <div className="destination-scroll">
                    <button className="scroll-btn left" onClick={scrollLeft}>
                        <FaArrowLeft />
                    </button>
                    <div className="destination-card" onClick={() => redirectToFlights('PAR')}>
                        <img src={Paris} alt="Paris" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Paris</h3>
                            <p className="destination-country">France</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('TYO')}>
                        <img src={Tokyo} alt="Tokyo" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Tokyo</h3>
                            <p className="destination-country">Japon</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('JFK')}>
                        <img src={NewYork} alt="New York" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">New York</h3>
                            <p className="destination-country">USA</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('CUN')}>
                        <img src={Cancun} alt="Cancun" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Cancun</h3>
                            <p className="destination-country">Mexique</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('HNL')}>
                        <img src={Hawaii} alt="Hawaii" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Hawaii</h3>
                            <p className="destination-country">USA</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('KEF')}>
                        <img src={Reykjavik} alt="Reykjavik" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Reykjavik</h3>
                            <p className="destination-country">Iceland</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('LHR')}>
                        <img src={London} alt="London" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">London</h3>
                            <p className="destination-country">Angleterre</p>
                        </div>
                    </div>
                    <div className="destination-card" onClick={() => redirectToFlights('NCE')}>
                        <img src={Nice} alt="Nice" className="destination-image" />
                        <div className="destination-info">
                            <h3 className="destination-city">Nice</h3>
                            <p className="destination-country">France</p>
                        </div>
                    </div>
                    <button className="scroll-btn right" onClick={scrollRight}>
                        <FaArrowRight />
                    </button>
                </div>
            </div>

            {/* Bloc 3 - Services */}
            <div className="services-section">
                <h2 className="destination-title" style={{ textAlign: "left" }}>
                    <strong>| Nos Services</strong>
                </h2>
                <div className="services-grid">
                    <div className="service-item">
                        <div className="service-icon">
                            <FaPlane />
                        </div>
                        <div>
                            <h3 className="service-title">Recherche de vols</h3>
                            <p className="service-description">Trouvez rapidement les meilleurs vols en fonction de vos dates et préférences. Nous comparons les prix pour vous offrir les meilleures options à des prix compétitifs.</p>
                        </div>
                    </div>

                    <div className="service-item">
                        <div className="service-icon">
                            <FaHotel />
                        </div>
                        <div>
                            <h3 className="service-title">{"Réservation d'hôtels"}</h3>
                            <p className="service-description">{"Explorez une large gamme d'hôtels et réservez selon votre budget et vos attentes. Des informations détaillées et des avis de clients vous aident à faire un choix éclairé."}</p>
                        </div>
                    </div>

                    <div className="service-item">
                        <div className="service-icon">
                            <FaCar />
                        </div>
                        <div>
                            <h3 className="service-title">Location de voitures</h3>
                            <p className="service-description">Louez une voiture qui répond à vos besoins pour votre voyage, avec une option de personnalisation pour ajouter des services comme des sièges enfants ou un GPS, et profitez des meilleurs prix.</p>
                        </div>
                    </div>

                    <div className="service-item">
                        <div className="service-icon">
                            <FaMapMarkerAlt />
                        </div>
                        <div>
                            <h3 className="service-title">Lister ses voyages</h3>
                            <p className="service-description">Enregistrez vos services préférés pour y accéder facilement lors de la planification de votre voyage. Cette fonctionnalité vous permet de garder une trace de vos choix.</p>
                        </div>
                    </div>

                    <div className="service-item">
                        <div className="service-icon">
                            <FaGlobe />
                        </div>
                        <div>
                            <h3 className="service-title">{"Recommendations d'activités avec l'IA"}</h3>
                            <p className="service-description">{"Obtenez des recommandations d'activités sur place, basées sur votre destination, hôtel et location de voiture. Créez un programme sur mesure pour chaque aspect de votre séjour."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;