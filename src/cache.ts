import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import type { CacheFile, UsageData } from './types.ts';

const CACHE_DIR = join(homedir(), '.claude', 'cc-statusline');
const CACHE_PATH = join(CACHE_DIR, '.usage-cache.json');
const SUCCESS_TTL_MS = 60 * 1000; // 60秒
const FAILURE_TTL_MS = 15 * 1000; // 15秒

/**
 * キャッシュからデータを読み取る
 * @returns 有効なキャッシュデータ or null
 */
export function readCache(): UsageData | null {
	try {
		const content = readFileSync(CACHE_PATH, 'utf-8');
		const cache: CacheFile = JSON.parse(content);

		// TTL判定
		const ttl = cache.data.apiUnavailable ? FAILURE_TTL_MS : SUCCESS_TTL_MS;
		if (Date.now() - cache.timestamp > ttl) {
			return null;
		}

		// Date オブジェクトの復元
		return {
			...cache.data,
			fiveHourResetAt: cache.data.fiveHourResetAt
				? new Date(cache.data.fiveHourResetAt)
				: null,
			sevenDayResetAt: cache.data.sevenDayResetAt
				? new Date(cache.data.sevenDayResetAt)
				: null,
		};
	} catch {
		return null;
	}
}

/**
 * キャッシュにデータを書き込む
 */
export function writeCache(data: UsageData): void {
	try {
		// ディレクトリが存在しない場合は作成
		mkdirSync(dirname(CACHE_PATH), { recursive: true });

		const cache: CacheFile = {
			data,
			timestamp: Date.now(),
		};

		writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
	} catch {
		// キャッシュ書き込み失敗は無視
	}
}
