# 🧭 Cruising Permit MCP

An MCP server that gives Claude real-time access to cruising permit requirements, visa rules, port entry info, and bureaucratic details for offshore sailing destinations worldwide.

Ask Claude things like:
- *"What do I need to sail to Indonesia as a Norwegian?"*
- *"Plan my paperwork for a Pacific circuit via French Polynesia and Fiji"*
- *"Which South Pacific countries don't require a cruising permit?"*
- *"What does Panama Canal transit cost and how do I book it?"*

## Tools

| Tool | Description |
|---|---|
| `get_country_requirements` | Full visa + permit info for a specific country |
| `plan_route_requirements` | Summary across all countries on a route |
| `find_countries` | Filter destinations by region, permit, visa-free access |
| `get_canal_transit_info` | Panama Canal transit guide for private yachts |
| `list_countries` | See all countries in the database |

## Countries in database

🇮🇩 Indonesia · 🇵🇫 French Polynesia · 🇫🇯 Fiji · 🇳🇿 New Zealand · 🇦🇺 Australia · 🇵🇦 Panama · 🇿🇦 South Africa · 🇲🇻 Maldives

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

## Connect to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cruising-permit": {
      "command": "node",
      "args": ["/absolute/path/to/cruising-permit-mcp/dist/index.js"]
    }
  }
}
```

Config location:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

## Development

```bash
npm run dev   # watch mode with tsx
npm run build # compile TypeScript
```

## Adding countries

Edit `src/data.ts` and add an entry to the `countries` object. The `CountryEntry` TypeScript interface will catch missing fields at compile time.

## Roadmap

- [ ] More countries (Thailand, Sri Lanka, Malaysia, Caribbean, Mediterranean)
- [ ] Weather window integration per passage
- [ ] Provisioning and fuel price data per port
- [ ] CAIT agent directory for Indonesia
- [ ] CLI tool for offline use on passage

## Data sources

- [Noonsite.com](https://www.noonsite.com) — the gold standard for cruising info
- [Seven Sea Cruising Association](https://www.ssca.org)
- [Panama Canal Authority](https://www.pancanal.com)

> ⚠️ Always verify requirements directly with embassies and port authorities before departure. Rules change.
