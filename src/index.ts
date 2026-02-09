#!/usr/bin/env node
import { cli } from 'gunshi';
import type { ArgOptions, Command, CommandContext } from 'gunshi';
import { getStatusline } from './statusline.ts';

// 有効なhideオプションの定義
const VALID_HIDE_OPTIONS = ['plan', '5h', '7d', '7d-sonnet'] as const;

/**
 * hideオプション文字列をパースしてバリデーションする
 * @param hideString カンマ区切りのhideオプション文字列
 * @param warn 警告メッセージを出力するかどうか
 * @returns パース済みの有効なhideオプション配列、または undefined
 */
export function parseHideOptions(
	hideString: string | undefined,
	warn = true,
): string[] | undefined {
	if (!hideString) {
		return undefined;
	}

	return hideString
		.split(',')
		.map(s => s.trim())
		.filter(item => item.length > 0) // 空文字列を除外
		.filter(item => {
			if (!VALID_HIDE_OPTIONS.includes(item as any)) {
				if (warn) {
					console.warn(
						`Warning: Unknown hide option "${item}" ignored. Valid options: ${VALID_HIDE_OPTIONS.join(', ')}`,
					);
				}
				return false;
			}
			return true;
		});
}

const options = {
	format: {
		type: 'string',
		short: 'f',
		default: 'plain',
	},
	noBar: {
		type: 'boolean',
	},
	barWidth: {
		type: 'number',
		default: 10,
	},
	hide: {
		type: 'string',
	},
} satisfies ArgOptions;

type Options = typeof options;
type Values = {
	format?: string;
	noBar?: boolean;
	barWidth?: number;
	hide?: string;
};

const command = {
	name: 'cc-quota',
	description: 'Fetch Claude Code OAuth usage statistics',
	options,
	usage: {
		options: {
			format: 'Output format (plain or json)',
			noBar: 'Disable progress bar display',
			barWidth: 'Progress bar width in characters (default: 10)',
			hide: 'Comma-separated list of items to hide (plan, 5h, 7d, 7d-sonnet)',
		},
	},
	run: async (ctx: CommandContext<Options, Values>) => {
		const format = (ctx.values.format || 'plain') as 'plain' | 'json';
		const bar = !ctx.values.noBar; // noBarがtrueならbar表示OFF
		const barWidth = ctx.values.barWidth ?? 10;
		const hide = parseHideOptions(ctx.values.hide);

		const output = await getStatusline({ format, bar, barWidth, hide });
		console.log(output);
	},
} satisfies Command<Options>;

cli(process.argv.slice(2), command, {
	name: 'cc-quota',
	version: '0.1.3',
	description: 'Fetch Claude Code OAuth usage statistics',
});
