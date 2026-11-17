import { describe, expect, it } from 'vitest';
import type { Relation } from './projects.ts';
import { projects, relations } from './projects.ts';
import { layered, treeRows } from './stack.ts';
import { HOP, lit, litPlan, nodeDelays, rowDelays, walk } from './timing.ts';

const rels: Relation[] = [
	{ from: 'b', to: 'base', kind: 'on' },
	{ from: 'c', to: 'b', kind: 'on' },
	{ from: 'p', to: 'b', kind: 'port' }
];

describe('litPlan', () => {
	const path = ['c', 'b', 'base'];

	it('lights a path, each edge with its height above the base in hops', () => {
		const plan = litPlan([path]);
		expect([...plan.nodes].sort()).toEqual(['b', 'base', 'c']);
		expect(plan.edges.get('b>base')).toBe(0);
		expect(plan.edges.get('c>b')).toBe(1);
	});

	it('joins several paths, a shared edge once', () => {
		const plan = litPlan([path, ['p', 'b', 'base']]);
		expect([...plan.nodes].sort()).toEqual(['b', 'base', 'c', 'p']);
		expect([...plan.edges]).toEqual([
			['c>b', 1],
			['b>base', 0],
			['p>b', 1]
		]);
	});

	it('is empty with no path', () => {
		const plan = litPlan([]);
		expect(plan.nodes.size + plan.edges.size).toBe(0);
	});
});

describe('walk', () => {
	const m = (o: Record<string, number>) => new Map(Object.entries(o));

	it('leaves alone what stays lit, and draws what is new from where the light stops', () => {
		expect(walk(m({ 'b>base': 0 }), m({ 'b>base': 0, 'c>b': 1 }))).toEqual(m({ 'c>b': 0 }));
	});

	it('draws from the base up, a hop at a time, when nothing was lit', () => {
		expect(walk(m({}), m({ 'b>base': 0, 'c>b': 1 }))).toEqual(m({ 'b>base': 0, 'c>b': HOP }));
	});

	it('retracts from the top down when the new path is lower', () => {
		expect(walk(m({ 'b>base': 0, 'c>b': 1, 'd>c': 2 }), m({ 'b>base': 0 }))).toEqual(m({ 'd>c': 0, 'c>b': HOP }));
	});

	it('shrinks to where two paths meet, then grows up the new one', () => {
		expect(walk(m({ 'b>base': 0, 'c>b': 1 }), m({ 'b>base': 0, 'p>b': 1 }))).toEqual(m({ 'c>b': 0, 'p>b': HOP }));
		expect(walk(m({ 'b>base': 0, 'c>b': 1 }), m({ 'x>base': 0 }))).toEqual(
			m({ 'c>b': 0, 'b>base': HOP, 'x>base': 2 * HOP })
		);
	});

	it('moves nothing when the lit path is the same', () => {
		expect(walk(m({ 'b>base': 0, 'c>b': 1 }), m({ 'b>base': 0, 'c>b': 1 })).size).toBe(0);
	});
});

describe('lit', () => {
	it('lights the hovered path, dims the rest, and lights every card on it', () => {
		const l = lit('c', ['p'], rels);
		expect([...l.nodes].sort()).toEqual(['b', 'base', 'c']);
		expect([...l.cards].sort()).toEqual(['b', 'base', 'c']);
		expect(l.dim).toBe(true);
	});

	it('lights the paths of the cards being read, but only those cards, and dims nothing', () => {
		const l = lit(null, ['c', 'p'], rels);
		expect([...l.nodes].sort()).toEqual(['b', 'base', 'c', 'p']);
		expect([...l.cards].sort()).toEqual(['c', 'p']);
		expect(l.dim).toBe(false);
	});

	it('lights nothing above the first card', () => {
		const l = lit(null, [], rels);
		expect(l.nodes.size + l.edges.size + l.cards.size).toBe(0);
	});
});

describe('nodeDelays', () => {
	const box = { width: 1200, nodeW: 216, nodeH: 140, gapY: 72, pad: 22 };
	const { nodes } = layered(
		projects.map((p) => p.name),
		relations,
		box
	);
	const d = nodeDelays(nodes);

	it('starts the base, then each layer 300ms later', () => {
		expect(d.get('sg-groundtruth')).toBe(80);
		const layer1 = nodes.filter((n) => n.layer === 1).map((n) => d.get(n.name)!);
		expect(Math.min(...layer1)).toBeGreaterThanOrEqual(380);
		expect(Math.max(...layer1)).toBeLessThan(680);
	});

	it('brings the middle of a layer in before its ends', () => {
		const top = nodes.filter((n) => n.layer === 2).sort((a, b) => a.slot - b.slot);
		const [end, mid] = [d.get(top[0].name)!, d.get(top[1].name)!];
		expect(mid).toBeLessThan(end);
		expect(d.get(top[0].name)).toBe(d.get(top[3].name));
	});
});

describe('rowDelays', () => {
	const rows = treeRows(
		projects.map((p) => p.name),
		relations
	);
	const d = rowDelays(rows, relations);

	it('starts the base row, then each lane 300ms later', () => {
		expect(d.get('sg-groundtruth')).toBe(60);
		expect(d.get('sg-comfyui')).toBe(360);
	});

	it('brings the nearer child of a parent in first, the gap capped at four rows', () => {
		expect(d.get('sg-comfyui')!).toBeLessThan(d.get('sg-mockgun')!);
		expect(d.get('sg-mockgun')!).toBeLessThan(d.get('sg-widgets')!);
		expect(d.get('sg-notes')).toBe(60 + 2 * 300 + 4 * 36);
	});
});
