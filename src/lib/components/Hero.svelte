<script lang="ts">
	// The top of the page. `sg-suite` in Geist Mono, set on the graph's grid: it spans the top
	// layer's first three columns, and the line sits in the fourth, on its baseline. Then the
	// graph (a tree on a phone) and the legend.
	import type { Project } from '$lib/pure/projects';
	import { grouped } from '$lib/pure/projects';
	import { cqi, heroLayout, titleGrid } from '$lib/pure/hero';
	import { LINE } from '$lib/pure/seo';
	import type { Lit } from '$lib/pure/timing';
	import StackDiagram from './StackDiagram.svelte';
	import StackTree from './StackTree.svelte';

	let {
		projects,
		lit,
		onactivate
	}: { projects: Project[]; lit: Lit; onactivate: (name: string | null) => void } = $props();

	const grid = $derived(titleGrid(heroLayout(projects.map((p) => p.name))));
</script>

<div class="hero">
	<header class="type" style="--t-l: {cqi(grid.left)}; --t-w: {cqi(grid.titleW)}; --l-w: {cqi(grid.lineW)}">
		<h1>sg-suite</h1>
		<p>{LINE}</p>
	</header>

	<section class="canvas" aria-label="sg-suite">
		<div class="wide-only">
			<StackDiagram {projects} {lit} {onactivate} />
		</div>
		<div class="narrow-only">
			<StackTree {projects} {lit} {onactivate} variant="hero" />
		</div>
		<nav class="legend" aria-label="Groups">
			{#each grouped() as { group, projects: members } (group.id)}
				<a href="#{group.id}">
					<span class="swatch g-{group.id}" aria-hidden="true"></span>
					{group.title}
					<span class="count">{members.length}</span>
				</a>
			{/each}
		</nav>
	</section>
</div>

<style>
	/* The hero's width is the diagram's, so `cqi` units track the drawing. */
	.hero {
		container-type: inline-size;
	}

	/* The title: pure type on the graph's columns. */
	.type {
		display: grid;
		gap: 14px;
		padding-top: 36px;
	}
	h1 {
		font-family: var(--font-mono);
		/* Fixed advance, so the width is known: the name spans the top layer's first three columns. */
		font-size: 21cqi;
		font-weight: 600;
		line-height: 0.82;
		letter-spacing: -0.06em;
		margin-left: -0.05em;
		/* Built from the baseline up, as the graph below is built from its base up. */
		animation: build 640ms var(--ease-out) backwards;
	}
	.type p {
		max-width: 36ch;
		color: var(--muted-foreground);
		font-size: clamp(1.0625rem, 1.6vw, 1.25rem);
		line-height: 1.45;
		text-wrap: pretty;
		animation: rise 520ms var(--ease-out) 90ms backwards;
	}
	@media (width >= 64rem) {
		.type {
			grid-template-columns: var(--t-l) var(--t-w) 1fr var(--l-w) var(--t-l);
			align-items: last baseline;
			gap: 0;
			padding-top: 40px;
		}
		h1 {
			grid-column: 2;
			font-size: calc(var(--t-w) / 4.32);
		}
		.type p {
			grid-column: 4;
			padding-bottom: 0.1em;
			font-size: 17px;
		}
	}

	/* The canvas: a node editor's dot grid behind the stack, fading out at its edges. */
	.canvas {
		position: relative;
		margin-top: 28px;
		padding: 20px 0 28px;
	}
	.canvas::before {
		content: '';
		position: absolute;
		inset: 0 -48px;
		z-index: -1;
		background-image: radial-gradient(var(--canvas-dot) 1.1px, transparent 1.4px);
		background-size: 22px 22px;
		background-position: center;
		mask-image: radial-gradient(ellipse 70% 65% at 50% 50%, #000 40%, transparent 100%);
		animation: fade 700ms var(--ease-out) backwards;
	}
	/*
	 * One drawing per width. Hidden with visibility, not display: a display toggle restarts the
	 * entrance animations, and Playwright's full-page capture toggles it.
	 */
	.narrow-only {
		max-width: 36rem;
	}
	@media (width < 64rem) {
		.wide-only {
			position: absolute;
			visibility: hidden;
			width: 100%;
			height: 0;
			overflow: hidden;
		}
	}
	@media (width >= 64rem) {
		.narrow-only {
			position: absolute;
			visibility: hidden;
			width: 100%;
			height: 0;
			overflow: hidden;
		}
		.canvas {
			margin-top: 4px;
			padding: 24px 0 40px;
		}
	}

	/* The legend: the groups, each a link to its section. Decoration in the entrance: it fades. */
	.legend {
		display: grid;
		grid-template-columns: repeat(2, max-content);
		column-gap: 12px;
		margin-top: 20px;
		margin-left: -12px;
		animation: fade 420ms var(--ease-out) 760ms backwards;
	}
	.legend a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 12px;
		border-radius: 999px;
		color: var(--muted-foreground);
		font-size: 14px;
		font-weight: 500;
		transition:
			background-color 150ms var(--ease-out),
			color 150ms var(--ease-out);
	}
	.swatch {
		width: 9px;
		height: 9px;
		flex: none;
		border-radius: 2px;
	}
	.g-foundation {
		background: var(--g-foundation);
	}
	.g-libraries {
		background: var(--g-libraries);
	}
	.g-apps {
		background: var(--g-apps);
	}
	.g-integrations {
		background: var(--g-integrations);
	}
	.count {
		font-family: var(--font-mono);
		font-size: 12.5px;
		opacity: 0.7;
	}
	.legend a:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}
	@media (hover: hover) and (pointer: fine) {
		.legend a:hover {
			background: var(--accent);
			color: var(--foreground);
		}
	}
	@media (width >= 40rem) {
		.legend {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
		}
	}
	@media (width >= 64rem) {
		.legend {
			justify-content: center;
			margin: 8px 0 0;
		}
		.legend a {
			min-height: 36px;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes build {
		from {
			clip-path: inset(100% -0.1em -0.3em -0.1em);
			transform: translateY(0.12em);
		}
		to {
			clip-path: inset(-0.3em -0.1em -0.3em -0.1em);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		h1,
		.type p {
			animation-name: fade;
		}
	}
</style>
