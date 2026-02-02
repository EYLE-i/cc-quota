import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { CredentialsFile } from './types.ts';

interface Credentials {
	accessToken: string;
	subscriptionType: string | null;
}

/**
 * macOS Keychain から認証情報を取得
 * @returns JSON文字列 or null
 */
function readKeychainCredentials(): string | null {
	if (process.platform !== 'darwin') {
		return null;
	}

	try {
		const output = execFileSync(
			'/usr/bin/security',
			['find-generic-password', '-s', 'Claude Code-credentials', '-w'],
			{
				encoding: 'utf-8',
				timeout: 5000,
				stdio: ['ignore', 'pipe', 'ignore'], // エラー出力を抑制
			},
		);
		return output.trim();
	} catch {
		return null;
	}
}

/**
 * ファイルから認証情報を取得（レガシー・フォールバック）
 * @returns JSON文字列 or null
 */
function readFileCredentials(): string | null {
	try {
		const credentialsPath = join(homedir(), '.claude', '.credentials.json');
		const content = readFileSync(credentialsPath, 'utf-8');
		return content;
	} catch {
		return null;
	}
}

/**
 * JSON文字列をパースして認証情報を抽出
 */
function parseCredentialsData(jsonStr: string): Credentials | null {
	try {
		const data: CredentialsFile = JSON.parse(jsonStr);
		const oauth = data.claudeAiOauth;

		if (!oauth?.accessToken) {
			return null;
		}

		// 有効期限チェック
		if (oauth.expiresAt && oauth.expiresAt < Date.now()) {
			return null;
		}

		return {
			accessToken: oauth.accessToken,
			subscriptionType: oauth.subscriptionType || null,
		};
	} catch {
		return null;
	}
}

/**
 * 認証情報を取得（Keychain → ファイル のフォールバック）
 */
export function readCredentials(): Credentials | null {
	// Keychainから取得を試みる
	const keychainData = readKeychainCredentials();
	if (keychainData) {
		const keychainCreds = parseCredentialsData(keychainData);
		if (keychainCreds) {
			// subscriptionType がない場合、ファイルから補完を試みる
			if (!keychainCreds.subscriptionType) {
				const fileData = readFileCredentials();
				if (fileData) {
					const fileCreds = parseCredentialsData(fileData);
					if (fileCreds?.subscriptionType) {
						keychainCreds.subscriptionType = fileCreds.subscriptionType;
					}
				}
			}
			return keychainCreds;
		}
	}

	// ファイルから取得を試みる
	const fileData = readFileCredentials();
	if (fileData) {
		return parseCredentialsData(fileData);
	}

	return null;
}
