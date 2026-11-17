<script lang="ts">
	// The stack as an upside-down tree, one row per project, base last. The hero on a phone, where
	// each row carries its node's picture; and a sticky rail beside the panels on a wide screen.
	// Each row: the name (to its panel), GitHub, Site.
	//
	// The rail follows the reading: a dotted track shows the whole stack, each wire draws as its
	// panel scrolls in (a scroll-driven animation on the panel's view timeline, or a transition
	// once `reached` says so), the rows being read get a band, and their path lights up from the base.
	import type { Project } from '$lib/pure/projects';
	import { ArrowUpRight } from '@lucide/svelte';
	import GithubMark from './GithubMark.svelte';
	import { relations } from '$lib/pure/projects';
	import { treeRows, treeEdges } from '$lib/pure/stack';
	import { HOP, rowDelays, type Lit } from '$lib/pure/timing';

	let {
		projects,
		lit,
		onactivate,
		variant,
		here = [],
		reached = null
	}: {
		projects: Project[];
		lit: Lit;
		onactivate: (name: string | null) => void;
		variant: 'hero' | 'rail';
		/** Rail: the panels being read; their rows get a band. */
		here?: string[];
		/** Rail, without scroll-driven CSS: the panels reached so far. Null: all drawn by CSS. */
		reached?: Set<string> | null;
	} = $props();

	const hero = $derived(variant === 'hero');
	const rowH = $derived(hero ? 56 : 44);
	// With pictures in the rows, the lanes tighten so the longest name still fits at 390px.
	const laneW = 18;
	const dotGap = $derived(hero ? 16 : 13);
	const dotR = $derived(hero ? 5.5 : 4.5);
	const X0 = 9;

	const rows = $derived(treeRows(projects.map((p) => p.name), relations));
	const edges = $derived(treeEdges(rows, relations, { rowH, laneW, x0: X0, radius: 8 }));
	const lanes = $derived(Math.max(...rows.map((r) => r.lane)) + 1);
	const byName = $derived(new Map(projects.map((p) => [p.name, p])));
	// Entrance (hero only): the base row first, then each lane, nearest its parent first.
	const delay = $derived(rowDelays(rows, relations));

	const pending = (name: string) => reached !== null && !reached.has(name);
	const codeLines = (code: string) => code.split('\n').slice(0, 5);
</script>

<div
	class="tree"
	class:hero
	class:rail={!hero}
	class:dim={lit.dim}
	style="--row-h: {rowH}px; --dot-gap: {dotGap}px; --ht: {HOP}ms"
>
	<svg class="rails" width={X0 + lanes * laneW} height={rows.length * rowH} aria-hidden="true">
		{#each edges as e (e.key)}
			{@const port = e.kind === 'port'}
			<g
				class="edge"
				class:on={lit.edges.has(e.key)}
				class:port
				class:pending={pending(e.from)}
				style="--d: {delay.get(e.to)! + 120}ms; --tl: --w-{e.from}; --hd: {lit.edges.get(e.key) ?? 0}ms"
			>
				{#if !hero}<path class="edge-ghost" d={e.d} />{/if}
				<path class="edge-base" d={e.d} pathLength={port ? undefined : 1} />
				<path class="edge-lit" d={e.d} pathLength={port ? undefined : 1} />
			</g>
		{/each}
		{#each rows as r (r.name)}
			{@const cx = X0 + r.lane * laneW}
			{@const cy = r.row * rowH + rowH / 2}
			<g
				class="dot-slot"
				class:on={lit.nodes.has(r.name)}
				class:pending={pending(r.name)}
				style="--d: {delay.get(r.name)}ms; --tl: --w-{r.name}"
			>
				{#if !hero}<circle class="dot-ghost" {cx} {cy} r={dotR - 0.75} />{/if}
				<g class="dot-wrap">
					<circle class="dot g-{byName.get(r.name)!.group}" {cx} {cy} r={dotR} />
				</g>
			</g>
		{/each}
	</svg>

	<ul>
		{#each rows as r (r.name)}
			{@const p = byName.get(r.name)!}
			{@const reading = here.includes(r.name)}
			<li
				class="row"
				class:on={lit.nodes.has(r.name)}
				class:here={reading}
				style="--indent: {X0 + r.lane * laneW + dotGap}px; --d: {delay.get(r.name)}ms"
				onpointerenter={() => onactivate(r.name)}
				onpointerleave={() => onactivate(null)}
				onfocusin={() => onactivate(r.name)}
				onfocusout={() => onactivate(null)}
			>
				<a class="name" href="#{p.name}" aria-current={reading ? 'location' : undefined}>
					{#if hero}
						<span class="stamp" aria-hidden="true">
							{#if p.image}
								<img src={p.image.src} alt="" width={p.image.width} height={p.image.height} decoding="async" />
							{:else if p.code}
								<svg viewBox="0 0 206 98" preserveAspectRatio="xMinYMin slice">
									<rect width="206" height="98" class="code-bg" />
									{#each codeLines(p.code) as line, i (i)}
										<text class="code" x="9" y={18 + i * 16}>{line}</text>
									{/each}
								</svg>
							{/if}
						</span>
					{/if}
					<span class="label">{p.name}</span>
				</a>
				<a class="icon" href={p.repo} aria-label="{p.name} on GitHub" title="GitHub">
					<GithubMark class={hero ? 'size-[18px]' : 'size-4'} />
				</a>
				{#if p.site}
					<a class="icon" href={p.site} aria-label="Open the {p.name} site" title="Site">
						<ArrowUpRight class={hero ? 'size-5' : 'size-[18px]'} strokeWidth={1.75} />
					</a>
				{:else}
					<span class="icon" aria-hidden="true"></span>
				{/if}
			</li>
		{/each}
	</ul>
</div>

<style>
	.tree {
		position: relative;
		/* The band sits under the rails, inside the tree. */
		isolation: isolate;
		container-type: inline-size;
	}
	.rails {
		position: absolute;
		inset: 0 auto auto 0;
		overflow: visible;
		pointer-events: none;
	}
	ul {
		position: relative;
	}

	/* Rails */
	.edge {
		transition: opacity 160ms var(--ease-out);
	}
	.edge path {
		fill: none;
	}
	.edge-base {
		stroke: var(--wire);
		stroke-width: 1.5;
	}
	.edge:not(.port) .edge-base {
		stroke-dasharray: 1;
	}
	.edge.port .edge-base,
	.edge.port .edge-lit {
		stroke-dasharray: 3 4;
	}
	.edge-lit {
		stroke: var(--lit);
		stroke-width: 2.25;
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
	.dot {
		stroke: var(--background);
		stroke-width: 2;
		transition: stroke 160ms var(--ease-out);
	}
	.dot-slot.on .dot {
		stroke: var(--lit);
	}
	.dot.g-foundation {
		fill: var(--g-foundation);
	}
	.dot.g-libraries {
		fill: var(--g-libraries);
	}
	.dot.g-apps {
		fill: var(--g-apps);
	}
	.dot.g-integrations {
		fill: var(--g-integrations);
	}
	.dot-wrap {
		transform-box: fill-box;
		transform-origin: center;
	}

	/* Rows */
	.row {
		position: relative;
		display: flex;
		align-items: center;
		height: var(--row-h);
		padding-left: var(--indent);
		transition: opacity 160ms var(--ease-out);
	}
	/* The band, on the rows being read: from just left of the dot to the row's end, under everything. */
	.row::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: 3px 0 3px calc(var(--indent) - var(--dot-gap) - 11px);
		border-radius: 10px;
		/*
		 * In-gamut tints of the lit blue. A color-mix of --lit (chroma 0.4, outside sRGB) rasterised
		 * yellow in Chromium while its opacity was in transition.
		 */
		background: oklch(0.6 0.13 250 / 0.1);
		box-shadow: inset 0 0 0 1px oklch(0.6 0.13 250 / 0.22);
		opacity: 0;
		transition: opacity 200ms var(--ease-out);
	}
	.row.here::before {
		opacity: 1;
	}
	.dim .row:not(.on) {
		opacity: 0.5;
	}
	.name {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
		height: 100%;
		padding-inline: 8px;
		margin-left: -8px;
		border-radius: calc(var(--radius) * 0.8);
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 500;
		color: var(--foreground);
		transition: background-color 150ms var(--ease-out);
	}
	.label {
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.hero .name {
		gap: 10px;
		font-size: 14.5px;
	}
	.row.here .name {
		font-weight: 600;
	}

	/* A row's picture (phone hero): the node's postage stamp, small. */
	.stamp {
		position: relative;
		flex: none;
		width: 42px;
		height: 28px;
		overflow: hidden;
		border-radius: 5px;
		background: var(--muted);
	}
	.stamp::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.stamp img,
	.stamp svg {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top left;
	}
	.code-bg {
		fill: var(--code-bg);
	}
	.code {
		fill: var(--code-fg);
		font-family: var(--font-mono);
		font-size: 8.5px;
	}
	/* Narrow phones: the name needs the room more than the picture does. */
	@container (width < 350px) {
		.stamp {
			display: none;
		}
	}

	.icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 36px;
		height: 40px;
		border-radius: calc(var(--radius) * 0.8);
		color: var(--muted-foreground);
		transition:
			color 150ms var(--ease-out),
			background-color 150ms var(--ease-out);
	}
	.hero .icon {
		width: 44px;
		height: 44px;
	}
	@media (pointer: coarse) {
		.icon {
			width: 44px;
			height: 44px;
		}
	}
	a.icon :global(svg) {
		transition: transform 150ms var(--ease-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.name:hover,
		a.icon:hover {
			background: var(--accent);
		}
		a.icon:hover {
			color: var(--foreground);
		}
		a.icon:hover :global(.lucide) {
			transform: translate(1.5px, -1.5px);
		}
	}
	.name:active,
	a.icon:active {
		background: var(--accent);
	}
	.name:focus-visible,
	.icon:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
		background: var(--accent);
	}

	/* Entrance, hero only: dots and rows pop from the base up; rails draw from each parent. */
	.hero .dot-wrap {
		animation: dot-in 360ms var(--ease-back) var(--d) backwards;
	}
	.hero .row {
		animation: row-in 420ms var(--ease-out) var(--d) backwards;
	}
	.hero .edge:not(.port) .edge-base {
		animation: draw 380ms var(--ease-out) var(--d) backwards;
	}
	.hero .edge.port .edge-base {
		animation: fade 240ms var(--ease-out) var(--d) backwards;
	}

	/* Rail: a faint track shows the whole stack; each wire draws as its panel scrolls in. */
	.edge-ghost {
		stroke: var(--wire);
		stroke-width: 1.25;
		stroke-dasharray: 1.5 3.5;
		opacity: 0.55;
	}
	.dot-ghost {
		fill: var(--background);
		stroke: var(--wire);
		stroke-width: 1.25;
	}
	@supports (animation-timeline: view()) and (timeline-scope: none) {
		.rail .edge:not(.port) .edge-base {
			animation: draw linear both;
			animation-timeline: var(--tl);
			animation-range: entry 15% cover 40%;
		}
		.rail .edge.port .edge-base {
			animation: fade linear both;
			animation-timeline: var(--tl);
			animation-range: entry 15% cover 40%;
		}
		.rail .dot-wrap {
			animation: dot-in-linked linear both;
			animation-timeline: var(--tl);
			animation-range: cover 34% cover 44%;
		}
	}
	/* Without scroll-driven CSS: the page marks what is not reached yet, and a transition draws it. */
	.rail .edge:not(.port) .edge-base {
		transition: stroke-dashoffset 520ms var(--ease-out);
	}
	.rail .edge.port .edge-base,
	.rail .dot-wrap {
		transition:
			opacity 360ms var(--ease-out),
			transform 360ms var(--ease-back);
	}
	.rail .edge.pending:not(.port) .edge-base {
		stroke-dashoffset: 1;
	}
	.rail .edge.port.pending .edge-base,
	.rail .dot-slot.pending .dot-wrap {
		opacity: 0;
	}
	.rail .dot-slot.pending .dot-wrap {
		transform: scale(0.4);
	}

	@keyframes dot-in {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
	}
	@keyframes dot-in-linked {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
		70% {
			opacity: 1;
			transform: scale(1.15);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes row-in {
		from {
			opacity: 0;
			transform: translateX(-8px);
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

	/* Reduced motion: nothing moves. Rows, dots and rails fade in, in the same order; paths fade. */
	@media (prefers-reduced-motion: reduce) {
		.hero .dot-wrap,
		.hero .row,
		.hero .edge:not(.port) .edge-base {
			animation-name: fade;
		}
		.edge.on:not(.port) .edge-lit {
			animation: none;
		}
		/* Rail: what is not reached yet is hidden, not undrawn; it fades in. */
		.rail .dot-slot.pending .dot-wrap {
			transform: none;
		}
		.rail .edge:not(.port) .edge-base {
			transition: opacity 360ms var(--ease-out);
		}
		.rail .edge.pending:not(.port) .edge-base {
			stroke-dashoffset: 0;
			opacity: 0;
		}
		@supports (animation-timeline: view()) and (timeline-scope: none) {
			.rail .edge:not(.port) .edge-base,
			.rail .dot-wrap {
				animation-name: fade;
			}
		}
		a.icon:hover :global(.lucide) {
			transform: none;
		}
	}
</style>
