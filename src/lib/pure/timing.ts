/**
 * When things move: the entrance of the two hero drawings, and the lit path, which follows the
 * wires up from the base one hop at a time. Pure: no DOM.
 */

import type { Relation } from './projects.ts';
import type { PlacedNode, TreeRow } from './stack.ts';
import { edgeKey, pathToBase } from './stack.ts';

/** Per hop on a lit path, ms. */
export const HOP = 110;

/** What a set of paths lights: its nodes, and each edge with the time it starts to draw. */
export interface LitPlan {
	nodes: Set<string>;
	edges: Map<string, number>;
}

/**
 * The lit paths, each from a project down to the base. The light follows the wires up from the
 * base: an edge draws a hop after the one below it. An edge on several paths takes its earliest time.
 */
export function litPlan(paths: string[][]): LitPlan {
	const nodes = new Set<string>();
	const edges = new Map<string, number>();
	for (const path of paths) {
		const last = path.length - 1;
		path.forEach((name, j) => {
			nodes.add(name);
			if (j === last) return;
			const key = edgeKey(name, path[j + 1]);
			edges.set(key, Math.min(edges.get(key) ?? Infinity, (last - 1 - j) * HOP));
		});
	}
	return { nodes, edges };
}

/** What the page lights, and which cards take the lit outline. */
export interface Lit extends LitPlan {
	cards: Set<string>;
	/** Dim what is off the path: on hover and focus, not while reading. */
	dim: boolean;
}

/**
 * Hover or focus wins: its path lights, every card on it too, and the rest dims. Otherwise the
 * cards being read light their paths, and only those cards take the outline.
 */
export function lit(active: string | null, here: string[], rels: Relation[]): Lit {
	if (active) {
		const plan = litPlan([pathToBase(active, rels)]);
		return { ...plan, cards: plan.nodes, dim: true };
	}
	const plan = litPlan(here.map((n) => pathToBase(n, rels)));
	return { ...plan, cards: new Set(here), dim: false };
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
