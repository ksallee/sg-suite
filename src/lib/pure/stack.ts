/**
 * The two drawings of how the sg- projects build on each other: a layered diagram (base at the
 * bottom) and an upside-down tree (one row per project, base last). Pure: no DOM, no I/O. The
 * relations themselves are data, in `./projects`.
 */

import type { Relation, RelationKind } from './projects.ts';

export const edgeKey = (from: string, to: string): string => `${from}>${to}`;

const parentOf = (name: string, rels: Relation[]): Relation | undefined => rels.find((r) => r.from === name);

/** The project, then what it builds on, down to the base. Empty for no project. */
export function pathToBase(name: string | null, rels: Relation[]): string[] {
	const path: string[] = [];
	for (let n = name; n && !path.includes(n); n = parentOf(n, rels)?.to ?? null) path.push(n);
	return path;
}

/** The edge keys between consecutive projects of a path. */
export function edgesOnPath(path: string[]): Set<string> {
	return new Set(path.slice(0, -1).map((n, i) => edgeKey(n, path[i + 1])));
}

/** The layer: 0 for the base, one up per 'on', the same layer for a port. */
function layerOf(name: string, rels: Relation[]): number {
	const p = parentOf(name, rels);
	if (!p) return 0;
	return layerOf(p.to, rels) + (p.kind === 'on' ? 1 : 0);
}

export interface Box {
	width: number;
	nodeW: number;
	nodeH: number;
	gapY: number;
	pad: number;
	/** Where a port edge meets a node's side, from the node's top. Default: half way. */
	sideY?: number;
}

export interface PlacedNode {
	name: string;
	layer: number;
	slot: number;
	/** Centre, in the box's units. */
	x: number;
	/** Top edge. */
	y: number;
}

export interface PlacedEdge {
	key: string;
	from: string;
	to: string;
	kind: RelationKind;
	/** Lower layer of the two, for timing the draw-in. */
	layer: number;
	/** SVG path, drawn from the node built on to the node built on it. */
	d: string;
}

/**
 * Layers bottom up, nodes centred in each layer on one shared spacing, so equal layers line up.
 * A port sits right after what it ports. `names` gives the order within a layer.
 */
export function layered(
	names: string[],
	rels: Relation[],
	box: Box
): { nodes: PlacedNode[]; edges: PlacedEdge[]; height: number; layers: number } {
	const byLayer: string[][] = [];
	for (const n of names) {
		const l = layerOf(n, rels);
		(byLayer[l] ??= []).push(n);
	}
	for (const [l, row] of byLayer.entries()) {
		const ports = row.filter((n) => parentOf(n, rels)?.kind === 'port');
		const rest = row.filter((n) => !ports.includes(n));
		for (const p of ports) {
			const at = rest.indexOf(parentOf(p, rels)!.to);
			rest.splice(at < 0 ? rest.length : at + 1, 0, p);
		}
		byLayer[l] = rest;
	}

	const layers = byLayer.length;
	const widest = Math.max(...byLayer.map((r) => r.length));
	const spacing = widest > 1 ? (box.width - 2 * box.pad - box.nodeW) / (widest - 1) : 0;
	const nodes: PlacedNode[] = byLayer.flatMap((row, layer) =>
		row.map((name, slot) => ({
			name,
			layer,
			slot,
			x: box.width / 2 + (slot - (row.length - 1) / 2) * spacing,
			y: box.pad + (layers - 1 - layer) * (box.nodeH + box.gapY)
		}))
	);
	const at = new Map(nodes.map((n) => [n.name, n]));
	const sideY = box.sideY ?? box.nodeH / 2;

	const edges: PlacedEdge[] = rels.map((r) => {
		const parent = at.get(r.to)!;
		const child = at.get(r.from)!;
		let d: string;
		if (r.kind === 'port' && parent.layer === child.layer) {
			const dir = Math.sign(child.x - parent.x) || 1;
			const y = parent.y + sideY;
			d = `M${parent.x + (dir * box.nodeW) / 2} ${y} H${child.x - (dir * box.nodeW) / 2}`;
		} else {
			const y1 = parent.y;
			const y2 = child.y + box.nodeH;
			const k = (y1 - y2) / 2;
			d = `M${parent.x} ${y1} C${parent.x} ${y1 - k} ${child.x} ${y2 + k} ${child.x} ${y2}`;
		}
		return { key: edgeKey(r.from, r.to), from: r.from, to: r.to, kind: r.kind, layer: parent.layer, d };
	});

	return { nodes, edges, height: 2 * box.pad + layers * box.nodeH + (layers - 1) * box.gapY, layers };
}

export interface TreeRow {
	name: string;
	/** Indent: 0 for the base. */
	lane: number;
	row: number;
}

/**
 * One row per project, each parent below its children, the base last. Children with the largest
 * branch go first (on top); a port goes last, right above what it ports.
 */
export function treeRows(names: string[], rels: Relation[]): TreeRow[] {
	const kids = (n: string) => rels.filter((r) => r.to === n);
	const size = (n: string): number => 1 + kids(n).reduce((s, r) => s + size(r.from), 0);
	const order = (n: string) =>
		kids(n)
			.map((r, i) => ({ r, i, s: size(r.from) }))
			.sort((a, b) => Number(a.r.kind === 'port') - Number(b.r.kind === 'port') || b.s - a.s || a.i - b.i)
			.map((k) => k.r.from);

	const out: Omit<TreeRow, 'row'>[] = [];
	const emit = (n: string, lane: number): void => {
		for (const c of order(n)) emit(c, lane + 1);
		out.push({ name: n, lane });
	};
	for (const root of names.filter((n) => !parentOf(n, rels))) emit(root, 0);
	return out.map((r, row) => ({ ...r, row }));
}

/** The tree's connectors: from the parent's dot up its lane, then across to the child's dot. */
export function treeEdges(
	rows: TreeRow[],
	rels: Relation[],
	g: { rowH: number; laneW: number; x0: number; radius: number }
): PlacedEdge[] {
	const at = new Map(rows.map((r) => [r.name, r]));
	const x = (lane: number) => g.x0 + lane * g.laneW;
	const y = (row: number) => row * g.rowH + g.rowH / 2;
	return rels.map((r) => {
		const p = at.get(r.to)!;
		const c = at.get(r.from)!;
		const R = Math.min(g.radius, g.laneW);
		const d = `M${x(p.lane)} ${y(p.row)} V${y(c.row) + R} Q${x(p.lane)} ${y(c.row)} ${x(p.lane) + R} ${y(c.row)} H${x(c.lane)}`;
		return { key: edgeKey(r.from, r.to), from: r.from, to: r.to, kind: r.kind, layer: p.lane, d };
	});
}
