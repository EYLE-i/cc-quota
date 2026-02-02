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
} satisfies ArgOptions;

type Options = typeof options;
type Values = {
	format?: string;
};

const command = {
	name: 'cc-statusline',
	description: 'Claude Code statusline CLI tool',
	options,
	usage: {
		options: {
			format: 'Output format (plain or json)',
		},
	},
	run: (ctx: CommandContext<Options, Values>) => {
		const format = (ctx.values.format || 'plain') as 'plain' | 'json';
		const output = getStatusline({ format });
		console.log(output);
	},
} satisfies Command<Options>;

cli(process.argv.slice(2), command, {
	name: 'cc-statusline',
	version: '0.0.1',
	description: 'Claude Code statusline CLI tool',
});
