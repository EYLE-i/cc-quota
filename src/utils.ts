/**
 * デバッグログを出力する
 * DEBUG=cc-quota または DEBUG=* 環境変数が設定されている場合のみ出力
 */
export function logDebug(message: string, error?: unknown): void {
	const debug = process.env.DEBUG;
	if (debug === 'cc-quota' || debug === '*') {
		console.error(`[cc-quota] ${message}`, error || '');
	}
}
