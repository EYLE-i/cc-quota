import { getUsage } from './usage.ts';
import type { UsageData } from './types.ts';

export interface StatuslineOptions {
	format?: 'plain' | 'json';
}

export async function getStatusline(
	options: StatuslineOptions = {},
): Promise<string> {
	const { format = 'plain' } = options;

	// 使用状況データを取得
	const usageData = await getUsage();

	if (format === 'json') {
		return formatJson(usageData);
	}

	return formatPlain(usageData);
}

/**
 * JSON形式でフォーマット
 */
function formatJson(data: UsageData | null): string {
	if (!data) {
		return JSON.stringify(
			{
				error: 'Not authenticated',
			},
			null,
			2,
		);
	}

	return JSON.stringify(data, null, 2);
}

/**
 * Plain形式でフォーマット
 */
function formatPlain(data: UsageData | null): string {
	if (!data) {
		return 'Not authenticated';
	}

	if (data.apiUnavailable) {
		const parts = [];
		if (data.planName) {
			parts.push(data.planName);
		}
		parts.push('API unavailable');
		return parts.join(' | ');
	}

	const parts = [];

	if (data.planName) {
		parts.push(data.planName);
	}

	if (data.fiveHour !== null) {
		parts.push(`5h: ${data.fiveHour}%`);
	}

	if (data.sevenDay !== null) {
		parts.push(`7d: ${data.sevenDay}%`);
	}

	return parts.length > 0 ? parts.join(' | ') : 'No usage data';
}
