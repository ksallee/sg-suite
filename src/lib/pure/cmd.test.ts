import { describe, expect, it } from 'vitest';
import { projects } from './projects.ts';
import { pieces } from './cmd.ts';

describe('pieces', () => {
	it('breaks after each space and after a URL’s slashes', () => {
		expect(pieces('pnpm add https://a.b/r/x.json').map((p) => p.text)).toEqual([
			'pnpm ',
			'add ',
			'https://',
			'a.b/',
			'r/',
			'x.json'
		]);
	});

	it('never breaks a name at its hyphen', () => {
		expect(pieces('pip install sg-widgets-qt').map((p) => p.text)).toEqual(['pip ', 'install ', 'sg-widgets-qt']);
	});

	it('gives back every install command whole, piece by piece', () => {
		for (const k of projects.flatMap((p) => p.packages ?? [])) {
			expect(
				pieces(k.install)
					.map((p) => p.text)
					.join(''),
				k.name
			).toBe(k.install);
		}
	});
});
