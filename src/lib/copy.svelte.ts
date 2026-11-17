// Copying an install command, and the one page-wide record of the last copy. Every copy button
// writes here; `CopyStatus` reads it to say what was copied.

export const clip = $state({ text: '', n: 0 });

/** The clipboard API, then the old `execCommand` route for a context without it. */
async function write(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
		document.body.append(ta);
		ta.select();
		let ok = false;
		try {
			ok = document.execCommand('copy');
		} catch {
			ok = false;
		}
		ta.remove();
		return ok;
	}
}

/** Copy `text`. Resolves false when the browser refused; the caller then selects the text. */
export async function copy(text: string): Promise<boolean> {
	const ok = await write(text);
	if (ok) {
		clip.text = text;
		clip.n++;
	}
	return ok;
}

/** Select an element's text, so a refused copy still leaves the command one keystroke away. */
export function selectText(node: Element | null | undefined): void {
	if (!node) return;
	const range = document.createRange();
	range.selectNodeContents(node);
	const sel = getSelection();
	sel?.removeAllRanges();
	sel?.addRange(range);
}
