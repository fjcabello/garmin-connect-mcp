# garmin-connect-mcp

MCP server for Garmin Connect. Access your fitness, health, and training data from Claude Code, Claude Desktop, Cursor, Windsurf, or any MCP client.

**61 tools** across 7 categories: activities, daily health, trends, sleep, body composition, performance/training, and profile/devices.

API endpoints and authentication flow based on [`python-garminconnect`](https://github.com/cyberjunky/python-garminconnect) by [cyberjunky](https://github.com/cyberjunky).

## Requirements

- Node.js 20+
- A Garmin Connect account (email and password)

## Installation

### Claude Code

```bash
claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y @nicolasvegam/garmin-connect-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Any MCP Client

Run the server with environment variables:

```bash
GARMIN_EMAIL=you@email.com GARMIN_PASSWORD=yourpass npx -y @nicolasvegam/garmin-connect-mcp
```

The server communicates over stdio using the [Model Context Protocol](https://modelcontextprotocol.io/).

## Available Tools

### Activities (12 tools)
| Tool | Description |
|------|-------------|
| `get_activities` | List recent activities with pagination |
| `get_activities_by_date` | Search activities within a date range |
| `get_last_activity` | Get the most recent activity |
| `count_activities` | Get total number of activities |
| `get_activity` | Summary data for a specific activity |
| `get_activity_details` | Detailed metrics: HR, pace, elevation time series |
| `get_activity_splits` | Per-km or per-mile split data |
| `get_activity_weather` | Weather conditions during activity |
| `get_activity_hr_zones` | Time in each heart rate zone |
| `get_activity_exercise_sets` | Strength training sets (reps, weight) |
| `get_activity_types` | All available activity types |
| `get_progress_summary` | Fitness stats over a date range by activity type |

### Daily Health (14 tools)
| Tool | Description |
|------|-------------|
| `get_daily_summary` | Full daily summary (steps, calories, distance, etc.) |
| `get_steps` | Step count for a date |
| `get_steps_chart` | Intraday step data throughout the day |
| `get_heart_rate` | Heart rate data (resting, max, zones, time series) |
| `get_resting_heart_rate` | Resting heart rate for a date |
| `get_stress` | Stress levels and time series |
| `get_body_battery` | Body Battery energy levels (date range) |
| `get_body_battery_events` | Battery charge/drain events for a day |
| `get_respiration` | Breathing rate data |
| `get_spo2` | Blood oxygen saturation |
| `get_intensity_minutes` | Moderate/vigorous intensity minutes |
| `get_floors` | Floors climbed chart data |
| `get_hydration` | Daily hydration/water intake |
| `get_daily_events` | Daily wellness events |

### Trends (4 tools)
| Tool | Description |
|------|-------------|
| `get_daily_steps_range` | Daily step counts over a date range |
| `get_weekly_steps` | Weekly step aggregates |
| `get_weekly_stress` | Weekly stress aggregates |
| `get_weekly_intensity_minutes` | Weekly intensity minutes |

### Sleep (2 tools)
| Tool | Description |
|------|-------------|
| `get_sleep_data` | Sleep stages, score, bed/wake times |
| `get_sleep_data_raw` | Raw sleep data with HR and SpO2 |

### Body Composition (5 tools)
| Tool | Description |
|------|-------------|
| `get_body_composition` | Weight, BMI, body fat %, muscle mass (date range) |
| `get_latest_weight` | Most recent weight entry |
| `get_daily_weigh_ins` | All weigh-ins for a date |
| `get_weigh_ins` | Weigh-in records over a date range |
| `get_blood_pressure` | Blood pressure readings (date range) |

### Performance & Training (11 tools)
| Tool | Description |
|------|-------------|
| `get_vo2max` | VO2 Max estimate (running/cycling) |
| `get_training_readiness` | Training Readiness score |
| `get_training_status` | Training status and load |
| `get_hrv` | Heart Rate Variability |
| `get_endurance_score` | Endurance fitness score |
| `get_hill_score` | Climbing performance score |
| `get_race_predictions` | 5K/10K/half/full marathon predictions |
| `get_fitness_age` | Estimated fitness age |
| `get_personal_records` | All personal records |
| `get_lactate_threshold` | Lactate threshold HR and pace |
| `get_cycling_ftp` | Functional Threshold Power (cycling) |

### Profile & Devices (13 tools)
| Tool | Description |
|------|-------------|
| `get_user_profile` | User social profile and preferences |
| `get_user_settings` | User settings, measurement system, sleep schedule |
| `get_devices` | Registered Garmin devices |
| `get_device_settings` | Settings for a specific device |
| `get_device_last_used` | Last used device info |
| `get_primary_training_device` | Primary training device |
| `get_device_solar_data` | Solar charging data |
| `get_gear` | All tracked gear/equipment |
| `get_gear_stats` | Usage stats for a gear item |
| `get_goals` | Active goals and progress |
| `get_earned_badges` | Earned badges and achievements |
| `get_workouts` | Saved workouts |
| `get_workout` | Specific workout by ID |

## Authentication

Uses Garmin Connect credentials (email/password) via environment variables. OAuth tokens are cached in `~/.garmin-mcp/` to avoid re-authentication on each request.

### MFA (Multi-Factor Authentication)

If your Garmin account has MFA enabled (required for devices with ECG capabilities), you need to run the interactive setup once before using the MCP server:

```bash
GARMIN_EMAIL='you@email.com' GARMIN_PASSWORD='yourpass' npx -y @nicolasvegam/garmin-connect-mcp setup
```

This will:
1. Log in to Garmin Connect
2. Prompt you for the MFA code sent to your email or authenticator app
3. Save OAuth tokens to `~/.garmin-mcp/`

After setup, the MCP server will use the saved tokens automatically — no MFA prompt needed until the tokens expire. When they do, simply run the setup command again.

## Development

```bash
git clone https://github.com/Nicolasvegam/garmin-connect-mcp.git
cd garmin-connect-mcp
npm install
npm run build
```

To test locally:

```bash
GARMIN_EMAIL=you@email.com GARMIN_PASSWORD=yourpass npm start
```

## Deploy to Fly.io

This repo also ships an HTTP-exposed variant of the server (`MCP_HTTP_PORT` + [proxy.cjs](proxy.cjs) auth proxy) designed to run as a container on [Fly.io](https://fly.io), so it can be reached remotely (e.g. by a Cloudflare Worker acting as OAuth gateway — see [mcp-worker-fly](https://github.com/fjcabello/garmin-mcp-fly-worker)).

Architecture inside the container: `proxy.cjs` (port 8080, validates `?api_key=`) → `build/index.js` HTTP server (port 8081, internal only). See [start.sh](start.sh) / [Dockerfile](Dockerfile).

### First-time setup

```bash
fly auth login
fly apps create <your-app-name>   # or reuse the name already set in fly.toml
fly secrets set \
  API_KEY=$(openssl rand -hex 32) \
  GARMIN_EMAIL=you@email.com \
  GARMIN_PASSWORD=yourpass \
  --app <your-app-name>
fly deploy --app <your-app-name>
```

- `API_KEY`: shared secret validated by `proxy.cjs` on every request (`?api_key=...`). Give this same value to whatever client/proxy connects to this server.
- `GARMIN_EMAIL` / `GARMIN_PASSWORD`: Garmin Connect credentials used by the MCP server itself.
- The app listens on `8080` internally (see `fly.toml`'s `[http_service] internal_port`); Fly handles TLS termination.

### Continuous deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) auto-deploys to Fly.io on every push to `main` via `flyctl deploy --ha=false --remote-only`. To enable it:

1. Generate a deploy token: `fly tokens create deploy --app <your-app-name>`
2. Add it as a GitHub Actions secret named `FLY_API_TOKEN` in this repo's settings (Settings → Secrets and variables → Actions).

### Verifying the deployment

```bash
fly status --app <your-app-name>
fly logs --app <your-app-name>
curl "https://<your-app-name>.fly.dev/mcp?api_key=<API_KEY>"
```

## Credits

- API endpoints and authentication flow based on [`python-garminconnect`](https://github.com/cyberjunky/python-garminconnect) by [cyberjunky](https://github.com/cyberjunky)

## License

MIT
