#!/usr/bin/env node
import { cli } from 'gunshi';
import type { ArgOptions, Command, CommandContext } from 'gunshi';
import { getStatusline } from './statusline.ts';

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
		const hide = ctx.values.hide ? ctx.values.hide.split(',').map(s => s.trim()) : undefined;
		const output = await getStatusline({ format, bar, barWidth, hide });
		console.log(output);
	},
} satisfies Command<Options>;

cli(process.argv.slice(2), command, {
	name: 'cc-quota',
	version: '0.1.3',
	description: 'Fetch Claude Code OAuth usage statistics',
});
