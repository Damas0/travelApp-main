import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const HotelMap = ({ latitude, longitude, name, zoom = 15 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: Number(latitude), lng: Number(longitude) },
      zoom: zoom,
    });

    new window.google.maps.Marker({
      position: { lat: Number(latitude), lng: Number(longitude) },
      map,
      title: name
    });
  }, [latitude, longitude, name, zoom]);

  return <div ref={mapRef} style={{ height: '200px', width: '100%' }} />;
};

HotelMap.propTypes = {
  latitude: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  longitude: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  name: PropTypes.string.isRequired,
  zoom: PropTypes.number
};

export default HotelMap;