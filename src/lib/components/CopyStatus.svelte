<script lang="ts">
	// Says what was copied, to a screen reader. The button itself shows it on screen.
	import { clip } from '$lib/copy.svelte';
</script>

<div class="sr-only" role="status" aria-live="polite">
	{#key clip.n}{clip.n ? `Copied ${clip.text}` : ''}{/key}
</div>
