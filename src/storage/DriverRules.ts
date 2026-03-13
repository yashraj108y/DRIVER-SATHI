import AsyncStorage from '@react-native-async-storage/async-storage';

export type DriverRules = {
  minFare: number;
  maxPickupKm: number;
  minRatePerKm: number;
  commissionPct: number;
  fuelType: 'cng' | 'petrol' | 'diesel' | 'ev';
  fuelCostPerUnit: number;
  voiceEnabled: boolean;
  voiceHighMatchOnly: boolean;
  compactPillMode: boolean;
  weeklyGoal: number;
  language: 'mr' | 'hi' | 'en';
  olaEnabled: boolean;
  uberEnabled: boolean;
  workMode: 'safe' | 'hardwork' | 'custom';
};

const DEFAULT_RULES: DriverRules = {
  minFare: 100,
  maxPickupKm: 2,
  minRatePerKm: 15,
  commissionPct: 22,
  fuelType: 'cng',
  fuelCostPerUnit: 90,
  voiceEnabled: true,
  voiceHighMatchOnly: false,
  compactPillMode: false,
  weeklyGoal: 5000,
  language: 'mr',
  olaEnabled: true,
  uberEnabled: true,
  workMode: 'safe',
};

const KEYS = {
  DRIVER_RULES: 'driver_rules_v1',
  TRIP_HISTORY: 'trip_history_v1',
  TODAY_STATS: 'today_stats_v1',
  ONBOARDING_COMPLETE: 'onboarding_complete_v1',
};

export const getRules = async (): Promise<DriverRules> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.DRIVER_RULES);
    return jsonValue != null ? { ...DEFAULT_RULES, ...JSON.parse(jsonValue) } : DEFAULT_RULES;
  } catch (e) {
    return DEFAULT_RULES;
  }
};

export const saveRules = async (rules: DriverRules) => {
  try {
    await AsyncStorage.setItem(KEYS.DRIVER_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save rules', e);
  }
};

export const setWorkMode = async (mode: 'safe' | 'hardwork' | 'custom') => {
  const current = await getRules();
  let updates: Partial<DriverRules> = { workMode: mode };

  if (mode === 'safe') {
    updates = { ...updates, minFare: 100, maxPickupKm: 2, minRatePerKm: 15 };
  } else if (mode === 'hardwork') {
    updates = { ...updates, minFare: 65, maxPickupKm: 5, minRatePerKm: 10 };
  }
  
  await saveRules({ ...current, ...updates });
  return await getRules();
};

export const getOnboardingStatus = async () => {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return val === 'true';
};

export const setOnboardingComplete = async () => {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
};

export const StorageKeys = KEYS;
