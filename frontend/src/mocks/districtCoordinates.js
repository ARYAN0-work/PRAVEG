
// District-center coordinates used for the project GIS view.
// These are presentation coordinates for map pins, not parcel-level GIS data.

const COORDS = {
  "Uttar Pradesh": {
    "Agra": [27.03628, 78.06099],
    "Aligarh": [27.92935, 78.04029],
    "Ambedkar Nagar": [26.38054, 82.66436],
    "Amethi": [26.29862, 81.64944],
    "Amroha": [28.83742, 78.38771],
    "Auraiya": [26.69518, 79.46668],
    "Ayodhya": [26.63445, 81.96327],
    "Azamgarh": [26.02657, 83.0538],
    "Baghpat": [29.03652, 77.32443],
    "Bahraich": [27.65418, 81.55552],
    "Ballia": [25.8473, 84.06569],
    "Balrampur": [27.40488, 82.4232],
    "Banda": [25.32099, 80.50494],
    "Barabanki": [26.94732, 81.33466],
    "Bareilly": [28.46667, 79.45484],
    "Basti": [26.8673, 82.68822],
    "Budaun": [28.06236, 79.07722],
    "Bulandshahr": [28.32973, 77.99973],
    "Chitrakoot": [25.15247, 81.04804],
    "Etawah": [26.76857, 79.09466],
    "Fatehpur": [25.87298, 80.79888],
    "Firozabad": [27.18432, 78.53858],
    "Gautam Buddh Nagar": [28.37682, 77.55991],
    "Ghaziabad": [28.75772, 77.44571],
    "Ghazipur": [25.64047, 83.54248],
    "Gonda": [27.11853, 82.11536],
    "Gorakhpur": [26.73219, 83.34793],
    "Hamirpur": [25.74449, 79.82583],
    "Hapur": [28.72084, 77.88501],
    "Hardoi": [27.33346, 80.2136],
    "Hathras": [27.57845, 78.16313],
    "Jalaun": [26.06345, 79.3538],
    "Jaunpur": [25.77487, 82.60515],
    "Kannauj": [27.02619, 79.64041],
    "Kanpur Dehat": [26.46494, 79.92481],
    "Kanpur Nagar": [26.43094, 80.16138],
    "Kushinagar": [26.89787, 83.89558],
    "Lakhimpur Kheri": [28.0783, 80.6514],
    "Lalitpur": [24.56528, 78.63327],
    "Lucknow": [26.83556, 80.88785],
    "Maharajganj": [27.13796, 83.48342],
    "Mahoba": [25.20886, 79.41881],
    "Mainpuri": [27.18622, 79.05218],
    "Mathura": [27.56396, 77.67403],
    "Mau": [26.0041, 83.55167],
    "Meerut": [29.0251, 77.76022],
    "Moradabad": [28.88293, 78.79676],
    "Muzaffarnagar": [29.4371, 77.71649],
    "Pilibhit": [28.47767, 79.93828],
    "Pratapgarh": [25.88957, 81.87095],
    "Prayagraj": [25.32271, 81.94886],
    "Rae Bareli": [26.2487, 81.11749],
    "Rampur": [28.82405, 79.10083],
    "Sambhal": [28.47313, 78.58221],
    "Sant Kabir Nagar": [26.81953, 83.03432],
    "Shahjahanpur": [27.96426, 79.81992],
    "Shrawasti": [27.67522, 81.86823],
    "Siddharthnagar": [27.23378, 82.78765],
    "Sitapur": [27.50554, 80.87501],
    "Sonbhadra": [24.49051, 83.03122],
    "Sultanpur": [26.24489, 82.27028],
    "Unnao": [26.63536, 80.62651],
    "Varanasi": [25.37421, 82.88578],
  },
};

export function getDistrictCoords(state, district) {
  return COORDS[state]?.[district] || null;
}

export function getAllStates() {
  return Object.keys(COORDS).sort();
}

export function getDistrictsForState(state) {
  return Object.keys(COORDS[state] || {}).sort();
}
