export interface CountryEntry {
  name: string;
  region: string;
  flag: string;
  visaOnArrival: string[];        // nationalities that get visa on arrival
  visaRequired: string[];         // nationalities that need visa in advance
  visaFree: string[];             // nationalities that are visa-free
  permitRequired: boolean;
  permitName?: string;
  permitCost?: string;
  permitProcessingDays?: number;
  permitNotes?: string;
  customsPorts: string[];         // official ports of entry
  cruisingFees?: string;
  typicalStay: string;
  vhfChannel?: number;
  notes: string;
  lastUpdated: string;
  sources: string[];
}

export const countries: Record<string, CountryEntry> = {
  indonesia: {
    name: "Indonesia",
    region: "Southeast Asia",
    flag: "🇮🇩",
    visaOnArrival: ["norwegian", "eu", "us", "australian", "uk"],
    visaRequired: [],
    visaFree: [],
    permitRequired: true,
    permitName: "CAIT (Clearance Approval for Indonesian Territory)",
    permitCost: "Free (agent fees ~$150–300 USD)",
    permitProcessingDays: 30,
    permitNotes:
      "CAIT must be arranged through a licensed Indonesian agent before arrival. " +
      "Lists specific islands/anchorages you are approved to visit — deviating from this list is illegal. " +
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
    lastUpdated: "2024-11",
    sources: [
      "https://www.noonsite.com/country/indonesia",
      "https://www.yosmarine.com",
    ],
  },

  french_polynesia: {
    name: "French Polynesia",
    region: "South Pacific",
    flag: "🇵🇫",
    visaFree: ["eu", "norwegian", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    permitNotes:
      "No cruising permit required, but a bond (caution) may be required for non-EU/EEA nationals " +
      "equivalent to a return airfare to cover potential repatriation costs. EEA nationals including Norwegians are exempt.",
    customsPorts: ["Nuku Hiva (Taiohae)", "Papeete (Tahiti)", "Bora Bora", "Hiva Oa (Atuona)"],
    cruisingFees: "None",
    typicalStay: "90 days (Schengen-equivalent for non-EU)",
    vhfChannel: 16,
    notes:
      "One of the most popular Pacific stops. Marquesas are the first landfall from Panama. " +
      "Moorings available in many lagoons. As a Norwegian you get 90 days as part of the EEA agreement.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/french-polynesia"],
  },

  fiji: {
    name: "Fiji",
    region: "South Pacific",
    flag: "🇫🇯",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Suva", "Lautoka", "Savusavu", "Levuka"],
    cruisingFees: "Yacht permit ~FJD 100–150 (~$45–70 USD)",
    typicalStay: "4 months, extendable",
    vhfChannel: 16,
    notes:
      "Cruising permit required for sailing outside the main ports. " +
      "Savusavu is a popular first port of entry for yachts. " +
      "The Yasawa and Mamanuca groups are must-visits. " +
      "Village kava ceremonies (sevusevu) are an important cultural protocol.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/fiji"],
  },

  new_zealand: {
    name: "New Zealand",
    region: "South Pacific",
    flag: "🇳🇿",
    visaFree: ["norwegian", "eu", "uk"],
    visaOnArrival: ["us", "australian"],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Opua (Bay of Islands)", "Whangarei", "Auckland"],
    cruisingFees: "Biosecurity inspection fee ~NZD 400–600 (~$230–360 USD)",
    typicalStay: "9 months (NZF visa for Norwegians)",
    vhfChannel: 16,
    notes:
      "Pre-arrival notice required (96 hours). Strict biosecurity — all food, wood, and natural materials inspected. " +
      "Opua is the classic first port of entry. Bay of Islands is outstanding cruising ground. " +
      "Norwegians can apply for a Visitor Visa allowing up to 9 months.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/new-zealand"],
  },

  panama: {
    name: "Panama",
    region: "Central America",
    flag: "🇵🇦",
    visaFree: ["norwegian", "eu", "us", "australian", "uk"],
    visaOnArrival: [],
    visaRequired: [],
    permitRequired: false,
    customsPorts: ["Colón (Cristóbal)", "Panama City (Balboa)", "Bocas del Toro", "Las Perlas"],
    cruisingFees: "Cruising permit ~$150 USD + zarpe fees",
    typicalStay: "90 days",
    vhfChannel: 16,
    notes:
      "Panama Canal transit is a major logistical step. Canal fees for yachts under 50ft: ~$1,200–2,000 USD including admeasurement, " +
      "line handlers (4 required), and advisor. Book well in advance — wait times can be 2–3 weeks. " +
      "San Blas (Guna Yala) archipelago requires a separate cruising permit (~$20 USD) and is spectacular.",
    lastUpdated: "2024-11",
    sources: [
      "https://www.noonsite.com/country/panama",
      "https://www.pancanal.com",
    ],
  },

  australia: {
    name: "Australia",
    region: "Southwest Pacific",
    flag: "🇦🇺",
    visaFree: [],
    visaOnArrival: [],
    visaRequired: ["norwegian", "eu", "us", "uk"],
    permitRequired: false,
    customsPorts: [
      "Darwin",
      "Cairns",
      "Thursday Island",
      "Bundaberg",
      "Brisbane",
    ],
    cruisingFees: "Biosecurity levy ~AUD 395 (~$250 USD)",
    typicalStay: "Up to 12 months (Tourist visa/ETA)",
    vhfChannel: 16,
    notes:
      "ETA (Electronic Travel Authority) required for Norwegians — apply online before arrival (~AUD 20). " +
      "96-hour pre-arrival notice required. Strict biosecurity similar to NZ. " +
      "Darwin is the classic entry point from SE Asia. " +
      "The Whitsundays are a world-class cruising ground further south.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/australia"],
  },

  south_africa: {
    name: "South Africa",
    region: "Southern Africa",
    flag: "🇿🇦",
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
      "Richards Bay is popular as a stop before/after rounding. " +
      "Timing is critical — avoid the Cape in winter (June–August). " +
      "Strong currents in the Agulhas — plan carefully.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/south-africa"],
  },

  maldives: {
    name: "Maldives",
    region: "Indian Ocean",
    flag: "🇲🇻",
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
      "Stunning destination but heavily regulated. Alcohol must be consumed on board — cannot be brought ashore. " +
      "Uligamu is the preferred entry point from the north. " +
      "Provisioning is expensive and limited outside Male.",
    lastUpdated: "2024-11",
    sources: ["https://www.noonsite.com/country/maldives"],
  },
};

export const regionRoutes: Record<string, string[]> = {
  "pacific_circuit": ["panama", "french_polynesia", "fiji", "new_zealand", "australia"],
  "indian_ocean": ["australia", "indonesia", "maldives", "south_africa"],
  "circumnavigation_west": ["panama", "french_polynesia", "fiji", "new_zealand", "australia", "indonesia", "maldives", "south_africa"],
};
