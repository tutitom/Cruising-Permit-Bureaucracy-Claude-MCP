#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { countries, regionRoutes } from "./data.js";
import type { CountryEntry } from "./data.js";

const server = new McpServer({
  name: "cruising-permit-mcp",
  version: "0.1.0",
});

server.tool(
  "get_country_requirements",
  "Get visa, permit, and entry requirements for a specific country for a cruising yacht",
  {
    country: z.string().describe("Country name or code e.g. 'indonesia', 'fiji', 'french_polynesia'"),
    nationality: z.string().optional().describe("Sailor's nationality e.g. 'norwegian', 'us'. Defaults to 'norwegian'"),
  },
  async ({ country, nationality = "norwegian" }) => {
    const key = country.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
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
    let visaStatus = "❓ Unknown";
    if (entry.visaFree.includes(nat)) visaStatus = "✅ Visa-free";
    else if (entry.visaOnArrival.includes(nat)) visaStatus = "🟡 Visa on arrival";
    else if (entry.visaRequired.includes(nat)) visaStatus = "🔴 Visa required (apply in advance)";

    const lines: string[] = [
      `# ${entry.flag} ${entry.name} — Cruising Entry Requirements`,
      `**Region:** ${entry.region}  |  **Nationality checked:** ${nationality}`,
      ``,
      `## Visa`,
      `${visaStatus}`,
      `**Typical stay:** ${entry.typicalStay}`,
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
      `*Data last updated: ${entry.lastUpdated}*`,
      `*Sources: ${entry.sources.join(", ")}*`,
    );

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

server.tool(
  "plan_route_requirements",
  "Get a summary of entry requirements for all countries along a cruising route",
  {
    countries: z.array(z.string()).optional().describe("List of countries to visit in order"),
    route_name: z.string().optional().describe("Named route: 'pacific_circuit', 'indian_ocean', or 'circumnavigation_west'"),
    nationality: z.string().optional().describe("Sailor's nationality. Defaults to 'norwegian'"),
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
      keys = countryList.map((c: string) => c.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_"));
    } else {
      return { content: [{ type: "text" as const, text: "Please provide either a list of countries or a route_name." }] };
    }

    const nat = nationality.toLowerCase();
    const warnings: string[] = [];
    const bodyLines: string[] = [];

    for (const key of keys) {
      const entry: CountryEntry | undefined = countries[key];
      if (!entry) {
        bodyLines.push(`## ❓ ${key} — not in database yet\n`);
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

      bodyLines.push(
        `## ${entry.flag} ${entry.name}`,
        `- **Visa:** ${visaStatus} — ${entry.typicalStay}`,
        `- **Permit:** ${permit}`,
        entry.permitProcessingDays ? `- **Lead time:** ${entry.permitProcessingDays} days before arrival` : "",
        `- **Entry ports:** ${entry.customsPorts.slice(0, 2).join(", ")}`,
        entry.cruisingFees ? `- **Fees:** ${entry.cruisingFees}` : "",
        ``,
      );

      if (entry.permitRequired && (entry.permitProcessingDays ?? 0) >= 14) {
        warnings.push(`${entry.flag} ${entry.name}: ${entry.permitName} needs ${entry.permitProcessingDays}+ days`);
      }
    }

    const headerLines: string[] = [
      `# Route Entry Requirements Summary`,
      `**Nationality:** ${nationality}  |  **Countries:** ${keys.length}`,
      ``,
    ];

    if (warnings.length > 0) {
      headerLines.push(`## ⚠️ Action required before departure`, ...warnings.map((w: string) => `- ${w}`), ``);
    }

    const text = [...headerLines, ...bodyLines, `---`, `*Use get_country_requirements for full details on any country*`].join("\n");
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "find_countries",
  "Find cruising destinations matching criteria (no permit needed, visa-free, specific region)",
  {
    region: z.string().optional().describe("Filter by region e.g. 'South Pacific', 'Indian Ocean'"),
    permit_required: z.boolean().optional().describe("Filter by whether a cruising permit is required"),
    nationality: z.string().optional().describe("Nationality for visa-free filter. Defaults to 'norwegian'"),
  },
  async ({ region, permit_required, nationality = "norwegian" }) => {
    const nat = nationality.toLowerCase();
    let results = Object.values(countries);

    if (region) results = results.filter((c: CountryEntry) => c.region.toLowerCase().includes(region.toLowerCase()));
    if (permit_required !== undefined) results = results.filter((c: CountryEntry) => c.permitRequired === permit_required);
    if (nationality) results = results.filter((c: CountryEntry) => c.visaFree.includes(nat) || c.visaOnArrival.includes(nat));

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: "No countries match those criteria in the current database." }] };
    }

    const lines = [
      `# Matching Destinations (${results.length} found)`,
      ``,
      ...results.map((c: CountryEntry) => {
        const visaTag = c.visaFree.includes(nat) ? "✅ Visa-free" : "🟡 On arrival";
        const permitTag = c.permitRequired ? "⚠️ Permit needed" : "✅ No permit";
        return `## ${c.flag} ${c.name} — ${c.region}\n- ${visaTag} · ${permitTag} · Stay: ${c.typicalStay}`;
      }),
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

server.tool(
  "get_canal_transit_info",
  "Get detailed information about transiting the Panama Canal on a private yacht",
  {},
  async () => {
    const text = `# 🇵🇦 Panama Canal Transit — Private Yacht Guide

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
5. Wait for transit slot — typically 1–3 weeks in high season
6. Hire 4 line handlers (Shelter Bay Marina or La Playita)
7. Transit takes 1–2 days with overnight in Gatun Lake

## Tips
- Bring 125ft lines (x4) and large fenders (x4)
- High season Jan–Apr = longer waits; rainy season May–Nov = shorter waits
- Allow 2–3 weeks in Panama total for admin and waiting
- San Blas (Guna Yala) worth visiting on either side — stunning archipelago

## Contact
- ACP Yacht Services: +507 272-4570
- VHF 12 (Canal ops), VHF 16 (calling)
- https://www.pancanal.com`;

    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "list_countries",
  "List all countries currently in the cruising permit database",
  {},
  async () => {
    const lines = [
      "# Countries in database",
      "",
      ...Object.values(countries).map((c: CountryEntry) =>
        `- ${c.flag} **${c.name}** (${c.region}) — ${c.permitRequired ? "⚠️ permit required" : "no permit"}`
      ),
      "",
      "Use get_country_requirements for full details on any country.",
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
