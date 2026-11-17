import { describe, expect, it } from 'vitest';
import { relations } from './projects.ts';
import { upstream, downstream, repoSlug, siteHost } from './cards.ts';

describe('upstream', () => {
	it('gives what a project builds on, or ports', () => {
		expect(upstream('sg-notes', relations)).toEqual({ name: 'sg-widgets', kind: 'on' });
		expect(upstream('sg-widgets-qt', relations)).toEqual({ name: 'sg-widgets', kind: 'port' });
	});

	it('gives nothing for the base', () => {
		expect(upstream('sg-groundtruth', relations)).toBeUndefined();
	});
});

describe('downstream', () => {
	it('gives the projects that build on it, in list order, ports left out', () => {
		expect(downstream('sg-widgets', relations)).toEqual([
			'sg-notes',
			'sg-onset',
			'sg-fields-setup',
			'sg-task-templates'
		]);
		expect(downstream('sg-groundtruth', relations)).toEqual(['sg-mockgun', 'sg-widgets', 'sg-comfyui']);
	});

	it('gives nothing for a leaf', () => {
		expect(downstream('sg-onset', relations)).toEqual([]);
		expect(downstream('sg-widgets-qt', relations)).toEqual([]);
	});
});

describe('repoSlug and siteHost', () => {
	it('give the owner and repo, and the bare host', () => {
		expect(repoSlug('https://github.com/ksallee/sg-notes')).toBe('ksallee/sg-notes');
		expect(siteHost('https://sg-notes.vercel.app')).toBe('sg-notes.vercel.app');
		expect(siteHost('https://sg-notes.vercel.app/')).toBe('sg-notes.vercel.app');
	});
});
