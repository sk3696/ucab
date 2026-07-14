import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import GoogleMapComponent from '../components/GoogleMapComponent';
import LiveBackground from '../components/LiveBackground';
import { 
  MapPin, Navigation, Car, CreditCard, Clock, 
  LifeBuoy, ChevronRight, AlertCircle, CheckCircle, Ticket, Printer, Smartphone, DollarSign, Locate, PlayCircle, Loader2, ArrowRight, Search 
} from 'lucide-react';
import translations from '../utils/translations';

// Predefined database representing Google Maps Places Autocomplete suggestions for Andhra Pradesh
const MOCK_GOOGLE_PLACES = [
  // Vijayawada
  { name: "Benz Circle, Vijayawada", address: "MG Road, Benz Circle, Vijayawada, AP", lat: 16.5000, lng: 80.6499 },
  { name: "Vijayawada Junction Railway Station", address: "Station Road, Hanumanpet, Vijayawada, AP", lat: 16.5165, lng: 80.6200 },
  { name: "RTC Central Bus Station, Vijayawada", address: "Governorpet, Vijayawada, AP", lat: 16.5100, lng: 80.6280 },
  { name: "PVP Square Mall, Vijayawada", address: "MG Road, Labbipet, Vijayawada, AP", lat: 16.5065, lng: 80.6380 },
  { name: "Kanaka Durga Temple, Vijayawada", address: "Indrakeeladri Mall Road, Vijayawada, AP", lat: 16.5150, lng: 80.6050 },
  { name: "Gollapudi One Center, Vijayawada", address: "Gollapudi Bypass Road, Vijayawada, AP", lat: 16.5390, lng: 80.5790 },

  // Visakhapatnam
  { name: "Dwaraka Nagar, Visakhapatnam", address: "Dwaraka Nagar Main Rd, Vizag, AP", lat: 17.7262, lng: 83.3100 },
  { name: "Visakhapatnam Railway Station", address: "Gnanapuram, Visakhapatnam, AP", lat: 17.7289, lng: 83.2980 },
  { name: "RTC Complex, Visakhapatnam", address: "Dwaraka Nagar, Vizag, AP", lat: 17.7275, lng: 83.3080 },
  { name: "RK Beach (Ramakrishna Beach), Visakhapatnam", address: "Beach Road, Visakhapatnam, AP", lat: 17.7144, lng: 83.3230 },
  { name: "Gajuwaka Junction, Visakhapatnam", address: "Gajuwaka Center, Visakhapatnam, AP", lat: 17.6890, lng: 83.2080 },
  { name: "Rushikonda Beach, Visakhapatnam", address: "Rushikonda Beach Road, Visakhapatnam, AP", lat: 17.7815, lng: 83.3850 },

  // Guntur
  { name: "Broadipet, Guntur", address: "Broadipet Main Rd, Guntur, AP", lat: 16.3115, lng: 80.4420 },
  { name: "Guntur Railway Station", address: "East Guntur, AP", lat: 16.2990, lng: 80.4500 },
  { name: "RTC Bus Stand, Guntur", address: "Guntur NTR Bus Station, AP", lat: 16.3020, lng: 80.4440 },
  { name: "Gorantla Area, Guntur", address: "Gorantla Highway Junction, Guntur, AP", lat: 16.3260, lng: 80.4120 },

  // Kakinada
  { name: "Kakinada Port", address: "Port Area, Kakinada, AP", lat: 16.9890, lng: 82.2470 },
  { name: "Kakinada Town Railway Station", address: "Railway Station Road, Kakinada, AP", lat: 16.9602, lng: 82.2360 },
  { name: "Kakinada RTC Complex", address: "Main Road, Kakinada Center, AP", lat: 16.9585, lng: 82.2395 },
  { name: "SRMT Mall & Multiplex, Kakinada", address: "Ramanayyapeta, Kakinada, AP", lat: 16.9740, lng: 82.2370 },
  { name: "Bhanugudi Junction, Kakinada", address: "Bhanugudi Main Circle, Kakinada, AP", lat: 16.9670, lng: 82.2350 },
  { name: "JNTUK College of Engineering, Kakinada", address: "Pithapuram Road, Kakinada, AP", lat: 16.9775, lng: 82.2425 },

  // Rajahmundry
  { name: "Rajahmundry Pushkar Ghat", address: "Godavari River Road, Rajahmundry, AP", lat: 17.0010, lng: 81.7770 },
  { name: "Rajahmundry Railway Station", address: "Railway Station Rd, Rajahmundry, AP", lat: 16.9915, lng: 81.7850 },
  { name: "Kotipalli Bus Stand, Rajahmundry", address: "Kotipalli Road, Rajahmundry, AP", lat: 16.9980, lng: 81.7820 },
  { name: "Morampudi Junction, Rajahmundry", address: "Morampudi Highway Circle, Rajahmundry, AP", lat: 17.0180, lng: 81.8040 },

  // Tirupati
  { name: "Tirumala Hill Temple, Tirupati", address: "Tirumala Hills, Tirupati, AP", lat: 13.6780, lng: 79.3500 },
  { name: "Tirupati Junction Railway Station", address: "Tirupati Center, AP", lat: 13.6268, lng: 79.4120 },
  { name: "Alipiri Bus Station, Tirupati", address: "Alipiri Toll Gate Road, Tirupati, AP", lat: 13.6550, lng: 79.4020 },

  // Nellore
  { name: "Nellore RTC Bus Stand", address: "Nellore RTC Colony, Nellore, AP", lat: 14.4480, lng: 79.9820 },
  { name: "Nellore Railway Station", address: "Station Rd, Nellore, AP", lat: 14.4530, lng: 79.9880 },

  // Eluru
  { name: "Eluru Old Bus Stand", address: "Eluru Town Center, AP", lat: 16.7110, lng: 81.1040 },
  { name: "Eluru Railway Station", address: "Railway Colony, Eluru, AP", lat: 16.7180, lng: 81.1220 }
];

export const UserDashboard = () => {
  const { user, language } = useAuth();
  const [activeTab, setActiveTab] = useState('book');
  
  // Geolocation & Address States
  const [userLocation, setUserLocation] = useState(null); // { name, address, lat, lng }
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationStep, setLocationStep] = useState('prompt'); // 'prompt', 'requesting', 'success', 'failed'
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  
  // Google Maps Autocomplete Collaboration Widget
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null); // { name, address, lat, lng }
  const [showGoogleDropdown, setShowGoogleDropdown] = useState(false);
  
  const [vehicleType, setVehicleType] = useState('economy');
  
  // Estimations
  const [estimates, setEstimates] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [distance, setDistance] = useState(0);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  // Active Ride Info
  const [activeRide, setActiveRide] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [rideLoading, setRideLoading] = useState(true);
  const [driverMessage, setDriverMessage] = useState('');

  // Matchmaking Simulation Timer
  const [isMatching, setIsMatching] = useState(false);
  const [matchingTimer, setMatchingTimer] = useState(15);
  const [totalMatchDuration, setTotalMatchDuration] = useState(15);

  // Checkout auto countdown
  const [paymentCountdown, setPaymentCountdown] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [upiStep, setUpiStep] = useState('qr');
  const [receipt, setReceipt] = useState(null);
  
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // History & Support
  const [history, setHistory] = useState([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportSuccess, setSupportSuccess] = useState(false);
  
  const [error, setError] = useState('');
  const t = translations[language];
  
  // Simulation refs
  const rideProgressIntervalRef = useRef(null);
  const matchingIntervalRef = useRef(null);
  const checkoutIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch human-readable city/road name via OpenStreetMap Nominatim with dynamic language parameter
  const getReadableAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&accept-language=${language}`
      );
      const data = await response.json();
      const address = data.address;
      
      const city = address.city || address.town || address.village || address.suburb || 'Vijayawada';
      const state = address.state || 'Andhra Pradesh';
      return {
        city,
        fullAddress: `${city}, ${state}`
      };
    } catch (err) {
      console.warn('Nominatim rate-limit. Defaulting.');
      return {
        city: language === 'en' ? 'Vijayawada' : 'విజయవాడ',
        fullAddress: language === 'en' ? 'Vijayawada, Andhra Pradesh' : 'విజయవాడ, ఆంధ్రప్రదేశ్'
      };
    }
  };

  // First Access User Location
  const requestLocationAccess = () => {
    setLocationStep('requesting');
    setLocatingUser(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStep('failed');
      setLocatingUser(false);
      fallbackToDefaultLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locDetails = await getReadableAddress(latitude, longitude);
        
        const resolvedLocation = {
          name: `📍 ${language === 'en' ? 'Current Location' : 'ప్రస్తుత ప్రదేశం'} (${locDetails.city})`,
          address: locDetails.fullAddress,
          lat: latitude,
          lng: longitude
        };

        setUserLocation(resolvedLocation);
        setLocationStep('success');
        setLocatingUser(false);

        // Prepopulate search suggestion fields
        setGoogleSearchQuery(MOCK_GOOGLE_PLACES[0].name);
        setSelectedDestination(MOCK_GOOGLE_PLACES[0]);
      },
      (err) => {
        console.warn('Geolocation blocked. Falling back.');
        setError('Location permission denied. Falling back.');
        setLocationStep('failed');
        setLocatingUser(false);
        fallbackToDefaultLocation();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const generateSuggestions = async (cityName, lat, lng) => {
    // Standard mock landmarks as fallbacks
    const fallbackSuggested = [
      { name: `📍 ${cityName} Railway Station`, address: `${cityName} Station Road`, lat: lat + 0.012, lng: lng - 0.010 },
      { name: `📍 ${cityName} Bus Stand`, address: `${cityName} Bus Depot Road`, lat: lat - 0.008, lng: lng + 0.014 },
      { name: `📍 ${cityName} Shopping Mall`, address: `${cityName} Mall Street`, lat: lat + 0.006, lng: lng + 0.008 }
    ];
    setDestinationSuggestions(fallbackSuggested);

    try {
      const queryLanguage = language === 'en' ? 'en' : 'te';
      const cleanCity = cityName.replace(/📍/g, '').trim().split(' ')[0];
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=villages+near+${encodeURIComponent(cleanCity)}&limit=8&accept-language=${queryLanguage}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const resolved = data.map(item => {
          const namePart = item.display_name.split(',')[0];
          return {
            name: `📍 ${namePart}`,
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
        setDestinationSuggestions([...fallbackSuggested, ...resolved]);
      }
    } catch (err) {
      console.warn('Failed to fetch nearby villages dynamically, using landmarks fallback', err);
    }
  };

  // Sync suggestion landmarks and villages whenever userLocation updates
  useEffect(() => {
    if (userLocation && userLocation.lat) {
      const addressParts = userLocation.address.split(',');
      const cityName = userLocation.name.includes('(')
        ? userLocation.name.split('(')[1].replace(')', '')
        : addressParts[0] || 'Vijayawada';
      generateSuggestions(cityName, userLocation.lat, userLocation.lng);
    }
  }, [userLocation, language]);

  // Fallback default coordinates (Vijayawada)
  const fallbackToDefaultLocation = () => {
    const defaultLoc = {
      name: `📍 ${language === 'en' ? 'Default Location (Vijayawada)' : 'డిఫాల్ట్ ప్రదేశం (విజయవాడ)'}`,
      address: 'Vijayawada Center, Andhra Pradesh',
      lat: 16.5062,
      lng: 80.6480
    };
    setUserLocation(defaultLoc);
    setGoogleSearchQuery(MOCK_GOOGLE_PLACES[0].name);
    setSelectedDestination(MOCK_GOOGLE_PLACES[0]);
  };

  // Click on map directly to drop destination pin coordinates
  const handleMapClick = async (lat, lng) => {
    if (activeRide || isMatching) return;
    try {
      setSelectedDestination({
        name: `📍 ${language === 'en' ? 'Dropped Pin' : 'డ్రాప్ చేసిన పిన్'}`,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat,
        lng
      });
      setGoogleSearchQuery(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      const locDetails = await getReadableAddress(lat, lng);
      const nameLabel = `📍 ${language === 'en' ? 'Dropped Pin' : 'డ్రాప్ చేసిన పిన్'} (${locDetails.city})`;
      
      setSelectedDestination({
        name: nameLabel,
        address: locDetails.fullAddress,
        lat,
        lng
      });
      setGoogleSearchQuery(locDetails.fullAddress);
    } catch (err) {
      console.error('Dropped pin geocoding error', err);
    }
  };

  // Handle Google Maps Autocomplete Search input changes
  const handleGoogleSearchChange = (e) => {
    const val = e.target.value;
    setGoogleSearchQuery(val);
    if (!val) {
      setGoogleSuggestions([]);
      setShowGoogleDropdown(false);
      return;
    }

    // 1. Instant mock suggestions
    const filtered = MOCK_GOOGLE_PLACES.filter(place => 
      place.name.toLowerCase().includes(val.toLowerCase()) || 
      place.address.toLowerCase().includes(val.toLowerCase())
    );
    setGoogleSuggestions(filtered);
    setShowGoogleDropdown(true);

    // Clear previous timeout to debounce the fetch
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 2. Fetch live global coordinates from Nominatim (debounced by 450ms)
    if (val.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const queryLanguage = language === 'en' ? 'en' : 'te';
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=8&accept-language=${queryLanguage}`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const resolved = data.map(item => {
              const namePart = item.display_name.split(',')[0];
              return {
                name: `📍 ${namePart}`,
                address: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
              };
            });

            // Prevent duplicates
            setGoogleSuggestions(prev => {
              const combined = [...prev];
              resolved.forEach(remote => {
                if (!combined.some(local => 
                  Math.abs(local.lat - remote.lat) < 0.0001 && 
                  Math.abs(local.lng - remote.lng) < 0.0001
                )) {
                  combined.push(remote);
                }
              });
              return combined.slice(0, 10);
            });
          }
        } catch (err) {
          console.warn('Nominatim autocomplete search failed:', err);
        }
      }, 450);
    }
  };

  // Select place from Google Suggestions dropdown
  const selectGooglePlace = (place) => {
    setGoogleSearchQuery(place.name);
    setSelectedDestination(place);
    setShowGoogleDropdown(false);
  };

  // Fetch estimates when user selects destination
  const fetchEstimatesForDestination = async (dest) => {
    if (!userLocation || !dest) return;
    setLoadingEstimate(true);
    try {
      const res = await axios.post('/api/ride/estimate', {
        pickup: { address: userLocation.address, lat: userLocation.lat, lng: userLocation.lng },
        dropoff: { address: dest.address, lat: dest.lat, lng: dest.lng }
      });
      setEstimates(res.data.estimates);
      setDistance(res.data.distance);
      setNearbyDrivers(res.data.nearbyDrivers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEstimate(false);
    }
  };

  useEffect(() => {
    if (selectedDestination) {
      fetchEstimatesForDestination(selectedDestination);
    }
  }, [selectedDestination, userLocation]);

  // Request Ride (Trigger matchmaking timer)
  const handleRequestRide = async () => {
    if (!estimates || !userLocation || !selectedDestination) return;
    setError('');
    
    try {
      const fare = estimates[vehicleType];
      const res = await axios.post('/api/ride/request', {
        pickupLocation: { address: userLocation.address, lat: userLocation.lat, lng: userLocation.lng },
        dropoffLocation: { address: selectedDestination.address, lat: selectedDestination.lat, lng: selectedDestination.lng },
        fare,
        vehicleType
      });
      setActiveRide(res.data);
      
      const matchDuration = Math.floor(Math.random() * 11) + 10; // 10s to 20s
      setTotalMatchDuration(matchDuration);
      setMatchingTimer(matchDuration);
      setIsMatching(true);

      startMatchmakingTimer(res.data._id, matchDuration);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request ride');
    }
  };

  // Matchmaking timer loop
  const startMatchmakingTimer = (rideId, duration) => {
    let timeLeft = duration;
    
    matchingIntervalRef.current = setInterval(async () => {
      timeLeft -= 1;
      setMatchingTimer(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(matchingIntervalRef.current);
        matchingIntervalRef.current = null;
        setIsMatching(false);
        
        try {
          const res = await axios.put(`/api/ride/${rideId}/simulate-next`);
          setActiveRide(res.data);
          setDriverMessage(language === 'te' ? "నేను మీ రైడ్ అభ్యర్థనను అంగీకరించాను! మీ లొకేషన్‌కి వస్తున్నాను. 👍" : "Accepted your request! On my way to your pickup spot. 👍");
          
          startRideProgressionTicks(rideId);
        } catch (err) {
          console.error(err);
        }
      }
    }, 1000);
  };

  // Progress the active ride states automatically
  const startRideProgressionTicks = (rideId) => {
    let stepCount = 0;
    
    rideProgressIntervalRef.current = setInterval(async () => {
      stepCount += 1;
      try {
        const res = await axios.put(`/api/ride/${rideId}/simulate-next`);
        setActiveRide(res.data);

        if (res.data.status === 'arrived') {
          setDriverMessage(language === 'te' ? "నేను మీ పికప్ పాయింట్‌కి చేరుకున్నాను. దయచేసి లోపలికి రండి. 🚗" : "I have arrived at your pickup spot. Please step inside. 🚗");
        } else if (res.data.status === 'started') {
          setDriverMessage(language === 'te' ? "ప్రయాణం ప్రారంభమైంది. మీ గమ్యస్థానానికి వెళ్తున్నాము. 🛣️" : "Trip started. Heading to your destination now. 🛣️");
        }

        if (res.data.status === 'completed') {
          setDriverMessage('');
          clearInterval(rideProgressIntervalRef.current);
          rideProgressIntervalRef.current = null;
          
          startCheckoutCountdown(rideId);
        }
      } catch (err) {
        console.error(err);
        clearInterval(rideProgressIntervalRef.current);
      }
    }, 2500);
  };

  // 10s Auto-payment checkout countdown
  const startCheckoutCountdown = (rideId) => {
    setPaymentCountdown(10);
    setPaymentMethod('upi');
    setUpiStep('qr');

    checkoutIntervalRef.current = setInterval(() => {
      setPaymentCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(checkoutIntervalRef.current);
          checkoutIntervalRef.current = null;
          
          setUpiStep('loading');
          setTimeout(async () => {
            try {
              const res = await axios.post('/api/payment/process', {
                rideId,
                paymentMethod: 'upi'
              });
              setPaymentSuccess(true);
              fetchReceipt(rideId);
              setUpiStep('success');
            } catch (err) {
              console.error(err);
            }
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelRide = async () => {
    if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
    if (rideProgressIntervalRef.current) clearInterval(rideProgressIntervalRef.current);
    if (checkoutIntervalRef.current) clearInterval(checkoutIntervalRef.current);
    
    setIsMatching(false);
    
    if (!activeRide) return;
    try {
      await axios.put(`/api/ride/${activeRide._id}/cancel`);
      setActiveRide(null);
      setDriverProfile(null);
      setPaymentSuccess(false);
      setReceipt(null);
      setUpiStep('qr');
    } catch (err) {
      setError('Could not cancel ride');
    }
  };

  const handlePay = async (methodOverride) => {
    if (checkoutIntervalRef.current) {
      clearInterval(checkoutIntervalRef.current);
      checkoutIntervalRef.current = null;
    }
    
    if (!activeRide) return;
    const finalMethod = methodOverride || paymentMethod;
    setPaymentProcessing(true);
    try {
      const res = await axios.post('/api/payment/process', {
        rideId: activeRide._id,
        paymentMethod: finalMethod
      });
      setPaymentSuccess(true);
      fetchReceipt(activeRide._id);
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleResetDashboard = () => {
    setActiveRide(null);
    setDriverProfile(null);
    setPaymentSuccess(false);
    setReceipt(null);
    setGoogleSearchQuery('');
    setSelectedDestination(null);
    setEstimates(null);
    setDistance(0);
    setUpiStep('qr');
    setIsMatching(false);
    fetchHistory();
    if (selectedDestination) {
      fetchEstimatesForDestination(selectedDestination);
    }
  };

  const triggerUpiScanSimulation = () => {
    if (checkoutIntervalRef.current) {
      clearInterval(checkoutIntervalRef.current);
      checkoutIntervalRef.current = null;
    }
    setUpiStep('loading');
    setTimeout(() => {
      handlePay('upi');
      setUpiStep('success');
    }, 1500);
  };

  const fetchReceipt = async (rideId) => {
    try {
      const res = await axios.get(`/api/payment/receipt/${rideId}`);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetRideFlow = () => {
    setActiveRide(null);
    setDriverProfile(null);
    setPaymentSuccess(false);
    setReceipt(null);
    setUpiStep('qr');
    setIsMatching(false);
    if (selectedDestination) {
      fetchEstimatesForDestination(selectedDestination);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/ride/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    try {
      await axios.post('/api/support/ticket', {
        subject: supportSubject,
        message: supportMessage
      });
      setSupportSubject('');
      setSupportMessage('');
      setSupportSuccess(true);
      fetchTickets();
      setTimeout(() => setSupportSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/support/tickets');
      setSupportTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkActiveRidePoll = async () => {
    if (isMatching || rideProgressIntervalRef.current || checkoutIntervalRef.current) return;
    try {
      const res = await axios.get('/api/ride/active');
      if (res.data) {
        setActiveRide(res.data.ride);
        setDriverProfile(res.data.driverProfile);
        if (res.data.ride.status === 'completed' && res.data.ride.paymentStatus === 'paid') {
          fetchReceipt(res.data.ride._id);
          setPaymentSuccess(true);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch ride history when activeTab updates to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Re-trigger location translation when language toggle is clicked
  useEffect(() => {
    if (userLocation) {
      getReadableAddress(userLocation.lat, userLocation.lng).then(locDetails => {
        const resolved = {
          ...userLocation,
          name: `📍 ${language === 'en' ? 'Current Location' : 'ప్రస్తుత ప్రదేశం'} (${locDetails.city})`,
          address: locDetails.fullAddress
        };
        setUserLocation(resolved);
      });
    }
  }, [language]);

  useEffect(() => {
    requestLocationAccess();
    fetchHistory();
    
    const interval = setInterval(checkActiveRidePoll, 4000);
    return () => {
      clearInterval(interval);
      if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
      if (rideProgressIntervalRef.current) clearInterval(rideProgressIntervalRef.current);
      if (checkoutIntervalRef.current) clearInterval(checkoutIntervalRef.current);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      
      {/* Live Animated Road Sync Background (Headlights glow at night, parallax trees) */}
      <LiveBackground selectedType={activeRide ? activeRide.vehicleType : vehicleType} />

      <div className="main-content" style={{ paddingBottom: '180px' }}>
        
        {/* TAB NAVIGATION PANEL */}
        <div className="glass-panel" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('book')} 
            className={`btn ${activeTab === 'book' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Car size={16} /> {t.reqRide}
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Clock size={16} /> {t.rideHistory}
          </button>
          <button 
            onClick={() => setActiveTab('support')} 
            className={`btn ${activeTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <LifeBuoy size={16} /> {t.supportHelp}
          </button>
        </div>

        {/* TAB 1: BOOKING & RIDE FLOW */}
        {activeTab === 'book' && (
          <div style={{ position: 'relative', width: '100%' }}>
            
            {/* STAGE A: PROMPT GEOLOCATION ACCESS BEFORE BOOKING */}
            {locationStep === 'requesting' && (
              <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', borderLeft: '4px solid var(--primary)' }}>
                <Loader2 size={38} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>{language === 'en' ? 'Accessing Your Location...' : 'మీ స్థానాన్ని గుర్తిస్తోంది...'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {language === 'en' ? 'Please click "Allow" on your browser prompt to sync your coordinates.' : 'దయచేసి మీ బ్రౌజర్ లో లొకేషన్ అనుమతిని క్లిక్ చేయండి.'}
                </p>
              </div>
            )}

            {locationStep === 'prompt' && (
              <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', borderLeft: '4px solid var(--primary)' }}>
                <Locate size={42} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem', animation: 'pulse 2s infinite' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>{language === 'en' ? 'Enable Location Access' : 'లొకేషన్ అనుమతించండి'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  {language === 'en' ? 'Ucab needs your location coordinates to suggest closest pickup positions.' : 'దగ్గరలోని రైడ్స్ మరియు పికప్ ప్రదేశాలను చూపించడానికి లొకేషన్ అవసరం.'}
                </p>
                <button onClick={requestLocationAccess} className="btn btn-primary">
                  {language === 'en' ? 'Detect My Location' : 'నా స్థానాన్ని గుర్తించు'}
                </button>
              </div>
            )}

            {/* STAGE B: ACTIVE MATCHMAKING PULSING RADAR PANEL */}
            {activeRide && isMatching && (
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '2.5rem', textAlign: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary-glow)', animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                    <div style={{ position: 'absolute', top: '15px', left: '15px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--primary)' }}>
                      <Car size={36} className="gradient-text" style={{ color: 'var(--primary)' }} />
                    </div>
                  </div>
                  
                  <h3 style={{ marginBottom: '0.5rem' }}>{t.findingRide}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {t.pingingDrivers}
                  </p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{t.queueTimer}</span>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{matchingTimer}s</h2>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--primary)', width: `${(matchingTimer / totalMatchDuration) * 100}%`, transition: 'width 1s linear' }} />
                    </div>
                  </div>

                  <button onClick={handleCancelRide} className="btn btn-danger" style={{ width: '100%' }}>
                    {t.cancel}
                  </button>
                </div>

                <div className="glass-panel" style={{ height: '480px', padding: '0.5rem' }}>
                  <LeafletMap pickup={activeRide.pickupLocation} dropoff={activeRide.dropoffLocation} status={activeRide.status} driverRouteIndex={activeRide.driverRouteIndex} vehicleType={activeRide.vehicleType} />
                </div>
              </div>
            )}

            {/* STAGE C: TRACKING ACTIVE RIDE FLOW (OSRM ROUTED ON ROADS, WITH UNIQUE CURVES AND Tooltips) */}
            {activeRide && !isMatching && (
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                
                {/* The Map Layout */}
                <div className="glass-panel" style={{ height: '480px', padding: '0.5rem' }}>
                  <LeafletMap 
                    pickup={activeRide.pickupLocation} 
                    dropoff={activeRide.dropoffLocation}
                    status={activeRide.status}
                    driverRouteIndex={activeRide.driverRouteIndex}
                    vehicleType={activeRide.vehicleType}
                  />
                </div>

                {/* Overlapping Info panel */}
                <div className="glass-panel success-box-anim" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <h3>{t.ongoingRideDetails}</h3>
                    <span className="badge badge-info">{activeRide.status.toUpperCase()}</span>
                  </div>

                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    
                    {/* STATUS 1: Accepted / Arrived / Started */}
                    {['accepted', 'arrived', 'started'].includes(activeRide.status) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="success-box-anim">
                          <div className="success-ring-pulse" style={{ background: 'var(--success-glow)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.assignedDriver}</span>
                            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Speedy Driver</h4>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                          <div><strong>{language === 'en' ? 'Pickup' : 'పికప్'}:</strong> <span style={{ color: 'var(--text-muted)' }}>{activeRide.pickupLocation.address}</span></div>
                          <div><strong>{language === 'en' ? 'Dropoff' : 'గమ్యస్థానం'}:</strong> <span style={{ color: 'var(--text-muted)' }}>{activeRide.dropoffLocation.address}</span></div>
                          <div style={{ marginTop: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {language === 'en' ? `Trip Distance: ${distance} km` : `ప్రయాణ దూరం: ${distance} కి.మీ.`}
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                            {activeRide.status === 'accepted' && t.statusAccepted}
                            {activeRide.status === 'arrived' && t.statusArrived}
                            {activeRide.status === 'started' && (
                              ['mini', 'economy', 'xl'].includes(activeRide.vehicleType) ?
                                t.statusStartedCar :
                                t.statusStartedBike
                            )}
                          </p>
                          <button onClick={handleCancelRide} className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }}>
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATUS 2: Completed / Payment terminal (10s Countdown auto checkout) */}
                    {activeRide.status === 'completed' && !paymentSuccess && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div 
                          style={{ 
                            background: 'rgba(0, 242, 254, 0.08)', 
                            border: '1px solid var(--primary)', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '5px', 
                            fontSize: '0.8rem',
                            textAlign: 'center'
                          }}
                        >
                          🤖 {language === 'en' ? 'Base Project Simulation Auto-Pay in:' : 'ఆటో-చెల్లింపు సమయం:'} <strong style={{ color: 'var(--primary)' }}>{paymentCountdown}s</strong>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--primary)', width: `${(paymentCountdown / 10) * 100}%`, transition: 'width 1s linear' }} />
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <CheckCircle size={30} style={{ color: 'var(--success)', margin: '0 auto 0.25rem' }} />
                          <h4>{t.tripArrivedTitle}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.paymentTerminalTitle}</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{t.totalFare}:</span>
                          <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Rs. {activeRide.fare}</strong>
                        </div>

                        {/* Payment Selector Tabs */}
                        <div style={{ display: 'flex', gap: '2px', border: '1px solid var(--border-color)', padding: '2px', borderRadius: '5px', background: 'rgba(0,0,0,0.2)' }}>
                          <button type="button" onClick={() => setPaymentMethod('card')} className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                            <CreditCard size={12} /> Card
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('upi')} className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                            <Smartphone size={12} /> UPI QR
                          </button>
                          <button type="button" onClick={() => setPaymentMethod('cash')} className={`btn ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                            <DollarSign size={12} /> Cash
                          </button>
                        </div>

                        {paymentMethod === 'card' && (
                          <form onSubmit={(e) => { e.preventDefault(); handlePay(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                              <input type="text" className="form-input" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
                            </div>
                            <div className="grid grid-2" style={{ gap: '0.5rem' }}>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry</label>
                                <input type="text" className="form-input" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} required />
                              </div>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>CVV</label>
                                <input type="password" className="form-input" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} required />
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={paymentProcessing}>
                              {paymentProcessing ? 'Processing Card...' : `${t.payBtn} Rs. ${activeRide.fare}`}
                            </button>
                          </form>
                        )}

                        {paymentMethod === 'upi' && (
                          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {upiStep === 'qr' && (
                              <>
                                <div className="qr-code-box" style={{ width: '150px', height: '150px' }}>
                                  <svg viewBox="0 0 100 100" className="qr-code-img">
                                    <rect width="100" height="100" fill="white" />
                                    <rect x="5" y="5" width="25" height="25" fill="#121829" />
                                    <rect x="10" y="10" width="15" height="15" fill="white" />
                                    <rect x="5" y="70" width="25" height="25" fill="#121829" />
                                    <rect x="10" y="75" width="15" height="15" fill="white" />
                                    <rect x="70" y="5" width="25" height="25" fill="#121829" />
                                    <rect x="75" y="10" width="15" height="15" fill="white" />
                                    <rect x="40" y="40" width="20" height="20" fill="var(--primary)" />
                                    <rect x="35" y="15" width="8" height="8" fill="#121829" />
                                    <rect x="50" y="25" width="12" height="6" fill="#121829" />
                                    <rect x="70" y="45" width="15" height="8" fill="#121829" />
                                    <rect x="45" y="70" width="8" height="15" fill="#121829" />
                                    <rect x="80" y="80" width="10" height="10" fill="#121829" />
                                  </svg>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan QR with GPay/Paytm</span>
                                <button onClick={triggerUpiScanSimulation} className="btn btn-primary" style={{ width: '100%' }}>
                                  Simulate Instant Pay
                                </button>
                              </>
                            )}

                            {upiStep === 'loading' && (
                              <div style={{ padding: '1.5rem 0' }}>
                                <div className="animate-spin" style={{ border: '3px solid rgba(255,255,255,0.05)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', margin: '0 auto 0.75rem' }} />
                                <h5>Validating Dynamic QR Scan...</h5>
                              </div>
                            )}
                          </div>
                        )}

                        {paymentMethod === 'cash' && (
                          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                              Handover Rs. {activeRide.fare} in cash to the driver.
                            </p>
                            <button onClick={() => handlePay('cash')} className="btn btn-primary" style={{ width: '100%' }} disabled={paymentProcessing}>
                              {t.confirmCash}
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                    {/* STATUS 3: Successful Receipt printable */}
                    {paymentSuccess && receipt && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="success-box-anim">
                        <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                          <div className="success-ring-pulse" style={{ background: 'var(--success-glow)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', margin: '0 auto 0.5rem' }}>
                            <CheckCircle size={28} />
                          </div>
                          <h4 style={{ color: 'var(--success)', marginTop: '0.25rem' }}>{t.paymentConfirmed}</h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TXN: {receipt.transactionId}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                            <span>{receipt.user?.name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Vehicle Type:</span>
                            <span style={{ textTransform: 'uppercase' }}>{receipt.ride?.vehicleType}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Fare Paid:</span>
                            <strong>Rs. {receipt.amount}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>
                            <Printer size={12} /> {t.printReceipt}
                          </button>
                          <button onClick={handleResetRideFlow} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem' }}>
                            {t.bookNext}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

            {/* STAGE D: MAIN BOOKING DESK SCREEN (FLOAT ON MAP BACKGROUND) */}
            {locationStep === 'success' && !activeRide && (
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                
                {/* Inputs card overlay */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div className="card-header">
                    <h3>{t.configureBooking}</h3>
                  </div>

                  <div className="card-body" style={{ position: 'relative', zIndex: 15 }}>
                    <div className="form-group">
                      <label className="form-label">{t.pickupOrigin}</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <MapPin size={18} style={{ color: 'var(--success)' }} />
                        <input
                          type="text"
                          className="form-input"
                          value={userLocation?.name || ''}
                          disabled
                          style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', opacity: 0.9 }}
                        />
                      </div>
                    </div>

                    {/* Google Maps Places Autocomplete Search Box Widget */}
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ 
                          background: 'linear-gradient(90deg, #4285F4 0%, #34A853 30%, #FBBC05 60%, #EA4335 100%)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          marginRight: '4px'
                        }}>Google Maps</span>
                        {language === 'en' ? 'Search Destination Area' : 'గమ్యస్థానాన్ని శోధించండి'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: '2.5rem', paddingRight: '5.5rem' }}
                          placeholder={language === 'en' ? "Search or click map to drop pin..." : "వెతకండి లేదా మ్యాప్‌ను క్లిక్ చేసి పిన్ చేయండి..."}
                          value={googleSearchQuery}
                          onChange={handleGoogleSearchChange}
                          onFocus={() => setShowGoogleDropdown(true)}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            alert(language === 'en' ? "Tip: You can click anywhere directly on the map to drop a destination pin!" : "చిట్కా: గమ్యస్థాన పిన్‌ను ఉంచడానికి మ్యాప్‌పై ఎక్కడైనా నేరుగా క్లిక్ చేయవచ్చు!");
                          }}
                          style={{ 
                            position: 'absolute', 
                            right: '8px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'var(--primary-glow)', 
                            border: '1px solid var(--primary)', 
                            color: 'var(--primary)', 
                            fontSize: '0.65rem', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {language === 'en' ? 'Pin Tool' : 'పిన్ టూల్'}
                        </button>
                      </div>

                      {/* Autocomplete Dropdown list */}
                      {showGoogleDropdown && googleSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                          zIndex: 99,
                          maxHeight: '220px',
                          overflowY: 'auto',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                        }}>
                          {googleSuggestions.map((place) => (
                            <div
                              key={place.name}
                              onClick={() => selectGooglePlace(place)}
                              style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                              }}
                              className="suggestion-item"
                            >
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>{place.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{place.address}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Google Suggested Destinations near coordinates */}
                    {destinationSuggestions.length > 0 && (
                      <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{t.nearbySuggestedAreas}</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {destinationSuggestions.map((d, index) => {
                            const isSelected = selectedDestination?.name === d.name;
                            return (
                              <button 
                                key={`${d.name}-${index}`} 
                                onClick={() => {
                                  setSelectedDestination(d);
                                  setGoogleSearchQuery(d.name);
                                }}
                                className="btn"
                                style={{ 
                                  padding: '0.3rem 0.5rem', 
                                  fontSize: '0.7rem', 
                                  borderRadius: '50px',
                                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                  background: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                                  color: isSelected ? '#000' : 'var(--text-muted)'
                                }}
                              >
                                {d.name.replace('📍 ', '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {loadingEstimate ? (
                      <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)' }}>
                        Fetching estimates...
                      </div>
                    ) : (
                      estimates && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>{t.selectCategory}</label>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800 }}>Distance: {distance} km</span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {/* Bike */}
                            <div onClick={() => setVehicleType('bike')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: vehicleType === 'bike' ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: vehicleType === 'bike' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <div>
                                <strong>Bike Ride</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Solo two-wheeler</span>
                              </div>
                              <strong>Rs. {estimates.bike}</strong>
                            </div>

                            {/* Scooty */}
                            <div onClick={() => setVehicleType('scooty')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: vehicleType === 'scooty' ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: vehicleType === 'scooty' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <div>
                                <strong>Scooty</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Light scooter</span>
                              </div>
                              <strong>Rs. {estimates.scooty}</strong>
                            </div>

                            {/* Mini */}
                            <div onClick={() => setVehicleType('mini')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: vehicleType === 'mini' ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: vehicleType === 'mini' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <div>
                                <strong>Mini Hatchback</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>4 Seater Hatchback</span>
                              </div>
                              <strong>Rs. {estimates.mini}</strong>
                            </div>

                            {/* Economy */}
                            <div onClick={() => setVehicleType('economy')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: vehicleType === 'economy' ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: vehicleType === 'economy' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <div>
                                <strong>Economy Sedan</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>5 Seater standard sedan</span>
                              </div>
                              <strong>Rs. {estimates.economy}</strong>
                            </div>

                            {/* XL */}
                            <div onClick={() => setVehicleType('xl')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', border: vehicleType === 'xl' ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: vehicleType === 'xl' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              <div>
                                <strong>XL SUV</strong>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>7 Seater SUV XL</span>
                              </div>
                              <strong>Rs. {estimates.xl}</strong>
                            </div>
                          </div>

                          <button 
                            onClick={handleRequestRide} 
                            className="btn btn-primary" 
                            style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.95rem' }}
                          >
                            {t.requestingRideBtn}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Map Display Card */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '520px', padding: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
                    {isMatching && <div className="matching-radar-pulse"></div>}

                    {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                      <GoogleMapComponent
                        pickup={userLocation} 
                        dropoff={selectedDestination}
                        nearbyDrivers={nearbyDrivers}
                        vehicleType={vehicleType}
                        onMapClick={handleMapClick}
                        status={activeRide?.status}
                        driverRouteIndex={activeRide?.driverRouteIndex}
                      />
                    ) : (
                      <LeafletMap 
                        pickup={userLocation} 
                        dropoff={selectedDestination}
                        nearbyDrivers={nearbyDrivers}
                        vehicleType={vehicleType}
                        onMapClick={handleMapClick}
                        language={language}
                        status={activeRide?.status}
                        driverRouteIndex={activeRide?.driverRouteIndex}
                      />
                    )}

                    {/* Floating Glassmorphic Active Driver HUD Overlay */}
                    {activeRide && (activeRide.status === 'accepted' || activeRide.status === 'arrived' || activeRide.status === 'started') && (
                      <div className="glass-panel" style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        width: '260px',
                        padding: '0.75rem 1rem',
                        zIndex: 15,
                        background: 'rgba(10, 15, 29, 0.75)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--primary)',
                        boxShadow: '0 8px 32px rgba(0, 242, 254, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {activeRide.status === 'accepted' ? (language === 'te' ? 'డ్రైవర్ వస్తున్నారు' : 'Driver Approaching') :
                             activeRide.status === 'arrived' ? (language === 'te' ? 'డ్రైవర్ వచ్చారు' : 'Driver Arrived') :
                             (language === 'te' ? 'ప్రయాణంలో ఉన్నారు' : 'In Transit')}
                          </span>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: activeRide.status === 'arrived' ? '#00e676' : 'var(--primary)',
                            boxShadow: activeRide.status === 'arrived' ? '0 0 8px #00e676' : '0 0 8px var(--primary)',
                            animation: 'pulse 1.5s infinite'
                          }}></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                            👨‍✈️
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {activeRide.driverId?.name || (language === 'te' ? 'శ్రీనివాస్ రావు' : 'Srinivas Rao')}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              ⭐ 4.9 • {activeRide.vehicleType.toUpperCase()}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '3px', color: 'var(--text-main)' }}>
                            {activeRide.driverId?.vehicleNumber || 'AP-16-MJ-9999'}
                          </div>
                        </div>

                        {driverMessage && (
                          <div style={{
                            background: 'rgba(0, 242, 254, 0.08)',
                            border: '1px solid rgba(0, 242, 254, 0.15)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.7rem',
                            color: 'var(--text-main)',
                            lineHeight: 1.3,
                            position: 'relative',
                            marginTop: '0.2rem'
                          }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800, display: 'block', marginBottom: '0.1rem' }}>
                              {language === 'te' ? 'డ్రైవర్ సందేశం:' : 'DRIVER CHAT:'}
                            </span>
                            {driverMessage}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '5px 10px', borderRadius: '5px', zIndex: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {nearbyDrivers.length} cabs nearby
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="glass-panel">
            <div className="card-header">
              <h3>{t.rideHistory}</h3>
            </div>
            <div className="card-body">
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  No completed or cancelled rides yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.map((ride) => (
                    <div 
                      key={ride._id}
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '1rem', 
                        background: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(ride.createdAt).toLocaleString()}
                        </span>
                        <span className={`badge ${
                          ride.status === 'completed' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div><strong>From:</strong> {ride.pickupLocation.address}</div>
                        <div><strong>To:</strong> {ride.dropoffLocation.address}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                        <span>Category: <strong style={{ textTransform: 'capitalize' }}>{ride.vehicleType}</strong></span>
                        <span>Driver: <strong>{ride.driver?.name || 'N/A'}</strong></span>
                        <strong style={{ color: 'var(--primary)' }}>Rs. {ride.fare}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="grid grid-2" style={{ gap: '2rem' }}>
            <div className="glass-panel">
              <div className="card-header">
                <h3>Submit a Support Ticket</h3>
              </div>
              <div className="card-body">
                {supportSuccess && (
                  <div style={{ color: 'var(--success)', background: 'var(--success-glow)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> <span>Ticket submitted successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Issue with a ride, payment error, etc." 
                      value={supportSubject} 
                      onChange={(e) => setSupportSubject(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Message Details</label>
                    <textarea 
                      className="form-input" 
                      style={{ minHeight: '120px', resize: 'vertical' }} 
                      placeholder="Provide details about your query..." 
                      value={supportMessage} 
                      onChange={(e) => setSupportMessage(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>

            <div className="glass-panel">
              <div className="card-header">
                <h3>Your Ticket Log</h3>
              </div>
              <div className="card-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {supportTickets.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    No support tickets logged.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {supportTickets.map((ticket) => (
                      <div 
                        key={ticket._id} 
                        style={{ 
                          border: '1px solid var(--border-color)', 
                          borderRadius: 'var(--radius-sm)', 
                          padding: '1rem', 
                          background: 'rgba(255,255,255,0.01)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{ticket.subject}</strong>
                          <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : 'badge-pending'}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ticket.message}</p>
                        
                        {ticket.reply && (
                          <div style={{ background: 'rgba(0, 242, 254, 0.05)', borderLeft: '3px solid var(--primary)', padding: '0.5rem 0.75rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            <strong>Admin Response:</strong> {ticket.reply}
                          </div>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '0.25rem' }}>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default UserDashboard;
