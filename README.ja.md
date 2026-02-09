# cc-quota

[English](./README.md) | [日本語](./README.ja.md)

Claude Codeの使用状況（5時間制限と7日間制限）を取得します。

## 機能

- 🔐 自動的な認証情報の検出（macOS Keychainまたはファイルベース）
- ⚡️ TTL付きファイルベースキャッシュ（成功時60秒、失敗時15秒）
- 🎯 プログラム利用のためのシンプルなAPI
- 🖥️ 簡単なステータス確認のためのCLIツール
- 📦 ゼロ依存（Node.js標準ライブラリのみ）
- 🔒 安全なトークン処理（機密データのログ出力なし）

## インストール

```bash
npm install cc-quota
```

## CLI使用方法

### 基本的な使い方（プレーン形式、プログレスバー付き）

```bash
npx cc-quota
# 出力: Max | 5h: [░░░░░░░░░░] 4% | 7d-all: [░░░░░░░░░░] 2% | 7d-sonnet: [░░░░░░░░░░] 1%
```

### 特定の項目を非表示にする

`--hide`オプションを使って不要な項目を非表示にできます（カンマ区切り）：

```bash
# プラン名と7日間全体使用量を非表示
npx cc-quota --hide plan,7d
# 出力: 5h: [░░░░░░░░░░] 4% | 7d-sonnet: [░░░░░░░░░░] 1%

# 5時間使用量のみ表示
npx cc-quota --hide plan,7d,7d-sonnet
# 出力: 5h: [░░░░░░░░░░] 4%

# プラン名と7日間Sonnet使用量のみ表示
npx cc-quota --hide 5h,7d
# 出力: Max | 7d-sonnet: [░░░░░░░░░░] 1%
```

非表示にできる項目：
- `plan` - プラン名（Max、Proなど）
- `5h` - 5時間使用制限
- `7d` - 7日間全体使用制限
- `7d-sonnet` - 7日間Sonnetのみの使用制限

### プログレスバーのカスタマイズ

```bash
# プログレスバーを非表示
npx cc-quota --noBar
# 出力: Max | 5h: 4% | 7d-all: 2% | 7d-sonnet: 1%

# バーの幅をカスタマイズ（デフォルト: 10）
npx cc-quota --barWidth 20
# 出力: Max | 5h: [░░░░░░░░░░░░░░░░░░░░] 4% | ...
```

### JSON形式

```bash
npx cc-quota -f json
# 出力:
# {
#   "planName": "Max",
#   "fiveHour": 4,
#   "sevenDay": 2,
#   "sevenDaySonnet": 1,
#   "fiveHourResetAt": "2026-02-09T06:00:00.087Z",
#   "sevenDayResetAt": "2026-02-15T17:00:00.087Z",
#   "sevenDaySonnetResetAt": "2026-02-15T17:00:00.087Z"
# }
```

### 全CLIオプション

```bash
npx cc-quota [options]

オプション:
  -f, --format <format>     出力形式（plainまたはjson）[デフォルト: plain]
  --noBar                   プログレスバー表示を無効化
  --barWidth <width>        プログレスバーの幅（文字数）[デフォルト: 10]
  --hide <items>            非表示にする項目（カンマ区切り: plan, 5h, 7d, 7d-sonnet）
  -h, --help                ヘルプを表示
  -v, --version             バージョンを表示
```

## ライブラリとしての使用

### 使用状況データの取得

```typescript
import { getUsage } from 'cc-quota/lib';

const usage = await getUsage();

if (usage) {
  console.log(`プラン: ${usage.planName}`);
  console.log(`5時間使用量: ${usage.fiveHour}%`);
  console.log(`7日間全体使用量: ${usage.sevenDay}%`);
  console.log(`7日間Sonnet使用量: ${usage.sevenDaySonnet}%`);
  console.log(`5時間リセット時刻: ${usage.fiveHourResetAt}`);
  console.log(`7日間リセット時刻: ${usage.sevenDayResetAt}`);
  console.log(`7日間Sonnetリセット時刻: ${usage.sevenDaySonnetResetAt}`);
} else {
  console.log('認証されていません');
}
```

### 型定義

```typescript
import type { UsageData } from 'cc-quota/lib';

interface UsageData {
  planName: string | null;           // 'Max' | 'Pro' | 'Team' | null
  fiveHour: number | null;           // 0-100（パーセンテージ）
  sevenDay: number | null;           // 0-100（パーセンテージ、7日間全体使用量）
  sevenDaySonnet: number | null;     // 0-100（パーセンテージ、7日間Sonnetのみ使用量）
  fiveHourResetAt: Date | null;
  sevenDayResetAt: Date | null;
  sevenDaySonnetResetAt: Date | null;
  apiUnavailable?: boolean;          // API呼び出しが失敗した場合true
}
```

### キャッシュ制御

```typescript
import { readCache, writeCache } from 'cc-quota/lib';

// キャッシュを手動で読み込む
const cached = readCache();

// キャッシュをクリア（新しいAPI呼び出しを強制）
import { unlinkSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const cachePath = join(homedir(), '.claude', 'cc-quota', '.usage-cache.json');
if (existsSync(cachePath)) {
  unlinkSync(cachePath);
}
```

## 認証

ライブラリは以下から自動的に認証情報を検出します：

1. **macOS Keychain**（推奨）: `Claude Code-credentials`
2. **ファイルベース**（フォールバック）: `~/.claude/.credentials.json`

Claude Codeにログインしていれば、追加の設定は不要です。

## キャッシュの動作

- **成功時のTTL**: 60秒
- **失敗時のTTL**: 15秒
- **キャッシュの場所**: `~/.claude/cc-quota/.usage-cache.json`

## デバッグモード

`DEBUG`環境変数を設定してデバッグログを有効化：

```bash
DEBUG=cc-quota npx cc-quota
# または
DEBUG=* npx cc-quota
```

以下の詳細ログが出力されます：
- キャッシュのヒット/ミスと有効期限
- 認証情報の読み込み（Keychain vs ファイル）
- APIリクエストとレスポンス
- トラブルシューティング用のエラー詳細

## APIエンドポイント

このライブラリは公式のClaude Code OAuth使用状況APIを使用します：

```
GET https://api.anthropic.com/api/oauth/usage
Authorization: Bearer <token>
anthropic-beta: oauth-2025-04-20
```

## 要件

- Node.js >= 18
- Claude Code認証（ログイン済み）

## ライセンス

MIT
