// Curated from Datastructure.xlsx. The workbook currently contains Uttar Pradesh data only.
export const referenceData = {
  states: ["Uttar Pradesh"],
  projectTypes: [
    "Airport", "Expressway", "Highway", "Industrial Infrastructure",
    "Irrigation", "Metro Rail", "Urban Development", "Urban Transport",
  ],
  districts: [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya",
    "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur",
    "Banda", "Barabanki", "Bareilly", "Basti", "Budaun", "Bulandshahr",
    "Chitrakoot", "Etawah", "Fatehpur", "Firozabad", "Gautam Buddh Nagar",
    "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur",
    "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Kannauj", "Kanpur Dehat",
    "Kanpur Nagar", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow",
    "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut",
    "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj",
    "Rae Bareli", "Rampur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur",
    "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur",
    "Unnao", "Varanasi",
  ],
} as const;

export function responsivenessBand(percent: number) {
  if (percent < 20) return "Poor";
  if (percent < 40) return "Low";
  if (percent < 70) return "Moderate";
  return "High";
}
