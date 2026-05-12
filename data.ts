export interface CountryEntry {
  name: string;
  region: string;
  flag: string;
  isoCode: string;                // ISO 3166-1 alpha-2 for passport-index lookup
  visaOnArrival: string[];
  visaRequired: string[];
  visaFree: string[];
  permitRequired: boolean;
  permitName?: string;
  permitCost?: string;
  permitProcessingDays?: number;
  permitNotes?: string;
  customsPorts: string[];
  cruisingFees?: string;
  typicalStay: string;
  vhfChannel?: number;
  notes: string;
  // Freshness tracking
  permitLastVerified: string;     // ISO date — when permit/cruising info was last checked
  visaLastVerified: string;       // ISO date — when visa info was last checked
  sources: string[];
}

/** How many days before we consider data stale and warn the user */
export const STALE_DAYS = 180; // ~6 months

export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function freshnessLabel(isoDate: string): { stale: boolean; label: string } {
  const days = daysSince(isoDate);
  if (days < 60) return { stale: false, label: `✅ Verified ${days} days ago` };
  if (days < STALE_DAYS) return { stale: false, label: `🟡 Verified ${days} days ago — double-check before departure` };
  return { stale: true, label: `🔴 Data is ${days} days old — verify before relying on this` };
}

export const countries: Record<string, CountryEntry> = {
  indonesia: {
    name: "Indonesia",
    region: "Southeast Asia",
    flag: "🇮🇩",
    isoCode: "ID",
    visaOnArrival: ["norwegian", "eu", "us", "australian", "uk"],
    visaRequired: [],
    visaFree: [],
    permitRequired: true,
    permitName: "CAIT (Clearance Approval for Indonesian Territory)",
    permitCost: "Free (agent fees ~$150–300 USD)",
    permitProcessingDays: 30,
    permitNotes:
      "CAIT must be arranged through a licensed Indonesian agent before arrival. " +
      "Lists specific islands/anchorages you are approved to visit — deviating is illegal. " +
      "Apply at least 30 days before arrival. Cruising permit (DUKS) also required.",
    customsPorts: ["Sabang (Weh Island)", "Batam", "Bali (Benoa)", "Kupang", "Sorong"],
    cruisingFees: "~$50–100 USD (varies by port)",
    typicalStay: "60 days, extendable to 180 days",
    vhfChannel: 16,
    notes:
      "One of the most bureaucratically complex cruising destinations. " +
      "Many cruisers use agents like Yos Marine or Ketut from Bali. " +
      "Raja Ampat requires a separate conservation fee (~$100 USD). " +
      "CAIT reform discussions ongoing — check latest rules before applying.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/indonesia", "https://www.yosmarine.com"],
  },

  french_polynesia: {
    name: "French Polynesia",
    region: "South Pacific",
    flag: "🇵🇫",
    isoCode: "PF",
    visaFree: ["eu", "norwegian", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    permitNotes:
      "No cruising permit required. A bond (caution) may be required for non-EU/EEA nationals. " +
      "EEA nationals including Norwegians are exempt.",
    customsPorts: ["Nuku Hiva (Taiohae)", "Papeete (Tahiti)", "Bora Bora", "Hiva Oa (Atuona)"],
    cruisingFees: "None",
    typicalStay: "90 days (Schengen-equivalent for non-EU); longer for EEA",
    vhfChannel: 16,
    notes:
      "One of the most popular Pacific stops. Marquesas are the first landfall from Panama. " +
      "Moorings available in many lagoons. As a Norwegian you get generous stay allowance via EEA.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/french-polynesia"],
  },

  fiji: {
    name: "Fiji",
    region: "South Pacific",
    flag: "🇫🇯",
    isoCode: "FJ",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Suva", "Lautoka", "Savusavu", "Levuka"],
    cruisingFees: "Yacht permit ~FJD 100–150 (~$45–70 USD)",
    typicalStay: "4 months, extendable",
    vhfChannel: 16,
    notes:
      "Cruising permit required for sailing outside main ports. " +
      "Savusavu is a popular first port of entry for yachts. " +
      "Village kava ceremonies (sevusevu) are an important cultural protocol.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/fiji"],
  },

  new_zealand: {
    name: "New Zealand",
    region: "South Pacific",
    flag: "🇳🇿",
    isoCode: "NZ",
    visaFree: ["norwegian", "eu", "uk"],
    visaOnArrival: ["us", "australian"],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Opua (Bay of Islands)", "Whangarei", "Auckland"],
    cruisingFees: "Biosecurity inspection fee ~NZD 400–600 (~$230–360 USD)",
    typicalStay: "9 months (Visitor Visa for Norwegians)",
    vhfChannel: 16,
    notes:
      "Pre-arrival notice required (96 hours). Strict biosecurity — all food, wood, and natural materials inspected. " +
      "Opua is the classic first port of entry. Bay of Islands is outstanding cruising ground.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/new-zealand"],
  },

  australia: {
    name: "Australia",
    region: "Southwest Pacific",
    flag: "🇦🇺",
    isoCode: "AU",
    visaFree: [],
    visaOnArrival: [],
    visaRequired: ["norwegian", "eu", "us", "uk"],
    permitRequired: false,
    customsPorts: ["Darwin", "Cairns", "Thursday Island", "Bundaberg", "Brisbane"],
    cruisingFees: "Biosecurity levy ~AUD 395 (~$250 USD)",
    typicalStay: "Up to 12 months (Tourist visa/ETA)",
    vhfChannel: 16,
    notes:
      "ETA (Electronic Travel Authority) required for Norwegians — apply online before arrival (~AUD 20). " +
      "96-hour pre-arrival notice required. Strict biosecurity similar to NZ. " +
      "Darwin is the classic entry point from SE Asia.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/australia"],
  },

  panama: {
    name: "Panama",
    region: "Central America",
    flag: "🇵🇦",
    isoCode: "PA",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Colón (Cristóbal)", "Panama City (Balboa)", "Bocas del Toro", "Las Perlas"],
    cruisingFees: "Cruising permit ~$150 USD + zarpe fees",
    typicalStay: "90 days",
    vhfChannel: 16,
    notes:
      "Panama Canal transit: ~$2,000–3,500 USD total including 4 required line handlers. " +
      "Book well in advance — wait times can be 2–3 weeks. " +
      "San Blas (Guna Yala) requires a separate cruising permit (~$20 USD).",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/panama", "https://www.pancanal.com"],
  },

  south_africa: {
    name: "South Africa",
    region: "Southern Africa",
    flag: "🇿🇦",
    isoCode: "ZA",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Cape Town", "Durban", "Port Elizabeth (Gqeberha)", "Richards Bay"],
    cruisingFees: "None significant",
    typicalStay: "90 days",
    vhfChannel: 16,
    notes:
      "Cape Town is the major hub for boats rounding the Cape of Good Hope. " +
      "Timing is critical — avoid the Cape in winter (June–August). " +
      "Strong Agulhas currents — plan carefully.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/south-africa"],
  },

  maldives: {
    name: "Maldives",
    region: "Indian Ocean",
    flag: "🇲🇻",
    isoCode: "MV",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: true,
    permitName: "Cruising Permit",
    permitCost: "~$75 USD",
    permitProcessingDays: 7,
    permitNotes:
      "Cruising permit required. Only allowed in designated cruising zones. " +
      "Many atolls are restricted — check approved anchorages carefully. " +
      "Alcohol import is strictly prohibited.",
    customsPorts: ["Male", "Uligamu (northernmost atoll)"],
    cruisingFees: "~$75 USD permit + anchorage fees",
    typicalStay: "30 days, extendable",
    vhfChannel: 16,
    notes:
      "Stunning destination but heavily regulated. " +
      "Uligamu is the preferred entry from the north. " +
      "Provisioning is expensive and limited outside Male.",
    permitLastVerified: "2024-11-01",
    visaLastVerified: "2024-11-01",
    sources: ["https://www.noonsite.com/country/maldives"],
  },
};

export const regionRoutes: Record<string, string[]> = {
  pacific_circuit: ["panama", "french_polynesia", "fiji", "new_zealand", "australia"],
  indian_ocean: ["australia", "indonesia", "maldives", "south_africa"],
  circumnavigation_west: [
    "panama", "french_polynesia", "fiji", "new_zealand",
    "australia", "indonesia", "maldives", "south_africa",
  ],
};
