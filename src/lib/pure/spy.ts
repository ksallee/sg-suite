/**
 * Where the reader is among the cards. Pure: the page measures the cards and passes plain
 * numbers in.
 */

/** A card's vertical extent, in viewport pixels. */
export interface Span {
	name: string;
	top: number;
	bottom: number;
}

/**
 * The cards being read: the last row whose top has passed the reading line, so a gap between
 * rows keeps the row just read. At the end of the page, the last row, since a short last card
 * may never reach the line. Page order is kept. Empty above the first card.
 */
export function inView(spans: Span[], line: number, atEnd: boolean): string[] {
	const reached = atEnd ? spans : spans.filter((s) => s.top <= line);
	if (!reached.length) return [];
	const top = Math.max(...reached.map((s) => s.top));
	return reached.filter((s) => top - s.top < 2).map((s) => s.name);
}

/** Every card whose top has reached the line, in page order. */
export function passed(spans: Span[], line: number): string[] {
	return spans.filter((s) => s.top <= line).map((s) => s.name);
}

/**
 * The reading line, in px from the top of the window: near the top, where a link lands a panel
 * (24px down), so the panel clicked is the one read and not the one below it. 40% of a window
 * too short for that.
 */
export function readingLine(windowHeight: number): number {
	return Math.min(160, windowHeight * 0.4);
}
