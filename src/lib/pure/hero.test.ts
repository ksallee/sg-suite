import { describe, expect, it } from 'vitest';
import { projects } from './projects.ts';
import { HERO, heroLayout, titleGrid, cqi } from './hero.ts';

const layout = heroLayout(projects.map((p) => p.name));
const top = layout.nodes.filter((n) => n.layer === layout.layers - 1).sort((a, b) => a.x - b.x);

describe('heroLayout', () => {
	it('lays the hero out in its own box: three layers, the apps on top', () => {
		expect(layout.layers).toBe(3);
		expect(top.map((n) => n.name)).toEqual(['sg-notes', 'sg-onset', 'sg-fields-setup', 'sg-task-templates', 'sg-bids']);
		for (const n of layout.nodes) {
			expect(n.x - HERO.nodeW / 2).toBeGreaterThanOrEqual(0);
			expect(n.x + HERO.nodeW / 2).toBeLessThanOrEqual(HERO.width);
		}
	});
});

describe('titleGrid', () => {
	const g = titleGrid(layout);

	it('spans the title from the first top node’s left edge to the right edge of the one before last', () => {
		expect(g.left).toBeCloseTo(top[0].x - HERO.nodeW / 2);
		expect(g.titleW).toBeCloseTo(top[top.length - 2].x + HERO.nodeW / 2 - g.left);
	});

	it('gives the line the last column, and keeps the grid symmetric', () => {
		expect(g.lineW).toBe(HERO.nodeW);
		expect(top[top.length - 1].x + HERO.nodeW / 2 + g.left).toBeCloseTo(HERO.width);
	});
});

describe('cqi', () => {
	it('turns viewBox units into a share of the hero’s width', () => {
		expect(cqi(HERO.width / 4)).toBe('25.000cqi');
		expect(cqi(0)).toBe('0.000cqi');
	});
});
