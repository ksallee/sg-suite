<script lang="ts">
	// The page: the stack drawn, then the projects by group, each a panel, with the rail beside
	// them on a wide screen. It only renders `$lib/pure/projects`.
	import { grouped, projects, relations } from '$lib/pure/projects';
	import { headFor } from '$lib/pure/seo';
	import { lit, walk } from '$lib/pure/timing';
	import { reading } from '$lib/reading.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import StackTree from '$lib/components/StackTree.svelte';
	import Group from '$lib/components/Group.svelte';
	import EndLine from '$lib/components/EndLine.svelte';
	import CopyStatus from '$lib/components/CopyStatus.svelte';

	const groups = grouped();
	const order = groups.flatMap((g) => g.projects.map((p) => p.name));

	/** The project hovered or focused anywhere on the page. */
	let active = $state<string | null>(null);
	/**
	 * A clear waits a moment, and the next hover cancels it: moving from one row or node to the
	 * next never passes through "nothing hovered".
	 */
	let clearing: ReturnType<typeof setTimeout> | undefined;
	const activate = (name: string | null) => {
		clearTimeout(clearing);
		if (name) active = name;
		else clearing = setTimeout(() => (active = null), 120);
	};
	/** The panels being read, from the one scroll spy. */
	const read = reading(order);
	/**
	 * What is lit, and how the light gets there from what was lit: kept wires stay drawn, the rest
	 * shrink to where the paths meet, then the new ones grow. `before` is the last lit set.
	 */
	let before = new Map<string, number>();
	const shown = $derived.by(() => {
		const next = lit(active, read.here, relations);
		next.hops = walk(before, next.edges);
		before = next.edges;
		return next;
	});

	/** Each panel names a view timeline; the rail, a sibling, reads them through this scope. */
	const scope = order.map((n) => `--w-${n}`).join(', ');
</script>

<!-- Title, description, link preview, JSON-LD: all from `$lib/pure/seo`, all ours, so @html is safe. -->
<svelte:head>{@html headFor()}</svelte:head>

<!-- `top`: the target of "Back to top", so focus moves there too, not only the scroll. -->
<!-- A click on a link to a panel (rail, graph, legend, builds on, used by) jumps the reading
     there, so the light goes to that panel's path without walking every panel scrolled past. -->
<div
	class="page"
	id="top"
	role="presentation"
	onclick={(e) => {
		const name = (e.target as Element).closest('a[href^="#"]')?.getAttribute('href')?.slice(1);
		if (name && order.includes(name)) read.jump(name);
	}}
>
	<main class="mx-auto max-w-[1320px] px-4 sm:px-8 lg:px-12">
		<Hero {projects} lit={shown} onactivate={activate} />

		<div class="body" style:timeline-scope={scope}>
			<aside class="rail hidden xl:block">
				<StackTree
					{projects}
					lit={shown}
					onactivate={activate}
					variant="rail"
					here={read.here}
					reached={read.reached}
				/>
			</aside>

			<div class="groups">
				{#each groups as { group, projects: members } (group.id)}
					<Group {group} {members} lit={shown} onactivate={activate} />
				{/each}
			</div>
		</div>
	</main>

	<EndLine count={projects.length} />
	<CopyStatus />
</div>

<style>
	.page {
		min-height: 100dvh;
		/* The canvas bleeds past the column; clip, not hidden, so the rail can still stick. */
		overflow-x: clip;
	}

	/* The rail beside the panels on a wide screen. */
	.body {
		margin-top: 40px;
	}
	@media (width >= 80rem) {
		.body {
			display: grid;
			grid-template-columns: 300px minmax(0, 1fr);
			gap: 56px;
			margin-top: 56px;
		}
		.rail {
			position: sticky;
			top: 24px;
			align-self: start;
			padding-top: 6px;
		}
	}

	.groups {
		display: flex;
		flex-direction: column;
		gap: clamp(96px, 12vw, 152px);
	}
	/*
	 * Room for the last group to land at the top like every other group, with the end line on the
	 * floor of the last screen. 210px and 226px: the end line's height (112 above the rule, 58 for
	 * the line, 40 or 56 below).
	 */
	.groups > :global(:last-child) {
		min-height: calc(100svh - 24px - 210px);
	}
	@media (width >= 64rem) {
		.groups > :global(:last-child) {
			min-height: calc(100svh - 24px - 226px);
		}
	}
</style>
