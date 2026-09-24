export interface MRTStation {
  name: string;
  code: string;
  line: string;
  lat: number;
  lng: number;
}

// Comprehensive Singapore MRT Stations across East-West, North-South, Circle, Downtown, North-East, and TEL
export const SINGAPORE_MRT_STATIONS: MRTStation[] = [
  // East-West Line (EWL)
  { name: 'Pasir Ris', code: 'EW1', line: 'East-West Line', lat: 1.3727, lng: 103.9493 },
  { name: 'Tampines', code: 'EW2 / DT32', line: 'East-West / Downtown Line', lat: 1.3533, lng: 103.9452 },
  { name: 'Simei', code: 'EW3', line: 'East-West Line', lat: 1.3432, lng: 103.9533 },
  { name: 'Tanah Merah', code: 'EW4', line: 'East-West Line', lat: 1.3273, lng: 103.9464 },
  { name: 'Bedok', code: 'EW5', line: 'East-West Line', lat: 1.3240, lng: 103.9300 },
  { name: 'Kembangan', code: 'EW6', line: 'East-West Line', lat: 1.3211, lng: 103.9129 },
  { name: 'Eunos', code: 'EW7', line: 'East-West Line', lat: 1.3197, lng: 103.9030 },
  { name: 'Paya Lebar', code: 'EW8 / CC9', line: 'East-West / Circle Line', lat: 1.3182, lng: 103.8931 },
  { name: 'Aljunied', code: 'EW9', line: 'East-West Line', lat: 1.3164, lng: 103.8829 },
  { name: 'Kallang', code: 'EW10', line: 'East-West Line', lat: 1.3115, lng: 103.8714 },
  { name: 'Lavender', code: 'EW11', line: 'East-West Line', lat: 1.3074, lng: 103.8629 },
  { name: 'Bugis', code: 'EW12 / DT14', line: 'East-West / Downtown Line', lat: 1.3005, lng: 103.8559 },
  { name: 'City Hall', code: 'EW13 / NS25', line: 'East-West / North-South Line', lat: 1.2931, lng: 103.8522 },
  { name: 'Raffles Place', code: 'EW14 / NS26', line: 'East-West / North-South Line', lat: 1.2841, lng: 103.8515 },
  { name: 'Tanjong Pagar', code: 'EW15', line: 'East-West Line', lat: 1.2764, lng: 103.8458 },
  { name: 'Outram Park', code: 'EW16 / NE3 / TE17', line: 'East-West / North-East / TEL', lat: 1.2804, lng: 103.8395 },
  { name: 'Tiong Bahru', code: 'EW17', line: 'East-West Line', lat: 1.2865, lng: 103.8270 },
  { name: 'Redhill', code: 'EW18', line: 'East-West Line', lat: 1.2896, lng: 103.8168 },
  { name: 'Queenstown', code: 'EW19', line: 'East-West Line', lat: 1.2949, lng: 103.8060 },
  { name: 'Commonwealth', code: 'EW20', line: 'East-West Line', lat: 1.3025, lng: 103.7983 },
  { name: 'Buona Vista', code: 'EW21 / CC22', line: 'East-West / Circle Line', lat: 1.3073, lng: 103.7900 },
  { name: 'Dover', code: 'EW22', line: 'East-West Line', lat: 1.3114, lng: 103.7786 },
  { name: 'Clementi', code: 'EW23', line: 'East-West Line', lat: 1.3152, lng: 103.7652 },
  { name: 'Jurong East', code: 'EW24 / NS1', line: 'East-West / North-South Line', lat: 1.3331, lng: 103.7423 },
  { name: 'Chinese Garden', code: 'EW25', line: 'East-West Line', lat: 1.3424, lng: 103.7326 },
  { name: 'Lakeside', code: 'EW26', line: 'East-West Line', lat: 1.3443, lng: 103.7209 },
  { name: 'Boon Lay', code: 'EW27', line: 'East-West Line', lat: 1.3386, lng: 103.7060 },
  { name: 'Pioneer', code: 'EW28', line: 'East-West Line', lat: 1.3376, lng: 103.6973 },
  { name: 'Joo Koon', code: 'EW29', line: 'East-West Line', lat: 1.3277, lng: 103.6784 },
  { name: 'Expo', code: 'CG1 / DT35', line: 'East-West / Downtown Line', lat: 1.3354, lng: 103.9617 },
  { name: 'Changi Airport', code: 'CG2', line: 'East-West Line', lat: 1.3574, lng: 103.9885 },

  // North-South Line (NSL)
  { name: 'Bukit Batok', code: 'NS2', line: 'North-South Line', lat: 1.3490, lng: 103.7496 },
  { name: 'Bukit Gombak', code: 'NS3', line: 'North-South Line', lat: 1.3587, lng: 103.7519 },
  { name: 'Choa Chu Kang', code: 'NS4', line: 'North-South Line', lat: 1.3854, lng: 103.7443 },
  { name: 'Yew Tee', code: 'NS5', line: 'North-South Line', lat: 1.3975, lng: 103.7474 },
  { name: 'Kranji', code: 'NS7', line: 'North-South Line', lat: 1.4251, lng: 103.7621 },
  { name: 'Marsiling', code: 'NS8', line: 'North-South Line', lat: 1.4326, lng: 103.7741 },
  { name: 'Woodlands', code: 'NS9 / TE2', line: 'North-South Line / TEL', lat: 1.4369, lng: 103.7865 },
  { name: 'Admiralty', code: 'NS10', line: 'North-South Line', lat: 1.4406, lng: 103.8009 },
  { name: 'Sembawang', code: 'NS11', line: 'North-South Line', lat: 1.4491, lng: 103.8201 },
  { name: 'Canberra', code: 'NS12', line: 'North-South Line', lat: 1.4431, lng: 103.8297 },
  { name: 'Yishun', code: 'NS13', line: 'North-South Line', lat: 1.4294, lng: 103.8350 },
  { name: 'Khatib', code: 'NS14', line: 'North-South Line', lat: 1.4174, lng: 103.8329 },
  { name: 'Yio Chu Kang', code: 'NS15', line: 'North-South Line', lat: 1.3817, lng: 103.8449 },
  { name: 'Ang Mo Kio', code: 'NS16', line: 'North-South Line', lat: 1.3699, lng: 103.8496 },
  { name: 'Bishan', code: 'NS17 / CC15', line: 'North-South / Circle Line', lat: 1.3508, lng: 103.8481 },
  { name: 'Braddell', code: 'NS18', line: 'North-South Line', lat: 1.3405, lng: 103.8468 },
  { name: 'Toa Payoh', code: 'NS19', line: 'North-South Line', lat: 1.3326, lng: 103.8475 },
  { name: 'Novena', code: 'NS20', line: 'North-South Line', lat: 1.3204, lng: 103.8438 },
  { name: 'Newton', code: 'NS21 / DT11', line: 'North-South / Downtown Line', lat: 1.3129, lng: 103.8379 },
  { name: 'Orchard', code: 'NS22 / TE14', line: 'North-South Line / TEL', lat: 1.3040, lng: 103.8318 },
  { name: 'Somerset', code: 'NS23', line: 'North-South Line', lat: 1.3002, lng: 103.8390 },
  { name: 'Dhoby Ghaut', code: 'NS24 / NE6 / CC1', line: 'North-South / North-East / Circle', lat: 1.2987, lng: 103.8458 },
  { name: 'Marina Bay', code: 'NS27 / TE20 / CC33', line: 'North-South / TEL / Circle', lat: 1.2764, lng: 103.8546 },
  { name: 'Marina South Pier', code: 'NS28', line: 'North-South Line', lat: 1.2662, lng: 103.8631 },

  // Downtown Line (DTL)
  { name: 'Bukit Panjang', code: 'DT1', line: 'Downtown Line', lat: 1.3787, lng: 103.7618 },
  { name: 'Cashew', code: 'DT2', line: 'Downtown Line', lat: 1.3698, lng: 103.7644 },
  { name: 'Hillview', code: 'DT3', line: 'Downtown Line', lat: 1.3623, lng: 103.7674 },
  { name: 'Beauty World', code: 'DT5', line: 'Downtown Line', lat: 1.3414, lng: 103.7758 },
  { name: 'King Albert Park', code: 'DT6', line: 'Downtown Line', lat: 1.3358, lng: 103.7832 },
  { name: 'Sixth Avenue', code: 'DT7', line: 'Downtown Line', lat: 1.3308, lng: 103.7969 },
  { name: 'Tan Kah Kee', code: 'DT8', line: 'Downtown Line', lat: 1.3259, lng: 103.8078 },
  { name: 'Botanic Gardens', code: 'DT9 / CC19', line: 'Downtown / Circle Line', lat: 1.3224, lng: 103.8160 },
  { name: 'Stevens', code: 'DT10 / TE11', line: 'Downtown Line / TEL', lat: 1.3201, lng: 103.8260 },
  { name: 'Little India', code: 'DT12 / NE7', line: 'Downtown / North-East Line', lat: 1.3068, lng: 103.8492 },
  { name: 'Rochor', code: 'DT13', line: 'Downtown Line', lat: 1.3039, lng: 103.8526 },
  { name: 'Promenade', code: 'DT15 / CC4', line: 'Downtown / Circle Line', lat: 1.2930, lng: 103.8604 },
  { name: 'Bayfront', code: 'DT16 / CE1', line: 'Downtown / Circle Line', lat: 1.2819, lng: 103.8590 },
  { name: 'Downtown', code: 'DT17', line: 'Downtown Line', lat: 1.2794, lng: 103.8528 },
  { name: 'Telok Ayer', code: 'DT18', line: 'Downtown Line', lat: 1.2822, lng: 103.8486 },
  { name: 'Chinatown', code: 'DT19 / NE4', line: 'Downtown / North-East Line', lat: 1.2844, lng: 103.8440 },
  { name: 'Fort Canning', code: 'DT20', line: 'Downtown Line', lat: 1.2925, lng: 103.8443 },
  { name: 'Bencoolen', code: 'DT21', line: 'Downtown Line', lat: 1.2989, lng: 103.8504 },
  { name: 'Jalan Besar', code: 'DT22', line: 'Downtown Line', lat: 1.3052, lng: 103.8553 },
  { name: 'Bendemeer', code: 'DT23', line: 'Downtown Line', lat: 1.3137, lng: 103.8629 },
  { name: 'Geylang Bahru', code: 'DT24', line: 'Downtown Line', lat: 1.3213, lng: 103.8716 },
  { name: 'Mattar', code: 'DT25', line: 'Downtown Line', lat: 1.3269, lng: 103.8832 },
  { name: 'MacPherson', code: 'DT26 / CC10', line: 'Downtown / Circle Line', lat: 1.3262, lng: 103.8899 },
  { name: 'Ubi', code: 'DT27', line: 'Downtown Line', lat: 1.3299, lng: 103.8993 },
  { name: 'Kaki Bukit', code: 'DT28', line: 'Downtown Line', lat: 1.3350, lng: 103.9080 },
  { name: 'Bedok North', code: 'DT29', line: 'Downtown Line', lat: 1.3347, lng: 103.9180 },
  { name: 'Bedok Reservoir', code: 'DT30', line: 'Downtown Line', lat: 1.3362, lng: 103.9329 },
  { name: 'Tampines West', code: 'DT31', line: 'Downtown Line', lat: 1.3455, lng: 103.9384 },
  { name: 'Tampines East', code: 'DT33', line: 'Downtown Line', lat: 1.3562, lng: 103.9546 },
  { name: 'Upper Changi', code: 'DT34', line: 'Downtown Line', lat: 1.3417, lng: 103.9615 },

  // North-East Line (NEL)
  { name: 'HarbourFront', code: 'NE1 / CC29', line: 'North-East / Circle Line', lat: 1.2653, lng: 103.8219 },
  { name: 'Clarke Quay', code: 'NE5', line: 'North-East Line', lat: 1.2883, lng: 103.8466 },
  { name: 'Farrer Park', code: 'NE8', line: 'North-East Line', lat: 1.3125, lng: 103.8542 },
  { name: 'Boon Keng', code: 'NE9', line: 'North-East Line', lat: 1.3194, lng: 103.8617 },
  { name: 'Potong Pasir', code: 'NE10', line: 'North-East Line', lat: 1.3314, lng: 103.8690 },
  { name: 'Woodleigh', code: 'NE11', line: 'North-East Line', lat: 1.3392, lng: 103.8708 },
  { name: 'Serangoon', code: 'NE12 / CC13', line: 'North-East / Circle Line', lat: 1.3498, lng: 103.8737 },
  { name: 'Kovan', code: 'NE13', line: 'North-East Line', lat: 1.3601, lng: 103.8850 },
  { name: 'Hougang', code: 'NE14', line: 'North-East Line', lat: 1.3713, lng: 103.8924 },
  { name: 'Buangkok', code: 'NE15', line: 'North-East Line', lat: 1.3829, lng: 103.8931 },
  { name: 'Sengkang', code: 'NE16', line: 'North-East Line', lat: 1.3917, lng: 103.8955 },
  { name: 'Punggol', code: 'NE17', line: 'North-East Line', lat: 1.4050, lng: 103.9022 },

  // Circle Line (CCL)
  { name: 'Bras Basah', code: 'CC2', line: 'Circle Line', lat: 1.2969, lng: 103.8507 },
  { name: 'Esplanade', code: 'CC3', line: 'Circle Line', lat: 1.2934, lng: 103.8553 },
  { name: 'Nicoll Highway', code: 'CC5', line: 'Circle Line', lat: 1.3001, lng: 103.8637 },
  { name: 'Stadium', code: 'CC6', line: 'Circle Line', lat: 1.3028, lng: 103.8753 },
  { name: 'Mountbatten', code: 'CC7', line: 'Circle Line', lat: 1.3063, lng: 103.8825 },
  { name: 'Dakota', code: 'CC8', line: 'Circle Line', lat: 1.3085, lng: 103.8885 },
  { name: 'Tai Seng', code: 'CC11', line: 'Circle Line', lat: 1.3353, lng: 103.8879 },
  { name: 'Bartley', code: 'CC12', line: 'Circle Line', lat: 1.3426, lng: 103.8799 },
  { name: 'Lorong Chuan', code: 'CC14', line: 'Circle Line', lat: 1.3516, lng: 103.8640 },
  { name: 'Marymount', code: 'CC16', line: 'Circle Line', lat: 1.3487, lng: 103.8394 },
  { name: 'Caldecott', code: 'CC17 / TE9', line: 'Circle Line / TEL', lat: 1.3377, lng: 103.8396 },
  { name: 'Farrer Road', code: 'CC20', line: 'Circle Line', lat: 1.3175, lng: 103.8074 },
  { name: 'Holland Village', code: 'CC21', line: 'Circle Line', lat: 1.3119, lng: 103.7961 },
  { name: 'one-north', code: 'CC23', line: 'Circle Line', lat: 1.2996, lng: 103.7874 },
  { name: 'Kent Ridge', code: 'CC24', line: 'Circle Line', lat: 1.2935, lng: 103.7845 },
  { name: 'Haw Par Villa', code: 'CC25', line: 'Circle Line', lat: 1.2826, lng: 103.7818 },
  { name: 'Pasir Panjang', code: 'CC26', line: 'Circle Line', lat: 1.2762, lng: 103.7914 },
  { name: 'Labrador Park', code: 'CC27', line: 'Circle Line', lat: 1.2722, lng: 103.8031 },
  { name: 'Telok Blangah', code: 'CC28', line: 'Circle Line', lat: 1.2707, lng: 103.8098 },

  // Thomson-East Coast Line (TEL)
  { name: 'Woodlands North', code: 'TE1', line: 'Thomson-East Coast Line', lat: 1.4482, lng: 103.7857 },
  { name: 'Woodlands South', code: 'TE3', line: 'Thomson-East Coast Line', lat: 1.4274, lng: 103.7933 },
  { name: 'Springleaf', code: 'TE4', line: 'Thomson-East Coast Line', lat: 1.3976, lng: 103.8178 },
  { name: 'Lentor', code: 'TE5', line: 'Thomson-East Coast Line', lat: 1.3855, lng: 103.8358 },
  { name: 'Mayflower', code: 'TE6', line: 'Thomson-East Coast Line', lat: 1.3714, lng: 103.8365 },
  { name: 'Bright Hill', code: 'TE7', line: 'Thomson-East Coast Line', lat: 1.3633, lng: 103.8332 },
  { name: 'Upper Thomson', code: 'TE8', line: 'Thomson-East Coast Line', lat: 1.3544, lng: 103.8329 },
  { name: 'Napier', code: 'TE12', line: 'Thomson-East Coast Line', lat: 1.3068, lng: 103.8184 },
  { name: 'Orchard Boulevard', code: 'TE13', line: 'Thomson-East Coast Line', lat: 1.3023, lng: 103.8239 },
  { name: 'Great World', code: 'TE15', line: 'Thomson-East Coast Line', lat: 1.2931, lng: 103.8319 },
  { name: 'Havelock', code: 'TE16', line: 'Thomson-East Coast Line', lat: 1.2882, lng: 103.8335 },
  { name: 'Maxwell', code: 'TE18', line: 'Thomson-East Coast Line', lat: 1.2805, lng: 103.8439 },
  { name: 'Shenton Way', code: 'TE19', line: 'Thomson-East Coast Line', lat: 1.2778, lng: 103.8504 },
  { name: 'Gardens by the Bay', code: 'TE22', line: 'Thomson-East Coast Line', lat: 1.2789, lng: 103.8672 },
  { name: 'Tanjong Rhu', code: 'TE23', line: 'Thomson-East Coast Line', lat: 1.2982, lng: 103.8735 },
  { name: 'Katong Park', code: 'TE24', line: 'Thomson-East Coast Line', lat: 1.2986, lng: 103.8872 },
  { name: 'Tanjong Katong', code: 'TE25', line: 'Thomson-East Coast Line', lat: 1.3023, lng: 103.8988 },
  { name: 'Marine Parade', code: 'TE26', line: 'Thomson-East Coast Line', lat: 1.3031, lng: 103.9056 },
  { name: 'Marine Terrace', code: 'TE27', line: 'Thomson-East Coast Line', lat: 1.3067, lng: 103.9161 },
  { name: 'Siglap', code: 'TE28', line: 'Thomson-East Coast Line', lat: 1.3113, lng: 103.9298 },
  { name: 'Bayshore', code: 'TE29', line: 'Thomson-East Coast Line', lat: 1.3175, lng: 103.9438 },
];

export interface NearestMRTResult {
  station: MRTStation;
  straightDistanceMeters: number;
  walkingMinutes: number;
}

/**
 * Calculates the exact nearest MRT station and estimated walking time (in minutes)
 * for any given latitude/longitude in Singapore.
 */
export function getNearestMRTStation(lat: number, lng: number): NearestMRTResult {
  let nearestStation = SINGAPORE_MRT_STATIONS[0];
  let minDistanceMeters = Infinity;

  for (const station of SINGAPORE_MRT_STATIONS) {
    // Equirectangular approximation for high precision in Singapore
    const dLat = (lat - station.lat) * 111000;
    const dLng = (lng - station.lng) * 110970;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestStation = station;
    }
  }

  // Realistic pedestrian footpath winding factor (~1.25x straight-line distance)
  // Average pedestrian speed ~75 meters/minute (4.5 km/h)
  const walkingRouteDistanceMeters = minDistanceMeters * 1.25;
  const walkingMinutes = Math.max(1, Math.round(walkingRouteDistanceMeters / 75));

  return {
    station: nearestStation,
    straightDistanceMeters: Math.round(minDistanceMeters),
    walkingMinutes,
  };
}
