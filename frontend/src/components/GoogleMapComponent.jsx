import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

// Custom Map Styles: Sleek Dark Theme matching Ucab color scheme
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0a0f1d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f2fe" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1e1b4b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#312e81" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#00f2fe" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '14px',
};

export const GoogleMapComponent = ({ 
  pickup, 
  dropoff, 
  nearbyDrivers = [], 
  vehicleType = 'economy', 
  onMapClick, 
  status, 
  driverRouteIndex 
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [movingVehiclePos, setMovingVehiclePos] = useState(null);
  const routePointsRef = useRef([]);

  // Load Route Directions
  useEffect(() => {
    if (!isLoaded || !map || !pickup || !dropoff) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(pickup.lat, pickup.lng),
        destination: new window.google.maps.LatLng(dropoff.lat, dropoff.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          // Extract road points coordinates for smooth animations
          if (result.routes[0]?.overview_path) {
            routePointsRef.current = result.routes[0].overview_path.map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }));
          }
        } else {
          console.warn('Google Maps directions failed:', status);
        }
      }
    );
  }, [isLoaded, map, pickup, dropoff]);

  // Handle moving vehicle animation along the route coordinates
  useEffect(() => {
    if (status === 'accepted' && pickup) {
      setMovingVehiclePos({ lat: pickup.lat + 0.001, lng: pickup.lng + 0.001 });
    } else if (status === 'arrived' && pickup) {
      setMovingVehiclePos({ lat: pickup.lat, lng: pickup.lng });
    } else if (status === 'started' && pickup && dropoff) {
      if (routePointsRef.current && routePointsRef.current.length > 0) {
        const t = Math.min((driverRouteIndex || 0) / 30, 1);
        const idx = Math.floor(t * (routePointsRef.current.length - 1));
        setMovingVehiclePos(routePointsRef.current[idx]);
      } else {
        const t = Math.min((driverRouteIndex || 0) / 30, 1);
        setMovingVehiclePos({
          lat: pickup.lat + (dropoff.lat - pickup.lat) * t,
          lng: pickup.lng + (dropoff.lng - pickup.lng) * t
        });
      }
    } else if (status === 'completed' && dropoff) {
      setMovingVehiclePos({ lat: dropoff.lat, lng: dropoff.lng });
    } else {
      setMovingVehiclePos(null);
    }
  }, [status, driverRouteIndex, pickup, dropoff]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Loading Google Maps...
      </div>
    );
  }

  const center = pickup ? { lat: pickup.lat, lng: pickup.lng } : { lat: 16.5062, lng: 80.6480 };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
      }}
      onClick={(e) => {
        if (onMapClick) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      }}
    >
      {/* 1. Pickup Pin (Green) */}
      {pickup && (
        <Marker
          position={{ lat: pickup.lat, lng: pickup.lng }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }}
        />
      )}

      {/* 2. Draggable Destination Pin (Red) */}
      {dropoff && (
        <Marker
          position={{ lat: dropoff.lat, lng: dropoff.lng }}
          draggable={true}
          onDragEnd={(e) => {
            if (onMapClick) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }}
        />
      )}

      {/* 3. Moving Active Cab Marker (Cyan/Blue Icon) */}
      {movingVehiclePos && (
        <Marker
          position={movingVehiclePos}
          icon={{
            path: 'M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-.384-.002v11.002c0 .828-.672 1.5-1.5 1.5h-13c-.828 0-1.5-.672-1.5-1.5v-11c-.702 0-1.616-.195-1.616-.989v-.511c0-.276.224-.5.5-.5h19zm-3.5 3h-16v10h16v-10z',
            fillColor: '#00f2fe',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 1.2,
            anchor: new window.google.maps.Point(12, 12)
          }}
        />
      )}

      {/* 4. Nearby Cabs (Yellow Pins) */}
      {!status && nearbyDrivers.map((driver) => (
        <Marker
          key={driver._id}
          position={{ lat: driver.currentLocation.lat, lng: driver.currentLocation.lng }}
          title={`${driver.name} - ${driver.vehicleModel}`}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
          }}
        />
      ))}

      {/* 5. Directions Route Polyline */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#00f2fe',
              strokeOpacity: 0.8,
              strokeWeight: 5
            }
          }}
        />
      )}
    </GoogleMap>
  );
};
export default GoogleMapComponent;
