export interface StatuslineOptions {
	format?: 'plain' | 'json';
}

export function getStatusline(options: StatuslineOptions = {}): string {
	const { format = 'plain' } = options;

	// プレースホルダー実装
	const statusData = {
		status: 'ready',
		message: 'Claude Code statusline',
	};

	if (format === 'json') {
		return JSON.stringify(statusData, null, 2);
	}

	return `[${statusData.status}] ${statusData.message}`;
}
