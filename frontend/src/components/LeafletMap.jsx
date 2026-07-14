import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Icons
const CAR_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00f2fe" width="36" height="36" style="filter: drop-shadow(0px 2px 4px rgba(0,242,254,0.5))">
    <rect x="3" y="11" width="18" height="6" rx="1.5" />
    <path d="M5 11l1.5-4h11L19 11" fill="none" stroke="#00f2fe" stroke-width="1.5" />
    <circle cx="7" cy="17" r="2" fill="#0a0f1d" stroke="#00f2fe" stroke-width="1.5" />
    <circle cx="17" cy="17" r="2" fill="#0a0f1d" stroke="#00f2fe" stroke-width="1.5" />
  </svg>
`;

const PICKUP_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00e676" width="28" height="28">
    <circle cx="12" cy="12" r="10" fill="#00e676" fill-opacity="0.2" stroke="#00e676" stroke-width="1.5" />
    <circle cx="12" cy="12" r="4" fill="#00e676" />
  </svg>
`;

const DROPOFF_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff1744" width="28" height="28">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="#0a0f1d" stroke-width="1" />
  </svg>
`;

const NEARBY_CAB_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffb300" width="30" height="30">
    <rect x="4" y="11" width="16" height="5" rx="1" />
    <path d="M6 11l1-3h10l1 3" fill="none" stroke="#ffb300" stroke-width="1" />
    <circle cx="7" cy="16" r="1.5" fill="#0a0f1d" stroke="#ffb300" stroke-width="1" />
    <circle cx="17" cy="16" r="1.5" fill="#0a0f1d" stroke="#ffb300" stroke-width="1" />
  </svg>
`;

export const LeafletMap = ({ pickup, dropoff, driverRouteIndex, status, nearbyDrivers = [], vehicleType = 'economy', onMapClick, language }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const nearbyMarkersRef = useRef([]);
  
  // Ref to hold the active coordinates of the OSRM road route
  const roadCoordsRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const initialLat = pickup?.lat || 16.5062;
      const initialLng = pickup?.lng || 80.6480;

      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([initialLat, initialLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Attach click event to map instance to drop destination pin
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) {
          onMapClick(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch OSRM Road routing coordinates when pickup or dropoff updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    roadCoordsRef.current = [];

    if (pickup && dropoff && pickup.lat && dropoff.lat) {
      const profile = ['bike', 'scooty'].includes((vehicleType || '').toLowerCase()) ? 'bicycle' : 'driving';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then(res => res.json())
        .then(data => {
          if (!mapInstanceRef.current) return;
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routeCoords = route.geometry.coordinates; // [[lng, lat], ...]
            const latLngs = routeCoords.map(coord => [coord[1], coord[0]]);
            roadCoordsRef.current = latLngs; // Save actual curves coordinates

            polylineRef.current = L.polyline(latLngs, {
              color: '#00f2fe',
              weight: 5,
              opacity: 0.85
            }).addTo(mapInstanceRef.current);

            const distanceKm = (route.distance / 1000).toFixed(1);
            polylineRef.current.bindTooltip(`${distanceKm} km`, {
              permanent: true,
              direction: 'center',
              className: 'route-distance-tooltip'
            }).openTooltip();

            mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40], maxZoom: 15 });
          } else {
            drawFallbackStraight();
          }
        })
        .catch(err => {
          console.warn('OSRM routing error, drawing fallback line', err);
          drawFallbackStraight();
        });
    }

    function drawFallbackStraight() {
      if (!mapInstanceRef.current) return;
      polylineRef.current = L.polyline(
        [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]],
        { color: '#00f2fe', weight: 4, opacity: 0.8, dashArray: '5, 10' }
      ).addTo(mapInstanceRef.current);
      
      const straightDist = (mapInstanceRef.current.distance([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]) / 1000).toFixed(1);
      polylineRef.current.bindTooltip(`${straightDist} km`, {
        permanent: true,
        direction: 'center',
        className: 'route-distance-tooltip'
      }).openTooltip();
    }
  }, [pickup, dropoff, vehicleType]);

  // Update Markers & moving vehicle position based on OSRM road coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old nearby drivers
    nearbyMarkersRef.current.forEach(m => map.removeLayer(m));
    nearbyMarkersRef.current = [];

    const bounds = [];

    // 1. Pickup Marker
    if (pickup && pickup.lat && pickup.lng) {
      const pickupIcon = L.divIcon({
        html: PICKUP_SVG,
        className: 'pickup-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      }
      bounds.push([pickup.lat, pickup.lng]);
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // 2. Dropoff Marker
    if (dropoff && dropoff.lat && dropoff.lng) {
      const dropoffIcon = L.divIcon({
        html: DROPOFF_SVG,
        className: 'dropoff-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], { 
          icon: dropoffIcon,
          draggable: true 
        }).addTo(map);

        // Bind tooltip to remind user they can drag it
        dropoffMarkerRef.current.bindTooltip(language === 'te' ? "గమ్యస్థానాన్ని మార్చడానికి నన్ను లాగండి" : "Drag me to change destination", {
          permanent: false,
          direction: 'top'
        });

        // Trigger onMapClick update when drag ends
        dropoffMarkerRef.current.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          if (onMapClick) {
            onMapClick(lat, lng);
          }
        });
      }
      bounds.push([dropoff.lat, dropoff.lng]);
    } else if (dropoffMarkerRef.current) {
      map.removeLayer(dropoffMarkerRef.current);
      dropoffMarkerRef.current = null;
    }

    // 3. Dynamic Moving Vehicle animation along OSRM curves and turns road path
    let vehiclePos = null;
    if (status === 'accepted' && pickup) {
      // Driver approaching: render at a slightly offset point on map
      vehiclePos = [pickup.lat + 0.002, pickup.lng + 0.002];
    } else if (status === 'arrived' && pickup) {
      vehiclePos = [pickup.lat, pickup.lng];
    } else if (status === 'started' && pickup && dropoff) {
      if (roadCoordsRef.current && roadCoordsRef.current.length > 0) {
        // Move PRECISELY along the curves and turns of the road path coordinates!
        const t = Math.min((driverRouteIndex || 0) / 30, 1);
        const idx = Math.floor(t * (roadCoordsRef.current.length - 1));
        vehiclePos = roadCoordsRef.current[idx];
      } else {
        // Fallback to straight line linear interpolation if OSRM is not loaded yet
        const t = Math.min((driverRouteIndex || 0) / 30, 1);
        vehiclePos = [
          pickup.lat + (dropoff.lat - pickup.lat) * t,
          pickup.lng + (dropoff.lng - pickup.lng) * t
        ];
      }
    } else if (status === 'completed' && dropoff) {
      vehiclePos = [dropoff.lat, dropoff.lng];
    }

    if (vehiclePos) {
      const carIcon = L.divIcon({
        html: CAR_SVG,
        className: 'active-driver-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(vehiclePos);
      } else {
        driverMarkerRef.current = L.marker(vehiclePos, { icon: carIcon }).addTo(map);
      }
      bounds.push(vehiclePos);
    } else if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
      driverMarkerRef.current = null;
    }

    // 4. Nearby Drivers (only shown when there is no active driver)
    if (!status && nearbyDrivers.length > 0) {
      const cabIcon = L.divIcon({
        html: NEARBY_CAB_SVG,
        className: 'nearby-driver-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      nearbyDrivers.forEach(d => {
        if (d.currentLocation && d.currentLocation.lat) {
          const marker = L.marker([d.currentLocation.lat, d.currentLocation.lng], { icon: cabIcon })
            .addTo(map)
            .bindPopup(`<b>${d.name}</b><br/>${d.vehicleModel}<br/>Type: ${d.vehicleType.toUpperCase()}`);
          nearbyMarkersRef.current.push(marker);
          bounds.push([d.currentLocation.lat, d.currentLocation.lng]);
        }
      });
    }

    // Pan map to bounds if we aren't tracking a moving ride
    if (bounds.length > 0 && status !== 'started') {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [pickup, dropoff, driverRouteIndex, status, nearbyDrivers, vehicleType]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }} />;
};
export default LeafletMap;
