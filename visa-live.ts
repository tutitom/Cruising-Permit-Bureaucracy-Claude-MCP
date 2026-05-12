/**
 * Live visa data fetched from the passport-index-dataset by ilyankou.
 * Source: https://github.com/ilyankou/passport-index-dataset
 * Updated ~monthly. No API key required.
 *
 * Requirement codes:
 *   VF  = Visa Free (number = days allowed)
 *   VOA = Visa on Arrival
 *   EV  = eVisa required
 *   VR  = Visa Required (apply in advance)
 *   NA  = Not Admitted / no data
 */

const DATASET_URL =
  "https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy.csv";

// ISO-2 country codes for nationalities we care about
export const NATIONALITY_CODES: Record<string, string> = {
  norwegian: "NO",
  no: "NO",
  norwegian_: "NO",
  swedish: "SE",
  danish: "DK",
  us: "US",
  american: "US",
  australian: "AU",
  uk: "GB",
  british: "GB",
  eu: "DE", // proxy — German passport is strong EU representative
};

// ISO-2 codes for our destination countries
export const COUNTRY_CODES: Record<string, string> = {
  indonesia: "ID",
  french_polynesia: "PF",
  fiji: "FJ",
  new_zealand: "NZ",
  australia: "AU",
  panama: "PA",
  south_africa: "ZA",
  maldives: "MV",
  thailand: "TH",
  malaysia: "MY",
  sri_lanka: "LK",
};

export interface LiveVisaResult {
  passport: string;
  destination: string;
  requirement: string;   // VF / VOA / EV / VR / NA
  days: number | null;   // days allowed if visa-free, else null
  label: string;         // human-readable
  emoji: string;
  source: string;
  fetchedAt: string;
}

let _cache: Map<string, LiveVisaResult> | null = null;
let _cacheTime: number | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

async function loadDataset(): Promise<Map<string, LiveVisaResult>> {
  const now = Date.now();
  if (_cache && _cacheTime && now - _cacheTime < CACHE_TTL_MS) {
    return _cache;
  }

  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Failed to fetch passport index: ${res.status}`);

  const csv = await res.text();
  const lines = csv.trim().split("\n").slice(1); // skip header

  const map = new Map<string, LiveVisaResult>();

  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 3) continue;
    const [passport, destination, requirement] = parts;
    const key = `${passport.trim()}-${destination.trim()}`;

    const req = requirement.trim();
    let days: number | null = null;
    let label = "";
    let emoji = "";

    if (req === "VF") {
      label = "Visa-free";
      emoji = "✅";
    } else if (!isNaN(Number(req)) && Number(req) > 0) {
      days = Number(req);
      label = `Visa-free (${days} days)`;
      emoji = "✅";
    } else if (req === "VOA") {
      label = "Visa on arrival";
      emoji = "🟡";
    } else if (req === "EV") {
      label = "eVisa required";
      emoji = "🟡";
    } else if (req === "VR") {
      label = "Visa required (apply in advance)";
      emoji = "🔴";
    } else {
      label = "No data / not admitted";
      emoji = "❓";
    }

    map.set(key, {
      passport: passport.trim(),
      destination: destination.trim(),
      requirement: req,
      days,
      label,
      emoji,
      source: "github.com/ilyankou/passport-index-dataset",
      fetchedAt: new Date().toISOString(),
    });
  }

  _cache = map;
  _cacheTime = now;
  return map;
}

export async function lookupVisa(
  passportCountryCode: string,
  destinationCountryCode: string
): Promise<LiveVisaResult | null> {
  const dataset = await loadDataset();
  const key = `${passportCountryCode.toUpperCase()}-${destinationCountryCode.toUpperCase()}`;
  return dataset.get(key) ?? null;
}

export async function lookupVisaByName(
  nationality: string,
  countryKey: string
): Promise<LiveVisaResult | null> {
  const passportCode = NATIONALITY_CODES[nationality.toLowerCase()];
  const destCode = COUNTRY_CODES[countryKey.toLowerCase()];

  if (!passportCode) throw new Error(`Unknown nationality: "${nationality}". Try: norwegian, us, australian, uk`);
  if (!destCode) throw new Error(`No ISO code for country key: "${countryKey}"`);

  return lookupVisa(passportCode, destCode);
}
