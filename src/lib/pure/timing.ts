/**
 * When things move: the entrance of the two hero drawings, and the lit path, which follows the
 * wires up from the base one hop at a time. Pure: no DOM.
 */

import type { Relation } from './projects.ts';
import type { PlacedNode, TreeRow } from './stack.ts';
import { edgeKey, pathToBase } from './stack.ts';

/** Per hop on a lit path, ms. */
export const HOP = 110;

/** What a set of paths lights: its nodes, and each edge with its height above the base in hops. */
export interface LitPlan {
	nodes: Set<string>;
	edges: Map<string, number>;
}

/** The lit paths, each from a project down to the base. The base's own edge is at height 0. */
export function litPlan(paths: string[][]): LitPlan {
	const nodes = new Set<string>();
	const edges = new Map<string, number>();
	for (const path of paths) {
		const last = path.length - 1;
		path.forEach((name, j) => {
			nodes.add(name);
			if (j < last) edges.set(edgeKey(name, path[j + 1]), last - 1 - j);
		});
	}
	return { nodes, edges };
}

/**
 * How the light moves from one lit set of edges to the next, each edge with its height. Edges lit
 * in both stay as they are: never redrawn. Edges that go dark retract first, from the top down;
 * then the new ones draw, from the lowest up. So the light shrinks to where the two paths meet,
 * then grows up the new one. Returns the start time, in ms, of each edge that changes.
 */
export function walk(before: Map<string, number>, after: Map<string, number>): Map<string, number> {
	const out = new Map<string, number>();
	const gone = [...before].filter(([k]) => !after.has(k));
	const come = [...after].filter(([k]) => !before.has(k));
	const top = Math.max(...gone.map(([, h]) => h));
	const bottom = Math.min(...gone.map(([, h]) => h));
	for (const [k, h] of gone) out.set(k, (top - h) * HOP);
	const start = gone.length ? (top - bottom + 1) * HOP : 0;
	const low = Math.min(...come.map(([, h]) => h));
	for (const [k, h] of come) out.set(k, start + (h - low) * HOP);
	return out;
}

/** What the page lights, and which cards take the lit outline. */
export interface Lit extends LitPlan {
	cards: Set<string>;
	/** Dim what is off the path: on hover and focus, not while reading. */
	dim: boolean;
	/** When each edge that changes starts to move, from `walk`. Empty until the page walks. */
	hops: Map<string, number>;
}

/**
 * Hover or keyboard focus wins: its path lights, every card on it too, and the rest dims.
 * Otherwise the cards being read light their paths, and only those cards take the outline.
 */
export function lit(active: string | null, here: string[], rels: Relation[]): Lit {
	if (active) {
		const plan = litPlan([pathToBase(active, rels)]);
		return { ...plan, cards: plan.nodes, dim: true, hops: new Map() };
	}
	const plan = litPlan(here.map((n) => pathToBase(n, rels)));
	return { ...plan, cards: new Set(here), dim: false, hops: new Map() };
}

/** The graph's entrance: the base first, then each layer 300ms up, the middle of a layer first. */
export function nodeDelays(nodes: PlacedNode[]): Map<string, number> {
	const size = nodes.reduce<number[]>((acc, n) => ((acc[n.layer] = (acc[n.layer] ?? 0) + 1), acc), []);
	return new Map(
		nodes.map((n) => [n.name, 80 + n.layer * 300 + Math.round(Math.abs(n.slot - (size[n.layer] - 1) / 2) * 34)])
	);
}

/**
 * The tree's entrance: the base row first, then each lane 300ms later, the child nearest its
 * parent first (the gap counted in rows, at most four).
 */
export function rowDelays(rows: TreeRow[], rels: Relation[]): Map<string, number> {
	const rowOf = new Map(rows.map((r) => [r.name, r]));
	return new Map(
		rows.map((r) => {
			const parent = rels.find((x) => x.from === r.name);
			const gap = parent ? rowOf.get(parent.to)!.row - r.row - 1 : 0;
			return [r.name, 60 + r.lane * 300 + Math.min(gap, 4) * 36];
		})
	);
}
