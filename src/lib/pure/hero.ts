/**
 * The hero graph's box, its layout, and the grid the title is set on: the title spans the top
 * layer's first three columns, the hero line sits in the last. Pure: no DOM.
 */

import { relations } from './projects.ts';
import type { Box } from './stack.ts';
import { layered } from './stack.ts';

const INSET = 5;
const STAMP_H = 98;
const NODE_H = 140;

/** The graph's sizes, in viewBox units. A node: a stamp inset at its head, its name in a bar below. */
export const HERO = {
	width: 1200,
	nodeW: 216,
	nodeH: NODE_H,
	gapY: 72,
	pad: 22,
	inset: INSET,
	stampH: STAMP_H,
	/** The middle of the name bar, where a port wire meets a node's side. */
	sideY: INSET + STAMP_H + (NODE_H - INSET - STAMP_H) / 2
} as const satisfies Box & Record<string, number>;

export const heroLayout = (names: string[]) => layered(names, relations, HERO);

/** The title's grid, in viewBox units: its left edge, the title's width, the line's width. */
export function titleGrid(layout: ReturnType<typeof heroLayout>): { left: number; titleW: number; lineW: number } {
	const top = layout.nodes.filter((n) => n.layer === layout.layers - 1).sort((a, b) => a.x - b.x);
	const left = top[0].x - HERO.nodeW / 2;
	return {
		left,
		titleW: top[top.length - 2].x + HERO.nodeW / 2 - left,
		lineW: HERO.nodeW
	};
}

/** A length in viewBox units as a share of the hero's width, for type that scales with the drawing. */
export const cqi = (n: number): string => `${((n / HERO.width) * 100).toFixed(3)}cqi`;
