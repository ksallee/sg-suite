<script lang="ts">
	// Copies one install command. The icon turns to a check and the label to "Copied", then both
	// settle back. `CopyStatus` says what was copied, aloud.
	import { Check, Copy } from '@lucide/svelte';
	import { copy, selectText } from '$lib/copy.svelte';

	let {
		text,
		select,
		class: cls = ''
	}: {
		text: string;
		/** The element holding the command, selected if the browser refuses the copy. */
		select?: Element | null;
		class?: string;
	} = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function onclick() {
		const ok = await copy(text);
		if (!ok) return selectText(select);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1600);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button type="button" class="copy {cls}" class:copied aria-label="Copy {text}" {onclick}>
	<span class="glyphs" aria-hidden="true">
		<span class="g g-idle"><Copy class="size-full" strokeWidth={1.9} /></span>
		<span class="g g-done"><Check class="size-full" strokeWidth={2.4} /></span>
	</span>
	<span class="words" aria-hidden="true">
		<span class="w w-idle">Copy</span>
		<span class="w w-done">Copied</span>
	</span>
</button>

<style>
	.copy {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		flex: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			background-color 150ms var(--ease-out),
			border-color 150ms var(--ease-out),
			color 150ms var(--ease-out),
			transform 120ms var(--ease-out);
	}
	.copy:active {
		transform: scale(0.96);
	}
	.copy:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
	}

	/* Two glyphs and two words in one cell each, so the swap never changes the button's width. */
	.glyphs,
	.words {
		display: inline-grid;
	}
	.glyphs {
		width: var(--glyph, 16px);
		height: var(--glyph, 16px);
	}
	.g,
	.w {
		grid-area: 1 / 1;
		transition:
			opacity 150ms var(--ease-out),
			transform 200ms var(--ease-out);
	}
	.w {
		text-align: left;
	}
	.g-done,
	.w-done {
		opacity: 0;
	}
	.g-done {
		transform: scale(0.6);
		color: var(--copied, currentColor);
	}
	.copied .g-idle,
	.copied .w-idle {
		opacity: 0;
	}
	.copied .g-idle {
		transform: scale(0.6);
	}
	.copied .g-done,
	.copied .w-done {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.copy:active,
		.g-done,
		.copied .g-idle {
			transform: none;
		}
	}
</style>
