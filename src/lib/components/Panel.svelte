<script lang="ts">
	// A project as a node's properties panel in Nuke's Properties bin: a title bar in the node's
	// class colour (its group hue), knob rows with labels lowercase and right-aligned, and the
	// picture fitted whole in a Viewer, with its format frame and size. The repo and site knobs
	// hold the GitHub and Site buttons, the packages knob one code block per package. A link to
	// the panel (a graph node, a tree row, a knob) selects it: the address keeps its cell, the
	// panel's parent with the project's name as id, `:target`.
	import type { Project } from '$lib/pure/projects';
	import { projects, relations } from '$lib/pure/projects';
	import { upstream, downstream, repoSlug, siteHost } from '$lib/pure/cards';
	import type { Lit } from '$lib/pure/timing';
	import LinkButton from './LinkButton.svelte';
	import PackageRow from './PackageRow.svelte';

	let {
		project: p,
		lit,
		onactivate
	}: { project: Project; lit: Lit; onactivate: (name: string | null) => void } = $props();

	const up = $derived(upstream(p.name, relations));
	const down = $derived(downstream(p.name, relations));
	const groupOf = (name: string) => projects.find((x) => x.name === name)?.group;
</script>

{#snippet nodeLink(name: string)}
	<a
		class="node-link"
		class:lit={lit.nodes.has(name)}
		href="#{name}"
		onpointerenter={() => onactivate(name)}
		onpointerleave={() => onactivate(null)}
	>
		<span class="swatch g-{groupOf(name)}" aria-hidden="true"></span>{name}
	</a>
{/snippet}

<article
	class="panel"
	class:on={lit.cards.has(p.name)}
	style="--hue: var(--g-{p.group})"
	onpointerenter={() => onactivate(p.name)}
	onpointerleave={() => onactivate(null)}
	onfocusin={() => onactivate(p.name)}
	onfocusout={() => onactivate(null)}
>
	<h3 class="bar">
		<span class="tile" aria-hidden="true"></span>
		<span class="name">{p.name}</span>
	</h3>

	<div class="content">
		<figure class="viewer">
			{#if p.image}
				<div class="format" style="aspect-ratio: {p.image.width} / {p.image.height}">
					<img
						src={p.image.src}
						alt={p.image.alt}
						width={p.image.width}
						height={p.image.height}
						loading="lazy"
						decoding="async"
					/>
					<span class="size" aria-hidden="true">{p.image.width}x{p.image.height}</span>
				</div>
			{:else if p.code}
				<pre><code>{p.code}</code></pre>
			{/if}
		</figure>

		<div class="knobs">
			<p class="line">{p.line}</p>
			<dl>
				<div class="knob">
					<dt>repo</dt>
					<dd class="link"><LinkButton project={p} to="repo" /><span class="val">{repoSlug(p.repo)}</span></dd>
				</div>
				{#if p.site}
					<div class="knob">
						<dt>site</dt>
						<dd class="link"><LinkButton project={p} to="site" /><span class="val">{siteHost(p.site)}</span></dd>
					</div>
				{/if}
				{#if p.packages?.length}
					<div class="knob packages">
						<dt>packages</dt>
						<dd>
							<ul class="pkgs" aria-label="Install {p.name}">
								{#each p.packages as k (k.url)}
									<PackageRow pkg={k} />
								{/each}
							</ul>
						</dd>
					</div>
				{/if}
				{#if up}
					<div class="knob">
						<dt>{up.kind === 'port' ? 'port of' : 'builds on'}</dt>
						<dd class="nodes">{@render nodeLink(up.name)}</dd>
					</div>
				{/if}
				{#if down.length}
					<div class="knob">
						<dt>used by</dt>
						<dd class="nodes">
							{#each down as d (d)}{@render nodeLink(d)}{/each}
						</dd>
					</div>
				{/if}
			</dl>
		</div>
	</div>
</article>

<style>
	.panel {
		--label-w: 76px;
		position: relative;
		border: 1px solid var(--node-edge);
		border-radius: 12px;
		background: var(--card);
		box-shadow: 0 1px 0 var(--node-shadow);
		transition: border-color 160ms var(--ease-out);
	}
	/* Hovered, focused, on a lit path or being read: the border takes a faint tint of the group. */
	.panel.on {
		border-color: color-mix(in oklab, var(--hue) var(--hover-tint), var(--node-edge));
	}
	/* Landing here from the stack: an outline flashes once, as an overlay. */
	.panel::after {
		content: '';
		position: absolute;
		inset: -1px;
		border: 2px solid var(--lit);
		border-radius: inherit;
		opacity: 0;
		pointer-events: none;
	}
	:global(:target) > .panel::after {
		animation: landed 1100ms var(--ease-out);
	}
	@keyframes landed {
		0%,
		40% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* The title bar: the node's class colour. */
	.bar {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 44px;
		margin: 0;
		padding: 0 16px;
		border-radius: 11px 11px 0 0;
		background: color-mix(in oklab, var(--hue) 17%, var(--card));
		box-shadow: inset 0 -1px 0 color-mix(in oklab, var(--hue) 30%, transparent);
		transition: background-color 150ms var(--ease-out);
	}
	:global(.dark) .bar {
		background: color-mix(in oklab, var(--hue) 24%, var(--card));
	}
	/* Selected, as a node is: the bar takes the full class colour while the address points here. */
	:global(:target) > .panel .bar {
		background: color-mix(in oklab, var(--hue) 34%, var(--card));
	}
	.tile {
		width: 10px;
		height: 10px;
		flex: none;
		border-radius: 2px;
		background: var(--hue);
	}
	.name {
		font-family: var(--font-mono);
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* The panel: the Viewer and the knobs. On a phone, the Viewer first. */
	.content {
		display: flex;
		flex-direction: column;
	}
	.viewer {
		display: grid;
		place-items: center;
		margin: 0;
		padding: 16px 16px 30px;
		background: var(--code-bg);
	}
	.format {
		position: relative;
		width: 100%;
		max-height: 100%;
	}
	.format img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		/* The format box, a hairline as Nuke draws it round the frame. */
		outline: 1px solid oklch(1 0 0 / 0.24);
	}
	.size {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		font-family: var(--font-mono);
		font-size: 10.5px;
		line-height: 1;
		color: oklch(1 0 0 / 0.5);
	}
	.viewer pre {
		width: 100%;
		margin: 0;
		color: var(--code-fg);
		font-family: var(--font-mono);
		font-size: clamp(11.5px, 3vw, 12.5px);
		line-height: 1.75;
		white-space: pre;
		overflow: auto;
		scrollbar-width: thin;
	}

	.knobs {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 18px 16px;
	}
	.line {
		max-width: 56ch;
		font-size: 15px;
		line-height: 1.55;
		text-wrap: pretty;
	}
	dl {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin: 0;
	}
	/* Label and value share a baseline, whatever the value's height: a button, a code block, links. */
	.knob {
		display: grid;
		grid-template-columns: var(--label-w) minmax(0, 1fr);
		align-items: baseline;
		column-gap: 14px;
		min-height: 32px;
	}
	dt {
		text-align: right;
		color: var(--muted-foreground);
		font-size: 13px;
		white-space: nowrap;
	}
	dd {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		margin: 0;
	}
	/* GitHub and Site are equal buttons, so they line up knob to knob and panel to panel. */
	.link :global(.btn) {
		width: 10.75rem;
	}
	.val {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 12.5px;
	}
	.pkgs {
		flex: 1;
		min-width: 0;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: color-mix(in oklch, var(--foreground) 2.5%, var(--card));
	}
	.nodes {
		flex-wrap: wrap;
		gap: 2px 4px;
		margin-left: -8px;
	}
	.node-link {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		min-height: 32px;
		padding: 0 8px;
		border-radius: 7px;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		color: var(--foreground);
		transition:
			background-color 150ms var(--ease-out),
			color 150ms var(--ease-out);
	}
	.node-link.lit {
		color: var(--lit);
	}
	.node-link:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 0;
		background: var(--accent);
	}
	@media (pointer: coarse) {
		.node-link {
			min-height: 44px;
		}
	}
	.swatch {
		width: 8px;
		height: 8px;
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
	@media (hover: hover) and (pointer: fine) {
		.node-link:hover {
			background: var(--accent);
		}
	}

	/* Wide: knobs on the left, the Viewer on the right at the panel's full height. */
	@media (width >= 48rem) {
		.panel {
			--label-w: 84px;
		}
		.content {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 43%;
		}
		.viewer {
			grid-column: 2;
			grid-row: 1;
			border-radius: 0 0 11px 0;
			padding: 18px 18px 32px;
		}
		.knobs {
			grid-column: 1;
			grid-row: 1;
			padding: 20px 22px 20px 12px;
		}
		.line {
			padding-left: calc(var(--label-w) + 14px);
		}
	}
	@media (width < 48rem) {
		.knobs {
			padding-left: 8px;
		}
		.line {
			padding-left: 8px;
		}
		/* No room for the address beside the button on a phone: the button fills the knob. */
		.val {
			display: none;
		}
		.link :global(.btn) {
			flex: 1;
			width: auto;
		}
		/* The code blocks need the width: they sit under their label, across the panel. */
		.packages {
			row-gap: 6px;
		}
		.packages dd {
			grid-column: 1 / -1;
		}
	}
</style>
