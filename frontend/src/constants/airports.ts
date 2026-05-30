// Airport full names mapping
export const AIRPORT_NAMES: Record<string, string> = {
  KUL: 'Kuala Lumpur International',
  KCH: 'Kuching International',
  SIN: 'Singapore Changi',
  BKI: 'Kota Kinabalu International',
  KBR: 'Kota Bharu Sultan Ismail Petra',
  CGK: 'Jakarta Soekarno-Hatta International',
  KTI: 'Kota Tinggi',
  AOR: 'Alor Setar Sultan Abdul Halim',
  PEN: 'Penang International',
  LHR: 'London Heathrow',
  BKK: 'Bangkok Suvarnabhumi',
  DEL: 'Delhi Indira Gandhi International',
  KTM: 'Kathmandu Tribhuvan International',
};

export function getAirportFullName(code: string): string {
  const name = AIRPORT_NAMES[code];
  return name ? `${name} (${code})` : code;
}

export function getAirportShortName(code: string): string {
  const name = AIRPORT_NAMES[code];
  return name || code;
}
