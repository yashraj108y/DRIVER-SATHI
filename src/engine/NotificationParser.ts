export interface TripDetails {
  platform: 'Ola' | 'Uber' | 'Unknown';
  pickup: string;
  drop: string;
  fare: number;
  pickupDistance: number;
  tripDistance: number;
  isParsed: boolean;
}

export const parseNotification = (text: string): TripDetails => {
  const cleanText = text.replace(/,/g, '').replace(/\n/g, ' ');

  let platform: 'Ola' | 'Uber' | 'Unknown' = 'Unknown';
  if (text.toLowerCase().includes('ola')) platform = 'Ola';
  else if (text.toLowerCase().includes('uber')) platform = 'Uber';

  let pickup = 'Unknown';
  let drop = 'Unknown';
  let fare = 0;
  let pickupDistance = 0;
  let tripDistance = 0;

  // Regex patterns
  const fareMatch = text.match(/₹\s*(\d+)/);
  if (fareMatch) fare = parseInt(fareMatch[1], 10);

  const pickupDistMatch = text.match(/(\d+(\.\d+)?)\s*km/i);
  // This might match trip distance too, need to be careful.
  // Usually pickup distance is explicitly "Pickup distance: 2.3 km" or "Your location to pickup: 4.8 km"
  
  const explicitPickupDistMatch = text.match(/(?:Pickup distance|Your location to pickup):\s*(\d+(\.\d+)?)\s*km/i);
  if (explicitPickupDistMatch) {
    pickupDistance = parseFloat(explicitPickupDistMatch[1]);
  } else if (pickupDistMatch) {
     // Fallback if context missing
    pickupDistance = parseFloat(pickupDistMatch[1]);
  }

  // Location extraction is tricky with regex alone, relying on "Pickup:" or "Trip from:"
  if (platform === 'Ola') {
    const pickupMatch = text.match(/Pickup:\s*(.*?)(?:\n|$)/);
    if (pickupMatch) pickup = pickupMatch[1].trim();
    
    const dropMatch = text.match(/Drop:\s*(.*?)(?:\n|$)/);
    if (dropMatch) drop = dropMatch[1].trim();
    
    // Check for explicit trip distance
    const tripDistMatch = text.match(/Trip:\s*(\d+(\.\d+)?)\s*km/i);
    if (tripDistMatch) tripDistance = parseFloat(tripDistMatch[1]);

  } else if (platform === 'Uber') {
    const pickupMatch = text.match(/Trip from:\s*(.*?)(?:\n|$)/);
    if (pickupMatch) pickup = pickupMatch[1].trim();

    const dropMatch = text.match(/Trip to:\s*(.*?)(?:\n|$)/);
    if (dropMatch) drop = dropMatch[1].trim();
  }

  // Fallback trip distance
  if (tripDistance === 0 && fare > 0) {
    tripDistance = parseFloat((fare / 15).toFixed(1));
  }

  return {
    platform,
    pickup,
    drop,
    fare,
    pickupDistance,
    tripDistance,
    isParsed: fare > 0
  };
};
