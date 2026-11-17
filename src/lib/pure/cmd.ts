/** How an install command breaks across lines: only at its spaces and after a URL's slashes,
 * never inside a name at a hyphen. Pure. */

export interface Piece {
	text: string;
	/** A line may break after this piece. */
	brk: boolean;
}

/** `pnpm add https://a.b/r/x.json` → `pnpm `, `add `, `https://`, `a.b/`, `r/`, `x.json`. */
export function pieces(cmd: string): Piece[] {
	const out: Piece[] = [];
	for (const word of cmd.split(/(?<= )/)) {
		const parts = word.match(/[^/]*\/+|[^/]+/g) ?? [word];
		for (const t of parts) out.push({ text: t, brk: true });
	}
	return out;
}
