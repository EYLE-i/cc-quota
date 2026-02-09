import { getUsage } from './usage.ts';
import type { UsageData } from './types.ts';

export interface StatuslineOptions {
	format?: 'plain' | 'json';
	bar?: boolean; // プログレスバー表示の有無
	barWidth?: number; // バーの文字幅
	hide?: string[]; // 非表示にする項目キーの配列
}

/**
 * プログレスバーを描画する
 * @param percentage 0-100の値
 * @param width バーの文字幅
 * @returns [████░░░░░░] のような形式の文字列
 */
function formatProgressBar(percentage: number, width: number = 10): string {
	const filled = Math.round((percentage / 100) * width);
	const empty = width - filled;
	const filledBlock = '█'.repeat(filled);
	const emptyBlock = '░'.repeat(empty);
	return `[${filledBlock}${emptyBlock}]`;
}

export async function getStatusline(
	options: StatuslineOptions = {},
): Promise<string> {
	const { format = 'plain', bar = true, barWidth = 10, hide } = options;

	// 使用状況データを取得
	const usageData = await getUsage();

	if (format === 'json') {
		return formatJson(usageData);
	}

	return formatPlain(usageData, { bar, barWidth, hide });
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
function formatPlain(
	data: UsageData | null,
	options: { bar: boolean; barWidth: number; hide?: string[] } = { bar: true, barWidth: 10 },
): string {
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
	const hideList = options.hide || [];

	if (data.planName && !hideList.includes('plan')) {
		parts.push(data.planName);
	}

	if (data.fiveHour !== null && !hideList.includes('5h')) {
		const barStr = options.bar
			? `${formatProgressBar(data.fiveHour, options.barWidth)} `
			: '';
		parts.push(`5h: ${barStr}${data.fiveHour}%`);
	}

	if (data.sevenDay !== null && !hideList.includes('7d')) {
		const barStr = options.bar
			? `${formatProgressBar(data.sevenDay, options.barWidth)} `
			: '';
		parts.push(`7d-all: ${barStr}${data.sevenDay}%`);
	}

	if (data.sevenDaySonnet !== null && !hideList.includes('7d-sonnet')) {
		const barStr = options.bar
			? `${formatProgressBar(data.sevenDaySonnet, options.barWidth)} `
			: '';
		parts.push(`7d-sonnet: ${barStr}${data.sevenDaySonnet}%`);
	}

	return parts.length > 0 ? parts.join(' | ') : 'No usage data';
}
