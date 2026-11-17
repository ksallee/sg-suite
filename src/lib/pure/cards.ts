/**
 * What a project's panel shows beyond the data: where it sits in the stack, and the text a knob
 * shows for a link. Pure: no DOM, no I/O.
 */

import type { Relation, RelationKind } from './projects.ts';

/** What a project builds on, or is a port of. Nothing for the base. */
export function upstream(name: string, rels: Relation[]): { name: string; kind: RelationKind } | undefined {
	const r = rels.find((x) => x.from === name);
	return r && { name: r.to, kind: r.kind };
}

/** The projects that build on this one, in list order. A port is not a use: it is left out. */
export function downstream(name: string, rels: Relation[]): string[] {
	return rels.filter((r) => r.to === name && r.kind === 'on').map((r) => r.from);
}

/** `ksallee/sg-notes` from the repo URL. */
export const repoSlug = (url: string): string => new URL(url).pathname.replace(/^\/|\/$/g, '');

/** `sg-notes.vercel.app` from the site URL. */
export const siteHost = (url: string): string => new URL(url).host;
