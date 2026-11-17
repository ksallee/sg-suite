<script lang="ts">
	// The end of the page: one quiet line under a rule. This page's repo, how many projects it
	// lists, back to top.
	import { ArrowUp } from '@lucide/svelte';
	import GithubMark from './GithubMark.svelte';

	let { count }: { count: number } = $props();

	/** The rule draws in once, the first time the line comes into view. Nothing hides without JS. */
	let arrived = $state<'wait' | 'in'>();
	function arrive(node: HTMLElement) {
		arrived = 'wait';
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				arrived = 'in';
				io.disconnect();
			},
			{ threshold: 0.6 }
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}
</script>

<footer class="end-line mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-12">
	<div class="inner" data-arrive={arrived} use:arrive>
		<a class="link" href="https://github.com/ksallee/sg-suite">
			<GithubMark class="size-4" />
			<span class="text">sg-suite on GitHub</span>
		</a>
		<span class="count"><span class="num">{count}</span> projects</span>
		<a class="link top" href="#top">
			<span class="text">Back to top</span>
			<ArrowUp class="size-4 arrow" strokeWidth={2} />
		</a>
	</div>
</footer>

<style>
	.end-line {
		/* Clear of the last card by more than the gap between groups (72px), so it reads as the end,
		   not as one more group. Below: the same space as above the title, plus room for a thumb. */
		padding-top: 112px;
		padding-bottom: 40px;
	}
	@media (width >= 64rem) {
		.end-line {
			padding-bottom: 56px;
		}
	}

	.inner {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 20px;
		padding-top: 14px;
		font-size: 14px;
		line-height: 20px;
	}
	/* The rule: the house border, drawn as an overlay so it can draw in with a transform. */
	.inner::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: var(--border);
		transform-origin: left center;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		/* The hit area reaches past the text; the text still lines up with the column's edge. */
		padding-inline: 10px;
		margin-inline: -10px;
		border-radius: calc(var(--radius) * 0.8);
		color: var(--foreground);
		font-weight: 500;
		transition: color 150ms var(--ease-out);
	}
	.link .text {
		text-decoration-line: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 4px;
		text-decoration-color: color-mix(in oklch, currentColor 25%, transparent);
		transition: text-decoration-color 150ms var(--ease-out);
	}
	.top {
		margin-left: auto;
		color: var(--muted-foreground);
	}
	.top :global(.arrow) {
		transition: transform 150ms var(--ease-out);
	}
	.count {
		color: var(--muted-foreground);
	}
	.num {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--foreground);
	}
	.link:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}
	.link:focus-visible .text {
		text-decoration-color: currentColor;
	}
	.top:focus-visible {
		color: var(--foreground);
	}
	@media (hover: hover) and (pointer: fine) {
		.link:hover .text {
			text-decoration-color: currentColor;
		}
		.top:hover {
			color: var(--foreground);
		}
		.top:hover :global(.arrow) {
			transform: translateY(-2px);
		}
	}
	.top:focus-visible :global(.arrow) {
		transform: translateY(-2px);
	}

	@media (width < 30rem) {
		.inner {
			column-gap: 16px;
		}
	}
	/* Narrower than a 390px phone, the count drops to its own line; the two links share the next. */
	@media (width < 24rem) {
		.count {
			order: -1;
			flex-basis: 100%;
			padding-top: 6px;
		}
	}

	/* Arrival: the rule draws from the left like a wire, the line follows. Once. Keyframes, not
	   transitions, so the hover transitions above stay as they are. */
	.inner[data-arrive='wait']::before,
	.inner[data-arrive='wait'] > * {
		opacity: 0;
	}
	.inner[data-arrive='in']::before {
		animation: rule 640ms var(--ease-out) backwards;
	}
	.inner[data-arrive='in'] > * {
		animation: fade 420ms var(--ease-out) 160ms backwards;
	}
	.inner[data-arrive='in'] > :nth-child(2) {
		animation-delay: 220ms;
	}
	.inner[data-arrive='in'] > :nth-child(3) {
		animation-delay: 280ms;
	}
	@keyframes rule {
		from {
			transform: scaleX(0);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.inner[data-arrive='in']::before {
			animation-name: fade;
		}
		.top:hover :global(.arrow),
		.top:focus-visible :global(.arrow) {
			transform: none;
		}
	}
</style>
