// utils/locationUtils.js

export const calculateDistanceFrom = ({ lat, lng }) => {
  // Check if we're in the browser before accessing localStorage
  if (typeof window === 'undefined') {
    return null;
  }
  
  const stored = localStorage.getItem('guestLocation');
  if (!stored) return null;
  
  try {
    const guest = JSON.parse(stored);
    const toRad = (value) => (value * Math.PI) / 180;
  
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat - guest.lat);
    const dLng = toRad(lng - guest.lng);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(guest.lat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // distance in km
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
};