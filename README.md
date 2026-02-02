# cc-quota

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

### Basic usage (plain format)

```bash
npx cc-quota
# Output: Max | 5h: 5% | 7d: 3%
```

### JSON format

```bash
npx cc-quota -f json
# Output:
# {
#   "planName": "Max",
#   "fiveHour": 5,
#   "sevenDay": 3,
#   "fiveHourResetAt": "2026-02-02T10:00:00.000Z",
#   "sevenDayResetAt": "2026-02-08T07:00:00.000Z"
# }
```

## Library Usage

### Get usage data

```typescript
import { getUsage } from 'cc-quota/lib';

const usage = await getUsage();

if (usage) {
  console.log(`Plan: ${usage.planName}`);
  console.log(`5-hour usage: ${usage.fiveHour}%`);
  console.log(`7-day usage: ${usage.sevenDay}%`);
  console.log(`5-hour resets at: ${usage.fiveHourResetAt}`);
  console.log(`7-day resets at: ${usage.sevenDayResetAt}`);
} else {
  console.log('Not authenticated');
}
```

### Type definitions

```typescript
import type { UsageData } from 'cc-quota/lib';

interface UsageData {
  planName: string | null;        // 'Max' | 'Pro' | 'Team' | null
  fiveHour: number | null;        // 0-100 (percentage)
  sevenDay: number | null;        // 0-100 (percentage)
  fiveHourResetAt: Date | null;
  sevenDayResetAt: Date | null;
  apiUnavailable?: boolean;       // true if API call failed
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
