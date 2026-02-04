// 認証情報ファイルの構造
export interface CredentialsFile {
	claudeAiOauth?: {
		accessToken?: string;
		refreshToken?: string;
		subscriptionType?: string;
		expiresAt?: number; // Unixミリ秒
		scopes?: string[];
	};
}

// Usage API のレスポンス
export interface UsageApiResponse {
	five_hour?: {
		utilization?: number;
		resets_at?: string;
	};
	seven_day?: {
		utilization?: number;
		resets_at?: string;
	};
	seven_day_sonnet?: {
		utilization?: number;
		resets_at?: string;
	};
}

// アプリケーションで使用する使用状況データ
export interface UsageData {
	planName: string | null; // 'Max' | 'Pro' | 'Team' | null
	fiveHour: number | null; // 0-100
	sevenDay: number | null; // 0-100
	sevenDaySonnet: number | null; // 0-100
	fiveHourResetAt: Date | null;
	sevenDayResetAt: Date | null;
	sevenDaySonnetResetAt: Date | null;
	apiUnavailable?: boolean;
}

// キャッシュファイルの構造
export interface CacheFile {
	data: UsageData;
	timestamp: number;
}
