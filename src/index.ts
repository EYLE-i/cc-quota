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
	name: 'cc-quota',
	description: 'Fetch Claude Code OAuth usage statistics',
	options,
	usage: {
		options: {
			format: 'Output format (plain or json)',
		},
	},
	run: async (ctx: CommandContext<Options, Values>) => {
		const format = (ctx.values.format || 'plain') as 'plain' | 'json';
		const output = await getStatusline({ format });
		console.log(output);
	},
} satisfies Command<Options>;

cli(process.argv.slice(2), command, {
	name: 'cc-quota',
	version: '0.1.1',
	description: 'Fetch Claude Code OAuth usage statistics',
});
