<script lang="ts">
	// GitHub or the site, as one of a pair of equal buttons. The site is the solid one; with no
	// site, GitHub is.
	import type { Project } from '$lib/pure/projects';
	import { ArrowUpRight } from '@lucide/svelte';
	import GithubMark from './GithubMark.svelte';

	let { project: p, to }: { project: Project; to: 'repo' | 'site' } = $props();
</script>

{#if to === 'repo'}
	<a class="btn" class:solid={!p.site} href={p.repo} aria-label="{p.name} on GitHub">
		<GithubMark class="size-[18px]" />
		GitHub
	</a>
{:else if p.site}
	<a class="btn solid" href={p.site} aria-label="Open the {p.name} site">
		Open the site
		<ArrowUpRight class="size-[18px] arrow" strokeWidth={2} />
	</a>
{/if}

<style>
	.btn {
		position: relative;
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 46px;
		padding: 0 16px;
		border: 1px solid var(--input);
		border-radius: 10px;
		background: var(--card);
		color: var(--foreground);
		font-size: 15px;
		font-weight: 550;
		white-space: nowrap;
		-webkit-tap-highlight-color: transparent;
		transition:
			background-color 150ms var(--ease-out),
			border-color 150ms var(--ease-out),
			transform 120ms var(--ease-out);
	}
	.btn.solid {
		border-color: transparent;
		background: var(--foreground);
		color: var(--background);
	}
	.btn :global(.arrow) {
		flex: none;
		transition: transform 150ms var(--ease-out);
	}
	.btn:active {
		transform: scale(0.97);
	}
	.btn:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}
	@media (hover: hover) and (pointer: fine) {
		/* The border takes a faint tint of the panel's group. */
		.btn:hover {
			background: var(--accent);
			border-color: color-mix(in oklab, var(--hue) var(--hover-tint), var(--input));
		}
		.btn.solid:hover {
			background: color-mix(in oklch, var(--foreground) 86%, var(--background));
		}
		.btn:hover :global(.arrow) {
			transform: translate(2px, -2px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.btn:active,
		.btn:hover :global(.arrow) {
			transform: none;
		}
	}
</style>
