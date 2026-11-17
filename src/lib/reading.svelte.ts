// The page's one scroll spy. On scroll, at most once a frame, it measures the cards and asks the
// pure `spy` module two things: which cards are being read (the row past a line 40% down the
// window), and, where the browser has no scroll-driven CSS, which cards have been reached (top
// past 75% of the window), so the rail can draw their wires by transition instead.
import { untrack } from 'svelte';
import { inView, passed } from './pure/spy';

export interface Reading {
	/** The cards being read, in page order. */
	here: string[];
	/** Without scroll-driven CSS: the cards reached so far. Null: the CSS draws, or no JS yet. */
	reached: Set<string> | null;
}

/** Track the cards, by element id, in page order. Call during a component's setup. */
export function reading(order: string[]): Reading {
	const r = $state<Reading>({ here: [], reached: null });
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
			const next = inView(spans, innerHeight * 0.4, atEnd);
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
		const schedule = () => (raf ||= requestAnimationFrame(measure));
		// The state is written here, never read: the effect runs once, the scroll does the rest.
		untrack(measure);
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule);
		return () => {
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
			cancelAnimationFrame(raf);
		};
	});
	return r;
}
