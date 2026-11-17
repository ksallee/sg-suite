<script lang="ts">
	// One package, as a docs code block: its registry (a link to its page there) and name on the
	// left of the head, Copy on the right, the install command below.
	import type { Package } from '$lib/pure/projects';
	import { ArrowUpRight } from '@lucide/svelte';
	import CopyButton from './CopyButton.svelte';
	import Cmd from './Cmd.svelte';

	let { pkg: k }: { pkg: Package } = $props();
	let code = $state<HTMLElement | null>(null);
</script>

<li class="pkg">
	<div class="head">
		<a class="reg" href={k.url} aria-label="{k.name} on {k.registry}">
			{k.registry}<ArrowUpRight class="size-[13px] arrow" strokeWidth={2.2} />
		</a>
		<span class="name" title={k.name}>{k.name}</span>
		<CopyButton text={k.install} select={code} class="pkg-copy" />
	</div>
	<code bind:this={code}><span class="prompt" aria-hidden="true">$</span><Cmd cmd={k.install} /></code>
</li>

<style>
	.pkg:not(:first-child) {
		border-top: 1px solid var(--border);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		padding: 6px 6px 0 12px;
	}
	.reg {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		flex: none;
		min-height: 30px;
		margin-left: -6px;
		padding: 0 6px;
		border-radius: 6px;
		color: var(--foreground);
		font-size: 13px;
		font-weight: 600;
		transition: background-color 150ms var(--ease-out);
	}
	.reg :global(.arrow) {
		color: var(--muted-foreground);
		transition:
			transform 150ms var(--ease-out),
			color 150ms var(--ease-out);
	}
	.reg:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 1px;
	}
	.name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 12px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	code {
		display: block;
		padding: 4px 14px 12px 12px;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.45;
		overflow-wrap: anywhere;
		color: var(--foreground);
	}
	.prompt {
		margin-right: 0.6ch;
		color: var(--muted-foreground);
		user-select: none;
	}
	.head :global(.pkg-copy) {
		--copied: var(--success);
		--glyph: 15px;
		min-height: 34px;
		padding: 0 11px 0 10px;
		border: 1px solid var(--input);
		border-radius: 8px;
		background: var(--card);
		color: var(--foreground);
		font-size: 13px;
		font-weight: 550;
	}
	@media (pointer: coarse) {
		.reg,
		.head :global(.pkg-copy) {
			min-height: 44px;
		}
		.head :global(.pkg-copy) {
			padding: 0 14px 0 12px;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.reg:hover {
			background: var(--accent);
		}
		.reg:hover :global(.arrow) {
			color: var(--foreground);
			transform: translate(1.5px, -1.5px);
		}
		.head :global(.pkg-copy:hover) {
			background: var(--accent);
			border-color: color-mix(in oklab, var(--hue) var(--hover-tint), var(--input));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.reg:hover :global(.arrow) {
			transform: none;
		}
	}
</style>
