#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { countries, regionRoutes, freshnessLabel, daysSince, STALE_DAYS } from "./data.js";
import type { CountryEntry } from "./data.js";
import { lookupVisaByName, NATIONALITY_CODES, COUNTRY_CODES } from "./visa-live.js";

const server = new McpServer({ name: "cruising-permit-mcp", version: "0.2.0" });

// ─── helpers ────────────────────────────────────────────────────────────────

function resolveCountryKey(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

// ─── Tool 1: get_country_requirements (with freshness) ───────────────────────

server.tool(
  "get_country_requirements",
  "Get visa, permit, and entry requirements for a cruising yacht. Shows freshness warnings and offers live visa verification.",
  {
    country: z.string().describe("Country name e.g. 'indonesia', 'fiji', 'french_polynesia'"),
    nationality: z.string().optional().describe("Nationality e.g. 'norwegian', 'us'. Defaults to 'norwegian'"),
    live_visa: z.boolean().optional().describe("Set true to fetch live visa status from passport-index-dataset instead of cached data"),
  },
  async ({ country, nationality = "norwegian", live_visa = false }) => {
    const key = resolveCountryKey(country);
    const entry = countries[key];

    if (!entry) {
      return {
        content: [{
          type: "text" as const,
          text: `Country "${country}" not found.\n\nAvailable: ${Object.keys(countries).join(", ")}`,
        }],
      };
    }

    const nat = nationality.toLowerCase();

    // Visa status — live or cached
    let visaLine = "";
    if (live_visa) {
      try {
        const live = await lookupVisaByName(nat, key);
        if (live) {
          visaLine = `${live.emoji} **${live.label}** *(live from passport-index-dataset, fetched ${live.fetchedAt.slice(0,10)})*`;
        } else {
          visaLine = "❓ No live data available — falling back to cached";
        }
      } catch (e: unknown) {
        visaLine = `❓ Live lookup failed: ${e instanceof Error ? e.message : String(e)}`;
      }
    }

    if (!visaLine) {
      // Cached fallback
      if (entry.visaFree.includes(nat)) visaLine = "✅ Visa-free (cached)";
      else if (entry.visaOnArrival.includes(nat)) visaLine = "🟡 Visa on arrival (cached)";
      else if (entry.visaRequired.includes(nat)) visaLine = "🔴 Visa required — apply in advance (cached)";
      else visaLine = "❓ Nationality not in cached data — use live_visa: true for a live check";
    }

    const visaFreshness = freshnessLabel(entry.visaLastVerified);
    const permitFreshness = freshnessLabel(entry.permitLastVerified);

    const lines: string[] = [
      `# ${entry.flag} ${entry.name} — Cruising Entry Requirements`,
      `**Region:** ${entry.region}  |  **Nationality checked:** ${nationality}`,
      ``,
      `## Visa`,
      visaLine,
      `**Typical stay:** ${entry.typicalStay}`,
      `*Visa data: ${visaFreshness.label}*`,
      visaFreshness.stale ? `> ⚠️ Visa data may be outdated. Use \`live_visa: true\` or check https://www.noonsite.com/country/${key.replace("_", "-")}` : "",
      ``,
      `## Cruising Permit`,
      entry.permitRequired
        ? `⚠️ **Required: ${entry.permitName ?? "Cruising permit"}**`
        : `✅ No specific cruising permit required`,
    ];

    if (entry.permitCost) lines.push(`**Cost:** ${entry.permitCost}`);
    if (entry.permitProcessingDays) lines.push(`**Processing time:** ${entry.permitProcessingDays} days — plan ahead!`);
    if (entry.permitNotes) lines.push(`\n${entry.permitNotes}`);

    lines.push(
      `*Permit data: ${permitFreshness.label}*`,
      permitFreshness.stale
        ? `> ⚠️ Permit data may be outdated. Verify at https://www.noonsite.com/country/${key.replace("_", "-")}`
        : "",
      ``,
      `## Official Ports of Entry`,
      entry.customsPorts.map((p: string) => `- ${p}`).join("\n"),
      ``,
      `## Fees`,
      entry.cruisingFees ?? "No significant cruising fees",
      ``,
      `## Notes`,
      entry.notes,
      ``,
      `---`,
      `*Sources: ${entry.sources.join(", ")}*`,
    );

    return { content: [{ type: "text" as const, text: lines.filter(l => l !== "").join("\n") }] };
  }
);

// ─── Tool 2: verify_visa_live ────────────────────────────────────────────────

server.tool(
  "verify_visa_live",
  "Fetch live visa status directly from the passport-index-dataset (github.com/ilyankou/passport-index-dataset). More up-to-date than cached data. Covers 199 passports × 199 destinations.",
  {
    country: z.string().describe("Destination country key e.g. 'indonesia', 'fiji', 'new_zealand'"),
    nationality: z.string().optional().describe("Passport nationality e.g. 'norwegian', 'us', 'australian'. Defaults to 'norwegian'"),
  },
  async ({ country, nationality = "norwegian" }) => {
    const key = resolveCountryKey(country);
    const nat = nationality.toLowerCase();

    try {
      const result = await lookupVisaByName(nat, key);

      if (!result) {
        return {
          content: [{
            type: "text" as const,
            text: `No data found for ${nationality} → ${country}.\n\nSupported nationalities: ${Object.keys(NATIONALITY_CODES).join(", ")}\nSupported destinations: ${Object.keys(COUNTRY_CODES).join(", ")}`,
          }],
        };
      }

      const entry = countries[key];
      const lines = [
        `# 🔴 Live Visa Check — ${nationality} → ${entry?.name ?? country}`,
        ``,
        `${result.emoji} **${result.label}**`,
        result.days ? `Maximum stay: ${result.days} days` : "",
        ``,
        `**Source:** ${result.source}`,
        `**Data fetched:** ${result.fetchedAt.slice(0, 10)}`,
        ``,
        `> This is live data from the passport-index-dataset, updated ~monthly from official sources.`,
        entry
          ? `> For cruising permit details, use \`get_country_requirements\` for ${entry.name}.`
          : "",
      ];

      return { content: [{ type: "text" as const, text: lines.filter(Boolean).join("\n") }] };
    } catch (e: unknown) {
      return {
        content: [{
          type: "text" as const,
          text: `Live lookup failed: ${e instanceof Error ? e.message : String(e)}\n\nCheck your internet connection or verify the country/nationality codes.`,
        }],
      };
    }
  }
);

// ─── Tool 3: check_freshness ─────────────────────────────────────────────────

server.tool(
  "check_freshness",
  "Check which countries in the database have stale data and need verification. Useful before departure planning.",
  {
    max_days: z.number().optional().describe(`Flag entries older than this many days. Defaults to ${STALE_DAYS}`),
  },
  async ({ max_days = STALE_DAYS }) => {
    const stale: string[] = [];
    const aging: string[] = [];
    const fresh: string[] = [];

    for (const [key, entry] of Object.entries(countries)) {
      const permitAge = daysSince(entry.permitLastVerified);
      const visaAge = daysSince(entry.visaLastVerified);
      const maxAge = Math.max(permitAge, visaAge);

      const line = `${entry.flag} **${entry.name}** — permit: ${permitAge}d ago, visa: ${visaAge}d ago`;

      if (maxAge >= max_days) stale.push(line);
      else if (maxAge >= max_days * 0.6) aging.push(line);
      else fresh.push(line);
    }

    const lines = [
      `# Database Freshness Report`,
      `*Threshold: ${max_days} days*`,
      ``,
    ];

    if (stale.length > 0) {
      lines.push(
        `## 🔴 Stale — verify before use (${stale.length})`,
        ...stale,
        ``,
        `> Use \`get_country_requirements\` with \`live_visa: true\` and check Noonsite for permit info.`,
        ``
      );
    }

    if (aging.length > 0) {
      lines.push(
        `## 🟡 Aging — double-check before departure (${aging.length})`,
        ...aging,
        ``
      );
    }

    if (fresh.length > 0) {
      lines.push(
        `## ✅ Fresh (${fresh.length})`,
        ...fresh,
      );
    }

    lines.push(
      ``,
      `---`,
      `*To update entries, edit \`src/data.ts\` and bump the \`permitLastVerified\` / \`visaLastVerified\` dates.*`
    );

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ─── Tool 4: plan_route_requirements ────────────────────────────────────────

server.tool(
  "plan_route_requirements",
  "Get a summary of entry requirements for all countries along a cruising route. Includes freshness warnings.",
  {
    countries: z.array(z.string()).optional().describe("List of countries in order"),
    route_name: z.string().optional().describe("Named route: 'pacific_circuit', 'indian_ocean', or 'circumnavigation_west'"),
    nationality: z.string().optional().describe("Nationality. Defaults to 'norwegian'"),
  },
  async ({ countries: countryList, route_name, nationality = "norwegian" }) => {
    let keys: string[] = [];

    if (route_name) {
      const route = regionRoutes[route_name.toLowerCase()];
      if (!route) {
        return {
          content: [{
            type: "text" as const,
            text: `Unknown route "${route_name}".\n\nAvailable: ${Object.keys(regionRoutes).join(", ")}`,
          }],
        };
      }
      keys = route;
    } else if (countryList && countryList.length > 0) {
      keys = countryList.map(resolveCountryKey);
    } else {
      return { content: [{ type: "text" as const, text: "Provide countries or route_name." }] };
    }

    const nat = nationality.toLowerCase();
    const warnings: string[] = [];
      const freshnessWarnings: string[] = [];
    const bodyLines: string[] = [];

    for (const key of keys) {
      const entry: CountryEntry | undefined = countries[key];
      if (!entry) {
        bodyLines.push(`## ❓ ${key} — not in database\n`);
        continue;
      }

      let visaStatus = "❓ Unknown";
      if (entry.visaFree.includes(nat)) visaStatus = "✅ Visa-free";
      else if (entry.visaOnArrival.includes(nat)) visaStatus = "🟡 Visa on arrival";
      else if (entry.visaRequired.includes(nat)) {
        visaStatus = "🔴 Visa required";
        warnings.push(`${entry.flag} ${entry.name}: visa must be arranged in advance`);
      }

      const permit = entry.permitRequired
        ? `⚠️ ${entry.permitName ?? "Permit required"}`
        : "✅ No permit";

      const permitFresh = freshnessLabel(entry.permitLastVerified);
      if (permitFresh.stale) freshnessWarnings.push(`${entry.flag} ${entry.name}: permit data is ${daysSince(entry.permitLastVerified)} days old`);

      bodyLines.push(
        `## ${entry.flag} ${entry.name}`,
        `- **Visa:** ${visaStatus} — ${entry.typicalStay}`,
        `- **Permit:** ${permit}`,
        entry.permitProcessingDays ? `- **Lead time:** ${entry.permitProcessingDays} days before arrival` : "",
        `- **Entry ports:** ${entry.customsPorts.slice(0, 2).join(", ")}`,
        entry.cruisingFees ? `- **Fees:** ${entry.cruisingFees}` : "",
        `- *Data: ${permitFresh.label}*`,
        ``,
      );

      if (entry.permitRequired && (entry.permitProcessingDays ?? 0) >= 14) {
        warnings.push(`${entry.flag} ${entry.name}: ${entry.permitName} needs ${entry.permitProcessingDays}+ days`);
      }
    }

    const headerLines: string[] = [
      `# Route Entry Requirements`,
      `**Nationality:** ${nationality}  |  **Stops:** ${keys.length}`,
      ``,
    ];

    if (warnings.length > 0) {
      headerLines.push(`## ⚠️ Action required`, ...warnings.map(w => `- ${w}`), ``);
    }
    if (freshnessWarnings.length > 0) {
      headerLines.push(`## 🔴 Stale data — verify before departure`, ...freshnessWarnings.map(w => `- ${w}`), ``);
    }

    const text = [...headerLines, ...bodyLines,
      `---`,
      `*Use \`verify_visa_live\` for live visa checks, \`check_freshness\` for a full freshness report*`
    ].join("\n");

    return { content: [{ type: "text" as const, text: text }] };
  }
);

// ─── Tool 5: find_countries ──────────────────────────────────────────────────

server.tool(
  "find_countries",
  "Find cruising destinations matching criteria (no permit needed, visa-free, specific region)",
  {
    region: z.string().optional().describe("Filter by region e.g. 'South Pacific', 'Indian Ocean'"),
    permit_required: z.boolean().optional().describe("Filter by whether a cruising permit is required"),
    nationality: z.string().optional().describe("Show visa-free destinations for this nationality. Defaults to 'norwegian'"),
  },
  async ({ region, permit_required, nationality = "norwegian" }) => {
    const nat = nationality.toLowerCase();
    let results = Object.values(countries);

    if (region) results = results.filter((c: CountryEntry) => c.region.toLowerCase().includes(region.toLowerCase()));
    if (permit_required !== undefined) results = results.filter((c: CountryEntry) => c.permitRequired === permit_required);
    if (nationality) results = results.filter((c: CountryEntry) => c.visaFree.includes(nat) || c.visaOnArrival.includes(nat));

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: "No countries match those criteria." }] };
    }

    const lines = [
      `# Matching Destinations (${results.length})`,
      ``,
      ...results.map((c: CountryEntry) => {
        const visaTag = c.visaFree.includes(nat) ? "✅ Visa-free" : "🟡 On arrival";
        const permitTag = c.permitRequired ? "⚠️ Permit needed" : "✅ No permit";
        const fresh = freshnessLabel(c.permitLastVerified);
        return `## ${c.flag} ${c.name} — ${c.region}\n- ${visaTag} · ${permitTag} · Stay: ${c.typicalStay}\n- *${fresh.label}*`;
      }),
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ─── Tool 6: get_canal_transit_info ─────────────────────────────────────────

server.tool(
  "get_canal_transit_info",
  "Get detailed information about transiting the Panama Canal on a private yacht",
  {},
  async () => {
    const text = `# 🇵🇦 Panama Canal Transit — Private Yacht Guide
*Data verified: 2024-11-01*

## Fees (approximate, 2024)
- **Admeasurement:** ~$800 USD
- **Canal toll:** ~$800–1,500 USD depending on boat size
- **Security deposit:** $1,000 USD (refundable)
- **Line handlers:** 4 required (~$100–150/person/day)
- **Total estimate:** $2,000–3,500 USD

## Process
1. Arrive at Colón (Atlantic) or Balboa (Pacific)
2. Contact ACP on VHF 12 or 16
3. Schedule admeasurement (inspector boards your boat)
4. Pay fees at ACP office
5. Wait for transit slot — typically 1–3 weeks in high season (Jan–Apr)
6. Hire 4 line handlers (Shelter Bay Marina or La Playita)
7. Transit takes 1–2 days with overnight in Gatun Lake

## Tips
- Bring 125ft lines (×4) and large fenders (×4)
- High season Jan–Apr = longer waits; rainy season May–Nov = shorter waits
- Allow 2–3 weeks in Panama total
- San Blas (Guna Yala) worth visiting — stunning archipelago, separate permit ~$20

## Contact
- ACP Yacht Services: +507 272-4570
- VHF 12 (Canal ops), VHF 16 (calling)
- https://www.pancanal.com`;

    return { content: [{ type: "text" as const, text }] };
  }
);

// ─── Tool 7: list_countries ──────────────────────────────────────────────────

server.tool(
  "list_countries",
  "List all countries in the cruising permit database with freshness status",
  {},
  async () => {
    const lines = [
      "# Countries in database",
      "",
      ...Object.values(countries).map((c: CountryEntry) => {
        const f = freshnessLabel(c.permitLastVerified);
        return `- ${c.flag} **${c.name}** (${c.region}) — ${c.permitRequired ? "⚠️ permit" : "no permit"} — ${f.label}`;
      }),
      "",
      "Use `check_freshness` for a full freshness report, `verify_visa_live` for live visa data.",
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

// ─── start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
server.prompt(
  "innreise",
  "Sjekk innreisekrav for et land som norsk cruiser",
  {
    land: z.string().describe("Landet du vil seile til"),
  },
  ({ land }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Bruk get_country_requirements-toolen til å hente innreisekrav for "${land}" for en norsk statsborger med seilbåt. Inkluder visa, cruising permit, offisielle innreisehavner og gebyrer.`,
      },
    }],
  })
);
await server.connect(transport);
