import * as https from 'node:https';
import type { UsageApiResponse, UsageData } from './types.ts';
import { readCredentials } from './credentials.ts';
import { readCache, writeCache } from './cache.ts';
import { logDebug } from './utils.ts';

// Re-export types for library users
export type { UsageData, UsageApiResponse } from './types.ts';
export { readCache, writeCache } from './cache.ts';

/**
 * Usage API を呼び出す
 * @param accessToken アクセストークン
 * @returns APIレスポンス or null
 */
function fetchUsageApi(accessToken: string): Promise<UsageApiResponse | null> {
	return new Promise((resolve) => {
		const options = {
			hostname: 'api.anthropic.com',
			path: '/api/oauth/usage',
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'anthropic-beta': 'oauth-2025-04-20',
			},
			timeout: 5000,
		};

		const req = https.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				if (res.statusCode !== 200) {
					logDebug(`API request failed with status ${res.statusCode}`);
					resolve(null);
					return;
				}

				try {
					const parsed = JSON.parse(data) as UsageApiResponse;
					logDebug('API request successful');
					resolve(parsed);
				} catch (error) {
					logDebug('Failed to parse API response', error);
					resolve(null);
				}
			});
		});

		req.on('error', (error) => {
			logDebug('API request error', error);
			resolve(null);
		});

		req.on('timeout', () => {
			logDebug('API request timeout');
			req.destroy();
			resolve(null);
		});

		req.end();
	});
}

/**
 * subscriptionType からプラン名を取得
 */
function getPlanName(subscriptionType: string | null): string | null {
	if (!subscriptionType) return null;

	const lower = subscriptionType.toLowerCase();
	if (lower.includes('max')) return 'Max';
	if (lower.includes('pro')) return 'Pro';
	if (lower.includes('team')) return 'Team';

	return null;
}

/**
 * utilization 値をパース（0-100のパーセンテージ）
 */
function parseUtilization(value: number | undefined): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value)) return null;
	if (value < 0 || value > 100) return null;
	return Math.round(value);
}

/**
 * ISO 8601 文字列を Date オブジェクトに変換
 */
function parseDate(dateStr: string | undefined): Date | null {
	if (!dateStr) return null;
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return null;
		return date;
	} catch {
		return null;
	}
}

/**
 * 使用状況データを取得（キャッシュ優先）
 */
export async function getUsage(): Promise<UsageData | null> {
	// キャッシュ確認
	const cached = readCache();
	if (cached) {
		return cached;
	}

	// 認証情報取得
	const credentials = readCredentials();
	if (!credentials) {
		return null;
	}

	const planName = getPlanName(credentials.subscriptionType);

	// API呼び出し
	const response = await fetchUsageApi(credentials.accessToken);
	if (!response) {
		// API失敗時のデータをキャッシュ
		const failureData: UsageData = {
			planName,
			fiveHour: null,
			sevenDay: null,
			fiveHourResetAt: null,
			sevenDayResetAt: null,
			apiUnavailable: true,
		};
		writeCache(failureData);
		return failureData;
	}

	// レスポンスをパース
	const usageData: UsageData = {
		planName,
		fiveHour: parseUtilization(response.five_hour?.utilization),
		sevenDay: parseUtilization(response.seven_day?.utilization),
		fiveHourResetAt: parseDate(response.five_hour?.resets_at),
		sevenDayResetAt: parseDate(response.seven_day?.resets_at),
	};

	// キャッシュに書き込み
	writeCache(usageData);

	return usageData;
}
