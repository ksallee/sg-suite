import { describe, expect, it } from 'vitest';
import { projects, relations } from './projects.ts';
import { pathToBase, edgesOnPath, layered, treeRows, edgeKey } from './stack.ts';

const names = projects.map((p) => p.name);

describe('relations', () => {
	it('name only projects that exist, and give every project but the base one parent', () => {
		for (const r of relations) {
			expect(names, r.from).toContain(r.from);
			expect(names, r.to).toContain(r.to);
		}
		const children = relations.map((r) => r.from);
		expect(new Set(children).size).toBe(children.length);
		expect(names.filter((n) => !children.includes(n))).toEqual(['sg-groundtruth']);
	});
});

describe('pathToBase', () => {
	it('walks from a project down to the base', () => {
		expect(pathToBase('sg-notes', relations)).toEqual(['sg-notes', 'sg-widgets', 'sg-groundtruth']);
		expect(pathToBase('sg-widgets-qt', relations)).toEqual(['sg-widgets-qt', 'sg-widgets', 'sg-groundtruth']);
		expect(pathToBase('sg-groundtruth', relations)).toEqual(['sg-groundtruth']);
	});

	it('gives nothing for no project', () => {
		expect(pathToBase(null, relations)).toEqual([]);
	});

	it('gives the edges along the path', () => {
		expect(edgesOnPath(['sg-notes', 'sg-widgets', 'sg-groundtruth'])).toEqual(
			new Set([edgeKey('sg-notes', 'sg-widgets'), edgeKey('sg-widgets', 'sg-groundtruth')])
		);
	});
});

describe('layered', () => {
	const box = { width: 1200, nodeW: 200, nodeH: 140, gapY: 80, pad: 20 };
	const out = layered(names, relations, box);
	const at = (n: string) => out.nodes.find((p) => p.name === n)!;

	it('places the base alone in the bottom layer, a port beside what it ports', () => {
		expect(at('sg-groundtruth').layer).toBe(0);
		expect(at('sg-widgets').layer).toBe(1);
		expect(at('sg-widgets-qt').layer).toBe(1);
		expect(at('sg-notes').layer).toBe(2);
		expect(at('sg-widgets-qt').slot).toBe(at('sg-widgets').slot + 1);
	});

	it('draws the base at the bottom and keeps every node inside the box', () => {
		expect(at('sg-groundtruth').y).toBeGreaterThan(at('sg-widgets').y);
		expect(at('sg-widgets').y).toBeGreaterThan(at('sg-notes').y);
		for (const n of out.nodes) {
			expect(n.x - box.nodeW / 2).toBeGreaterThanOrEqual(0);
			expect(n.x + box.nodeW / 2).toBeLessThanOrEqual(box.width);
			expect(n.y + box.nodeH).toBeLessThanOrEqual(out.height);
		}
	});

	it('gives one edge per relation, each starting at the lower node', () => {
		expect(out.edges.length).toBe(relations.length);
		const e = out.edges.find((e) => e.key === edgeKey('sg-notes', 'sg-widgets'))!;
		expect(e.d.startsWith(`M${at('sg-widgets').x} ${at('sg-widgets').y}`)).toBe(true);
	});
});

describe('treeRows', () => {
	const rows = treeRows(names, relations);

	it('lists every project once, the base last, each parent below its children', () => {
		expect(rows.map((r) => r.name).sort()).toEqual([...names].sort());
		expect(rows.at(-1)).toMatchObject({ name: 'sg-groundtruth', lane: 0 });
		for (const r of rows) {
			const rel = relations.find((x) => x.from === r.name);
			if (!rel) continue;
			const parent = rows.find((p) => p.name === rel.to)!;
			expect(parent.row, r.name).toBeGreaterThan(r.row);
			expect(r.lane, r.name).toBe(parent.lane + 1);
		}
	});

	it('puts the deepest branch on top and a port next to what it ports', () => {
		expect(rows[0].name).toBe('sg-notes');
		const qt = rows.find((r) => r.name === 'sg-widgets-qt')!;
		const widgets = rows.find((r) => r.name === 'sg-widgets')!;
		expect(qt.row).toBe(widgets.row - 1);
	});
});
