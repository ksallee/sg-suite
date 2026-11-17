import { describe, expect, it } from 'vitest';
import { inView, passed } from './spy.ts';

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
