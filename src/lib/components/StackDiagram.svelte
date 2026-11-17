<script lang="ts">
	// The hero: the stack as a node graph, base at the bottom. Every position comes from `layered()`.
	// A node links to its panel below. A lit path (hover, focus, or the cards being read) follows
	// the wires up from the base, one hop at a time.
	import type { Project } from '$lib/pure/projects';
	import { relations } from '$lib/pure/projects';
	import { HERO, heroLayout } from '$lib/pure/hero';
	import { HOP, nodeDelays, type Lit } from '$lib/pure/timing';

	let {
		projects,
		lit,
		onactivate
	}: { projects: Project[]; lit: Lit; onactivate: (name: string | null) => void } = $props();

	const { width: W, nodeW: NODE_W, nodeH: NODE_H, inset: INSET, stampH: STAMP_H, sideY: BAR_Y } = HERO;

	const layout = $derived(heroLayout(projects.map((p) => p.name)));
	const byName = $derived(new Map(projects.map((p) => [p.name, p])));
	const hasOut = (name: string) => relations.some((r) => r.to === name && r.kind === 'on');
	const hasIn = (name: string) => relations.some((r) => r.from === name && r.kind === 'on');

	// Entrance: the base first, then each layer up, the middle of a layer before its ends. Each
	// edge starts once its lower node is mostly in and reaches the upper node as that one pops.
	const nodeDelay = $derived(nodeDelays(layout.nodes));

	const codeLines = (code: string) => code.split('\n').slice(0, 5);
</script>

<svg class="diagram" class:dim={lit.dim} viewBox="0 0 {W} {layout.height}" style="--ht: {HOP}ms">
	<defs>
		<clipPath id="hero-stamp">
			<rect x={INSET} y={INSET} width={NODE_W - 2 * INSET} height={STAMP_H} rx="5" />
		</clipPath>
	</defs>

	<g class="edges" aria-hidden="true">
		{#each layout.edges as e (e.key)}
			{@const on = lit.edges.has(e.key)}
			{@const port = e.kind === 'port'}
			<g
				class="edge"
				class:on
				class:port
				style="--d: {(nodeDelay.get(e.to) ?? 0) + 140}ms; --hd: {lit.edges.get(e.key) ?? 0}ms"
			>
				<!-- A dashed port wire keeps its own length: `pathLength` would stretch its dashes. -->
				<path class="edge-base" d={e.d} pathLength={port ? undefined : 1} />
				<path class="edge-lit" d={e.d} pathLength={port ? undefined : 1} />
			</g>
		{/each}
	</g>

	{#each layout.nodes as n (n.name)}
		{@const p = byName.get(n.name)!}
		<a
			href="#{n.name}"
			class="node"
			class:on={lit.nodes.has(n.name)}
			style="--hue: var(--g-{p.group})"
			aria-label={n.name}
			onpointerenter={() => onactivate(n.name)}
			onpointerleave={() => onactivate(null)}
			onfocus={() => onactivate(n.name)}
			onblur={() => onactivate(null)}
		>
			<g transform="translate({n.x - NODE_W / 2} {n.y})">
				<g class="pop" style="--d: {nodeDelay.get(n.name)}ms">
					<g class="lift">
						<rect class="ring" x="-5" y="-5" width={NODE_W + 10} height={NODE_H + 10} rx="14" />
						<rect class="shadow" x="0" y="3" width={NODE_W} height={NODE_H} rx="10" />
						<rect class="body" width={NODE_W} height={NODE_H} rx="10" />
						{#if p.image}
							<image
								href={p.image.src}
								x={INSET}
								y={INSET}
								width={NODE_W - 2 * INSET}
								height={STAMP_H}
								preserveAspectRatio="xMinYMin slice"
								clip-path="url(#hero-stamp)"
							/>
						{:else if p.code}
							<rect class="code-bg" x={INSET} y={INSET} width={NODE_W - 2 * INSET} height={STAMP_H} rx="5" />
							<g clip-path="url(#hero-stamp)">
								{#each codeLines(p.code) as line, i (i)}
									<text class="code" x={INSET + 9} y={INSET + 18 + i * 16}>{line}</text>
								{/each}
							</g>
						{/if}
						<rect class="stamp-edge" x={INSET} y={INSET} width={NODE_W - 2 * INSET} height={STAMP_H} rx="5" />
						<rect class="swatch g-{p.group}" x="13" y={BAR_Y - 4} width="8" height="8" rx="2" />
						<text class="label" x="29" y={BAR_Y}>{n.name}</text>
						{#if hasOut(n.name)}<circle class="port-dot" cx={NODE_W / 2} cy="0" r="4" />{/if}
						{#if hasIn(n.name)}<circle class="port-dot" cx={NODE_W / 2} cy={NODE_H} r="4" />{/if}
					</g>
				</g>
			</g>
		</a>
	{/each}
</svg>

<style>
	.diagram {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	/* Edges */
	.edges {
		pointer-events: none;
	}
	.edge {
		transition: opacity 160ms var(--ease-out);
	}
	.edge path {
		fill: none;
	}
	.edge-base {
		stroke: var(--wire);
		stroke-width: 1.5;
		animation: draw 380ms var(--ease-out) var(--d) backwards;
	}
	.edge:not(.port) .edge-base {
		stroke-dasharray: 1;
	}
	.edge.port .edge-base,
	.edge.port .edge-lit {
		stroke-dasharray: 4 5;
	}
	.edge.port .edge-base {
		animation: fade 240ms var(--ease-out) var(--d) backwards;
	}
	.edge-lit {
		stroke: var(--lit);
		stroke-width: 2.5;
		opacity: 0;
		transition: opacity 160ms var(--ease-out);
	}
	/* A lit wire is one dash the length of the wire, so it can draw up along it, a hop at a time. */
	.edge:not(.port) .edge-lit {
		stroke-dasharray: 1 1;
	}
	.edge.on .edge-lit {
		opacity: 1;
	}
	.edge.on:not(.port) .edge-lit {
		animation: lit-up var(--ht) var(--ease-out) var(--hd) both;
	}
	.dim .edge:not(.on) {
		opacity: 0.3;
	}

	/* Nodes */
	.node {
		outline: none;
		cursor: pointer;
		transition: opacity 160ms var(--ease-out);
	}
	.dim .node:not(.on) {
		opacity: 0.45;
	}
	.pop {
		transform-box: fill-box;
		transform-origin: 50% 100%;
		animation: pop 420ms var(--ease-back) var(--d) backwards;
	}
	.lift {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 180ms var(--ease-out);
	}
	.body {
		fill: var(--card);
		stroke: var(--node-edge);
		stroke-width: 1;
		transition: stroke 160ms var(--ease-out);
	}
	/* On a lit path (hover, focus, reading): the edge takes a faint tint of the node's group. */
	.node.on .body {
		stroke: color-mix(in oklab, var(--hue) var(--hover-tint), var(--node-edge));
	}
	.shadow {
		fill: var(--node-shadow);
	}
	.code-bg {
		fill: var(--code-bg);
	}
	.code {
		fill: var(--code-fg);
		font-family: var(--font-mono);
		font-size: 8.5px;
	}
	.stamp-edge {
		fill: none;
		stroke: var(--border);
	}
	.label {
		fill: var(--foreground);
		font-family: var(--font-mono);
		font-size: 13.5px;
		font-weight: 500;
		dominant-baseline: central;
	}
	.port-dot {
		fill: var(--background);
		stroke: var(--wire);
		stroke-width: 1.5;
	}
	.ring {
		fill: none;
		stroke: var(--ring);
		stroke-width: 2;
		opacity: 0;
	}
	.node:focus-visible .ring {
		opacity: 1;
	}
	@media (hover: hover) and (pointer: fine) {
		.node:hover .lift {
			transform: translateY(-3px);
		}
	}
	.node:focus-visible .lift {
		transform: translateY(-3px);
	}

	.swatch.g-foundation {
		fill: var(--g-foundation);
	}
	.swatch.g-libraries {
		fill: var(--g-libraries);
	}
	.swatch.g-apps {
		fill: var(--g-apps);
	}
	.swatch.g-integrations {
		fill: var(--g-integrations);
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(14px) scale(0.92);
		}
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes lit-up {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	/* Reduced motion: nothing moves. Things fade in, in the same order; a lit path fades. */
	@media (prefers-reduced-motion: reduce) {
		.pop,
		.edge:not(.port) .edge-base {
			animation-name: fade;
			animation-timing-function: ease-out;
		}
		.edge.on:not(.port) .edge-lit {
			animation: none;
		}
		.node:hover .lift,
		.node:focus-visible .lift {
			transform: none;
		}
	}
</style>
