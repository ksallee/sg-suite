// The page's one scroll spy. On scroll, at most once a frame, it measures the cards and asks the
// pure `spy` module two things: which cards are being read (the row past `readingLine`, near the
// top of the window), and, where the browser has no scroll-driven CSS, which cards have been
// reached (top past 75% of the window), so the rail can draw their wires by transition instead.
import { untrack } from 'svelte';
import { inView, passed, readingLine } from './pure/spy';

export interface Reading {
	/** The cards being read, in page order. */
	here: string[];
	/** Without scroll-driven CSS: the cards reached so far. Null: the CSS draws, or no JS yet. */
	reached: Set<string> | null;
	/**
	 * A link to a card was clicked: that card is the one being read, now, and stays so until the
	 * scroll comes to rest. The cards the jump scrolls past are never read on the way.
	 */
	jump: (name: string) => void;
}

/** Track the cards, by element id, in page order. Call during a component's setup. */
export function reading(order: string[]): Reading {
	let jumping: ReturnType<typeof setTimeout> | undefined;
	let settle = () => {};
	const r = $state<Reading>({
		here: [],
		reached: null,
		jump: (name) => {
			r.here = [name];
			clearTimeout(jumping);
			jumping = setTimeout(settle, 150);
		}
	});
	$effect(() => {
		const linked = CSS.supports('animation-timeline: view()') && CSS.supports('timeline-scope: none');
		const seen = new Set<string>();
		let raf = 0;
		let last = '';
		let first = true;
		const measure = () => {
			raf = 0;
			const spans = order.flatMap((name) => {
				const b = document.getElementById(name)?.getBoundingClientRect();
				return b ? [{ name, top: b.top, bottom: b.bottom }] : [];
			});
			const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
			const next = inView(spans, readingLine(innerHeight), atEnd);
			if (next.join() !== last) {
				last = next.join();
				r.here = next;
			}
			if (linked) return;
			const before = seen.size;
			for (const name of passed(spans, innerHeight * 0.75)) seen.add(name);
			if (first || seen.size !== before) r.reached = new Set(seen);
			first = false;
		};
		const schedule = () => {
			// During a jump, each scroll pushes the end back; the jump is over 150ms after the last.
			if (jumping !== undefined) {
				clearTimeout(jumping);
				jumping = setTimeout(settle, 150);
				return;
			}
			raf ||= requestAnimationFrame(measure);
		};
		settle = () => {
			jumping = undefined;
			last = '';
			measure();
		};
		// The state is written here, never read: the effect runs once, the scroll does the rest.
		untrack(measure);
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule);
		return () => {
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
			cancelAnimationFrame(raf);
			clearTimeout(jumping);
		};
	});
	return r;
}
