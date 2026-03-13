import { DriverRules } from '../storage/DriverRules';

const MILEAGE = {
  cng: 20,
  petrol: 15,
  diesel: 18,
  ev: 120,
};

export const calculateProfit = (
  fare: number,
  tripDistance: number,
  pickupDistance: number,
  rules: DriverRules
) => {
  const totalDistance = tripDistance + pickupDistance;
  const commission = fare * (rules.commissionPct / 100);
  const mileage = MILEAGE[rules.fuelType];
  const fuelCost = (totalDistance / mileage) * rules.fuelCostPerUnit;
  const netProfit = fare - commission - fuelCost;
  
  return {
    commission: Math.round(commission),
    fuelCost: Math.round(fuelCost),
    netProfit: Math.round(netProfit),
    tripKm: tripDistance,
    totalKm: totalDistance
  };
};
