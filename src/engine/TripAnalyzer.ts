import { DriverRules } from '../storage/DriverRules';
import { TripDetails } from './NotificationParser';
import { isDeadZone } from './DeadZoneDB';

export interface AnalysisResult {
  score: number;
  verdict: 'good' | 'average' | 'bad';
  reasons: string[];
  profit: number;
}

export const analyzeTrip = (trip: TripDetails, rules: DriverRules): AnalysisResult => {
  let score = 100;
  const reasons: string[] = [];

  // Platform check
  if (trip.platform === 'Ola' && !rules.olaEnabled) {
    score -= 50;
    reasons.push('Ola disabled in settings');
  }
  if (trip.platform === 'Uber' && !rules.uberEnabled) {
    score -= 50;
    reasons.push('Uber disabled in settings');
  }

  // Min Fare check
  if (trip.fare < rules.minFare) {
    const deduction = Math.min(40, ((rules.minFare - trip.fare) / rules.minFare) * 40);
    score -= deduction;
    reasons.push(`Fare ₹${trip.fare} below min ₹${rules.minFare}`);
  }

  // Max Pickup Distance check
  if (trip.pickupDistance > rules.maxPickupKm) {
    const deduction = Math.min(35, ((trip.pickupDistance - rules.maxPickupKm) / rules.maxPickupKm) * 35);
    score -= deduction;
    reasons.push(`Pickup ${trip.pickupDistance}km too far (max ${rules.maxPickupKm}km)`);
  }

  // Rate per km check
  const ratePerKm = trip.fare / (trip.tripDistance || 1); // Avoid division by zero
  if (ratePerKm < rules.minRatePerKm) {
    const deduction = Math.min(25, ((rules.minRatePerKm - ratePerKm) / rules.minRatePerKm) * 25);
    score -= deduction;
    reasons.push(`Rate ₹${ratePerKm.toFixed(1)}/km too low (min ₹${rules.minRatePerKm}/km)`);
  }

  // Dead Zone check
  if (isDeadZone(trip.drop)) {
    score -= 20;
    reasons.push(`Drop location "${trip.drop}" is a Dead Zone`);
  }

  score = Math.max(0, Math.round(score));

  let verdict: 'good' | 'average' | 'bad';
  if (score >= 75) verdict = 'good';
  else if (score >= 45) verdict = 'average';
  else verdict = 'bad';

  return {
    score,
    verdict,
    reasons,
    profit: 0 // Calculated elsewhere
  };
};
