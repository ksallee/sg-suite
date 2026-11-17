<script lang="ts">
	// An install command, set so it wraps only at spaces and after a URL's slashes.
	import { pieces } from '$lib/pure/cmd';

	let { cmd }: { cmd: string } = $props();
</script>

{#each pieces(cmd) as t, i (i)}<span class="nb">{t.text}</span><wbr />{/each}

<style>
	.nb {
		white-space: pre;
	}
</style>
