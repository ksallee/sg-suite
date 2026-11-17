<script lang="ts">
	// One group: a run-in head, as in a book (the name heavy, its line running on in the same
	// size, light and muted), tight to its panels and far from the next group. Then its panels,
	// one column, as a Properties bin.
	import '@fontsource-variable/bricolage-grotesque';
	import type { Group, Project } from '$lib/pure/projects';
	import type { Lit } from '$lib/pure/timing';
	import { reveal } from '$lib/reveal';
	import Panel from './Panel.svelte';

	let {
		group,
		members,
		lit,
		onactivate
	}: { group: Group; members: Project[]; lit: Lit; onactivate: (name: string | null) => void } = $props();

	/** A product name never breaks across lines at this size. */
	const keep = (line: string) => line.replaceAll('Flow PT', 'Flow PT');
</script>

<section class="group" id={group.id} aria-labelledby="{group.id}-title">
	<header use:reveal>
		<div class="run">
			<h2 id="{group.id}-title">{group.title}</h2>
			<p>{keep(group.line)}</p>
		</div>
	</header>
	<div class="bin">
		{#each members as p (p.name)}
			<!--
				The cell is the panel's anchor and stays put; only the panel rises in, so a jump to a
				panel not yet revealed still lands where it should. The rail's wire to this panel
				draws on the cell's view timeline.
			-->
			<div class="cell" id={p.name} style:view-timeline-name="--w-{p.name}" use:reveal>
				<Panel project={p} {lit} {onactivate} />
			</div>
		{/each}
	</div>
</section>

<style>
	.group {
		scroll-margin-top: 24px;
	}
	header {
		max-width: 21em;
		margin-bottom: 0.9em;
		/* Pulls the name's first stem onto the panels' edge: the side bearing grows with the size. */
		margin-left: -0.045em;
		font-family: 'Bricolage Grotesque Variable', sans-serif;
		font-size: clamp(1.875rem, 4.4vw, 3.25rem);
		font-variation-settings: 'opsz' 72;
		line-height: 1.04;
		letter-spacing: -0.035em;
		text-wrap: pretty;
	}
	h2,
	header p {
		display: inline;
	}
	h2 {
		margin-right: 0.28em;
		color: var(--foreground);
		font-weight: 720;
	}
	header p {
		color: var(--muted-foreground);
		font-weight: 330;
		letter-spacing: -0.03em;
	}

	/*
	 * Entrance, once: the head rises out of its own bottom edge, as type out of a slot. The header
	 * clips (only its bottom, with room for descenders) and stays put, so the observer still sees
	 * it; the run inside travels.
	 */
	header:global([data-reveal]) {
		clip-path: inset(-0.4em -0.4em -0.18em -0.4em);
		transition: none;
	}
	header:global([data-reveal='wait']) {
		opacity: 1;
		transform: none;
	}
	header:global([data-reveal]) .run {
		transition:
			transform 720ms var(--ease-out),
			opacity 420ms var(--ease-out);
	}
	header:global([data-reveal='wait']) .run {
		opacity: 0;
		transform: translateY(105%);
	}

	.bin {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	/* Lands level with the rail's top. */
	.cell {
		scroll-margin-top: 24px;
	}
	.cell:global([data-reveal]) {
		transition: none;
	}
	.cell:global([data-reveal='wait']) {
		opacity: 1;
		transform: none;
	}
	.cell:global([data-reveal]) > :global(*) {
		transition:
			opacity 520ms var(--ease-out),
			transform 620ms var(--ease-out);
	}
	.cell:global([data-reveal='wait']) > :global(*) {
		opacity: 0;
		transform: translateY(18px);
	}

	@media (prefers-reduced-motion: reduce) {
		header:global([data-reveal='wait']) .run,
		.cell:global([data-reveal='wait']) > :global(*) {
			transform: none;
		}
	}
</style>
