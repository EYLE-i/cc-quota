import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseHideOptions } from '../src/index.ts';

describe('parseHideOptions', () => {
	it('undefined入力でundefinedを返す', () => {
		const result = parseHideOptions(undefined, false);
		assert.equal(result, undefined);
	});

	it('空文字列入力でundefinedを返す', () => {
		const result = parseHideOptions('', false);
		assert.equal(result, undefined);
	});

	it('有効な単一項目をパースする', () => {
		const result = parseHideOptions('plan', false);
		assert.deepEqual(result, ['plan']);
	});

	it('有効な複数項目をパースする', () => {
		const result = parseHideOptions('plan,5h,7d', false);
		assert.deepEqual(result, ['plan', '5h', '7d']);
	});

	it('全ての有効な項目をパースする', () => {
		const result = parseHideOptions('plan,5h,7d,7d-sonnet', false);
		assert.deepEqual(result, ['plan', '5h', '7d', '7d-sonnet']);
	});

	it('前後の空白を削除する', () => {
		const result = parseHideOptions(' plan , 5h , 7d ', false);
		assert.deepEqual(result, ['plan', '5h', '7d']);
	});

	it('空文字列項目をフィルタリングする', () => {
		const result = parseHideOptions('plan,,5h, ,7d', false);
		assert.deepEqual(result, ['plan', '5h', '7d']);
	});

	it('無効な項目を除外する', () => {
		const result = parseHideOptions('plan,invalid,5h', false);
		assert.deepEqual(result, ['plan', '5h']);
	});

	it('無効な項目のみの場合は空配列を返す', () => {
		const result = parseHideOptions('invalid,unknown', false);
		assert.deepEqual(result, []);
	});

	it('大文字小文字を区別する（無効として扱う）', () => {
		const result = parseHideOptions('PLAN,5H', false);
		assert.deepEqual(result, []);
	});

	it('複雑な入力をパースする', () => {
		const result = parseHideOptions(' plan , , invalid, 5h , 7d-sonnet ', false);
		assert.deepEqual(result, ['plan', '5h', '7d-sonnet']);
	});
});
