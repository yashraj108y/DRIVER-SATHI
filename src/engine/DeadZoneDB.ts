export const DEAD_ZONES = [
  'hinjewadi phase 3',
  'hinjewadi phase 4',
  'chakan',
  'rajgurunagar',
  'alandi',
  'uruli kanchan',
  'loni kalbhor',
  'nighoje',
  'marunji',
  'maan',
  'pirangut',
  'mulshi',
  'paud',
  'lavasa',
  'ranjangaon',
  'shikrapur',
  'sanaswadi',
  'talegaon dabhade',
  'dehu road',
  'moshi outskirts',
];

export const isDeadZone = (location: string): boolean => {
  if (!location) return false;
  const lowerLoc = location.toLowerCase();
  return DEAD_ZONES.some(zone => lowerLoc.includes(zone));
};
