/**
 * Scroll reveal, once. Content already in view when the page loads is left alone. Sets
 * `data-reveal` to `wait`, then `in`; the CSS in `app.css` and the component does the rest, so
 * nothing hides without JS.
 */
export function reveal(node: HTMLElement) {
	const r = node.getBoundingClientRect();
	if (r.top < innerHeight && r.bottom > 0) return;
	node.dataset.reveal = 'wait';
	const io = new IntersectionObserver(
		(entries) => {
			if (!entries.some((e) => e.isIntersecting)) return;
			node.dataset.reveal = 'in';
			io.disconnect();
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
