# cc-quota

[English](./README.md) | [日本語](./README.ja.md)

Fetch Claude Code OAuth usage statistics (5-hour and 7-day limits).

## Features

- 🔐 Automatic credential detection (macOS Keychain or file-based)
- ⚡️ File-based caching with TTL (60s success, 15s failure)
- 🎯 Simple API for programmatic usage
- 🖥️ CLI tool for quick status checks
- 📦 Zero dependencies (Node.js standard library only)
- 🔒 Secure token handling (no logging of sensitive data)

## Installation

```bash
npm install cc-quota
```

## CLI Usage

### Basic usage (plain format with progress bars)

```bash
npx cc-quota
# Output: Max | 5h: [░░░░░░░░░░] 4% | 7d-all: [░░░░░░░░░░] 2% | 7d-sonnet: [░░░░░░░░░░] 1%
```

### Hide specific items

Hide unwanted items using the `--hide` option (comma-separated):

```bash
# Hide plan name and 7-day overall usage
npx cc-quota --hide plan,7d
# Output: 5h: [░░░░░░░░░░] 4% | 7d-sonnet: [░░░░░░░░░░] 1%

# Show only 5-hour usage
npx cc-quota --hide plan,7d,7d-sonnet
# Output: 5h: [░░░░░░░░░░] 4%

# Show only plan name and 7-day Sonnet usage
npx cc-quota --hide 5h,7d
# Output: Max | 7d-sonnet: [░░░░░░░░░░] 1%
```

Available hide options:
- `plan` - Plan name (Max, Pro, etc.)
- `5h` - 5-hour usage limit
- `7d` - 7-day overall usage limit
- `7d-sonnet` - 7-day Sonnet-only usage limit

### Progress bar customization

```bash
# Disable progress bars
npx cc-quota --noBar
# Output: Max | 5h: 4% | 7d-all: 2% | 7d-sonnet: 1%

# Custom bar width (default: 10)
npx cc-quota --barWidth 20
# Output: Max | 5h: [░░░░░░░░░░░░░░░░░░░░] 4% | ...
```

### JSON format

```bash
npx cc-quota -f json
# Output:
# {
#   "planName": "Max",
#   "fiveHour": 4,
#   "sevenDay": 2,
#   "sevenDaySonnet": 1,
#   "fiveHourResetAt": "2026-02-09T06:00:00.087Z",
#   "sevenDayResetAt": "2026-02-15T17:00:00.087Z",
#   "sevenDaySonnetResetAt": "2026-02-15T17:00:00.087Z"
# }
```

### All CLI options

```bash
npx cc-quota [options]

Options:
  -f, --format <format>     Output format (plain or json) [default: plain]
  --noBar                   Disable progress bar display
  --barWidth <width>        Progress bar width in characters [default: 10]
  --hide <items>            Comma-separated list of items to hide (plan, 5h, 7d, 7d-sonnet)
  -h, --help                Display help
  -v, --version             Display version
```

## Library Usage

### Get usage data

```typescript
import { getUsage } from 'cc-quota/lib';

const usage = await getUsage();

if (usage) {
  console.log(`Plan: ${usage.planName}`);
  console.log(`5-hour usage: ${usage.fiveHour}%`);
  console.log(`7-day overall usage: ${usage.sevenDay}%`);
  console.log(`7-day Sonnet usage: ${usage.sevenDaySonnet}%`);
  console.log(`5-hour resets at: ${usage.fiveHourResetAt}`);
  console.log(`7-day resets at: ${usage.sevenDayResetAt}`);
  console.log(`7-day Sonnet resets at: ${usage.sevenDaySonnetResetAt}`);
} else {
  console.log('Not authenticated');
}
```

### Type definitions

```typescript
import type { UsageData } from 'cc-quota/lib';

interface UsageData {
  planName: string | null;           // 'Max' | 'Pro' | 'Team' | null
  fiveHour: number | null;           // 0-100 (percentage)
  sevenDay: number | null;           // 0-100 (percentage, overall 7-day usage)
  sevenDaySonnet: number | null;     // 0-100 (percentage, Sonnet-only 7-day usage)
  fiveHourResetAt: Date | null;
  sevenDayResetAt: Date | null;
  sevenDaySonnetResetAt: Date | null;
  apiUnavailable?: boolean;          // true if API call failed
}
```

### Cache control

```typescript
import { readCache, writeCache } from 'cc-quota/lib';

// Read cache manually
const cached = readCache();

// Clear cache (force fresh API call)
import { unlinkSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const cachePath = join(homedir(), '.claude', 'cc-quota', '.usage-cache.json');
if (existsSync(cachePath)) {
  unlinkSync(cachePath);
}
```

## Authentication

The library automatically detects credentials from:

1. **macOS Keychain** (recommended): `Claude Code-credentials`
2. **File-based** (fallback): `~/.claude/.credentials.json`

No additional configuration required if you're logged in to Claude Code.

## Cache Behavior

- **Success TTL**: 60 seconds
- **Failure TTL**: 15 seconds
- **Cache location**: `~/.claude/cc-quota/.usage-cache.json`

## Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=cc-quota npx cc-quota
# or
DEBUG=* npx cc-quota
```

This will output detailed logs about:
- Cache hits/misses and expiration
- Credential loading (Keychain vs file)
- API requests and responses
- Error details for troubleshooting

## API Endpoint

This library uses the official Claude Code OAuth usage API:

```
GET https://api.anthropic.com/api/oauth/usage
Authorization: Bearer <token>
anthropic-beta: oauth-2025-04-20
```

## Requirements

- Node.js >= 18
- Claude Code authentication (logged in)

## License

MIT
