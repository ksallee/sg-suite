import { describe, expect, it } from 'vitest';
import { inView, passed, readingLine } from './spy.ts';

// Cards as a page lays them out: two in the first row, one row each after.
const spans = [
	{ name: 'a', top: 100, bottom: 500 },
	{ name: 'b', top: 100, bottom: 520 },
	{ name: 'c', top: 700, bottom: 1100 },
	{ name: 'd', top: 700, bottom: 1080 },
	{ name: 'e', top: 1300, bottom: 1600 }
];

describe('inView', () => {
	it('gives nothing while the reading line is above the first card', () => {
		expect(inView(spans, 60, false)).toEqual([]);
	});

	it('gives the row the reading line crosses, in page order', () => {
		expect(inView(spans, 300, false)).toEqual(['a', 'b']);
		expect(inView(spans, 700, false)).toEqual(['c', 'd']);
	});

	it('keeps the last row passed while the line is in a gap', () => {
		expect(inView(spans, 600, false)).toEqual(['a', 'b']);
		expect(inView(spans, 1200, false)).toEqual(['c', 'd']);
	});

	it('gives the last row at the end of the page, wherever the line is', () => {
		expect(inView(spans, 900, true)).toEqual(['e']);
	});

	it('gives nothing for no cards', () => {
		expect(inView([], 300, true)).toEqual([]);
	});
});

describe('passed', () => {
	it('gives every card whose top has reached the line, in page order', () => {
		expect(passed(spans, 700)).toEqual(['a', 'b', 'c', 'd']);
	});

	it('gives nothing above the first card, and every card past the last', () => {
		expect(passed(spans, 60)).toEqual([]);
		expect(passed(spans, 5000)).toEqual(['a', 'b', 'c', 'd', 'e']);
	});
});

describe('readingLine', () => {
	it('sits near the top, so a panel a link lands on is the one read, not the one below', () => {
		// A link lands a panel 24px down; the shortest panel is 285px, so the next starts by 309px.
		for (const h of [720, 900, 1200, 1600]) {
			const line = readingLine(h);
			const spans = [
				{ name: 'clicked', top: 24, bottom: 309 },
				{ name: 'next', top: 333, bottom: 700 }
			];
			expect(inView(spans, line, false), `${h}px`).toEqual(['clicked']);
		}
	});

	it('stays above the middle of a short window', () => {
		expect(readingLine(300)).toBe(120);
	});
});
