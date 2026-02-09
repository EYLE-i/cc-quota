import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatProgressBar } from '../src/statusline.ts';

describe('formatProgressBar', () => {
	describe('境界値テスト', () => {
		it('0%で完全に空のバーを表示', () => {
			const result = formatProgressBar(0, 10);
			assert.equal(result, '[░░░░░░░░░░]');
		});

		it('100%で完全に埋まったバーを表示', () => {
			const result = formatProgressBar(100, 10);
			assert.equal(result, '[██████████]');
		});

		it('50%で半分埋まったバーを表示', () => {
			const result = formatProgressBar(50, 10);
			assert.equal(result, '[█████░░░░░]');
		});
	});

	describe('四捨五入の動作', () => {
		it('4%で0文字埋まる（0.4 → 0）', () => {
			const result = formatProgressBar(4, 10);
			assert.equal(result, '[░░░░░░░░░░]');
		});

		it('5%で1文字埋まる（0.5 → 1）', () => {
			const result = formatProgressBar(5, 10);
			assert.equal(result, '[█░░░░░░░░░]');
		});

		it('10%で1文字埋まる（1.0 → 1）', () => {
			const result = formatProgressBar(10, 10);
			assert.equal(result, '[█░░░░░░░░░]');
		});

		it('95%で10文字埋まる（9.5 → 10）', () => {
			const result = formatProgressBar(95, 10);
			assert.equal(result, '[██████████]');
		});
	});

	describe('カスタム幅', () => {
		it('幅5で50%を表示', () => {
			const result = formatProgressBar(50, 5);
			assert.equal(result, '[███░░]');
		});

		it('幅20で25%を表示', () => {
			const result = formatProgressBar(25, 20);
			assert.equal(result, '[█████░░░░░░░░░░░░░░░]');
		});

		it('幅1で0%を表示', () => {
			const result = formatProgressBar(0, 1);
			assert.equal(result, '[░]');
		});

		it('幅1で100%を表示', () => {
			const result = formatProgressBar(100, 1);
			assert.equal(result, '[█]');
		});
	});

	describe('デフォルト幅', () => {
		it('幅を指定しない場合、デフォルト10を使用', () => {
			const result = formatProgressBar(50);
			assert.equal(result, '[█████░░░░░]');
		});
	});

	describe('実際の使用例', () => {
		it('5時間制限4%を表示', () => {
			const result = formatProgressBar(4, 10);
			assert.equal(result, '[░░░░░░░░░░]');
		});

		it('7日間制限2%を表示', () => {
			const result = formatProgressBar(2, 10);
			assert.equal(result, '[░░░░░░░░░░]');
		});

		it('7日間制限80%を表示', () => {
			const result = formatProgressBar(80, 10);
			assert.equal(result, '[████████░░]');
		});
	});

	describe('無効な幅の処理', () => {
		it('負の幅は最小値1にクランプされる', () => {
			const result = formatProgressBar(50, -5);
			assert.equal(result, '[█]');
		});

		it('0の幅は最小値1にクランプされる', () => {
			const result = formatProgressBar(100, 0);
			assert.equal(result, '[█]');
		});

		it('小数点の幅は整数に切り下げられる', () => {
			const result = formatProgressBar(50, 5.7);
			assert.equal(result, '[███░░]');
		});
	});
});
