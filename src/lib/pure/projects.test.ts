import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { groups, grouped, projects, registries } from './projects.ts';

const REPO = /^https:\/\/github\.com\/ksallee\/[a-z0-9-]+$/;

describe('projects', () => {
	it('gives every entry a name, a line and a repo URL', () => {
		expect(projects.length).toBeGreaterThan(0);
		for (const p of projects) {
			expect(p.name, JSON.stringify(p)).toMatch(/^sg-[a-z0-9-]+$/);
			expect(p.line.trim().length, p.name).toBeGreaterThan(0);
			expect(p.repo, p.name).toMatch(REPO);
			expect(p.repo.endsWith(`/${p.name}`), p.name).toBe(true);
		}
	});

	it('gives every entry its licence as an SPDX id', () => {
		for (const p of projects) expect(['MIT', 'BSD-3-Clause'], p.name).toContain(p.license);
		expect(projects.find((p) => p.name === 'sg-mockgun')!.license).toBe('BSD-3-Clause');
	});

	it('names each project once', () => {
		const names = projects.map((p) => p.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('gives a site as an https URL when there is one', () => {
		for (const p of projects.filter((p) => p.site)) {
			expect(p.site, p.name).toMatch(/^https:\/\/[^/]+/);
		}
	});

	it('gives every picture an alt text and a path under /screens/', () => {
		for (const p of projects.filter((p) => p.image)) {
			expect(p.image!.src, p.name).toMatch(/^\/screens\/[a-z0-9-]+\.(png|webp|avif|jpg)$/);
			expect(p.image!.alt.trim().length, p.name).toBeGreaterThan(0);
		}
	});

	it('gives every package a registry, a name, an https URL and an install command', () => {
		const withPackages = projects.filter((p) => p.packages?.length);
		expect(withPackages.length).toBeGreaterThan(0);
		for (const p of withPackages) {
			for (const k of p.packages!) {
				expect(registries, `${p.name} ${k.name}`).toContain(k.registry);
				expect(k.name.trim().length, p.name).toBeGreaterThan(0);
				expect(k.url, `${p.name} ${k.name}`).toMatch(/^https:\/\/[^/]+/);
				expect(k.install.trim().length, `${p.name} ${k.name}`).toBeGreaterThan(0);
			}
		}
	});

	it('installs only listed packages in a code snippet', () => {
		for (const p of projects.filter((p) => p.code)) {
			for (const [, name] of p.code!.matchAll(/pip install (\S+)/g)) {
				expect(p.packages?.map((k) => k.name), p.name).toContain(name);
			}
		}
	});

	it('puts every project in a known group, and every group has a project', () => {
		const ids = groups.map((g) => g.id);
		for (const p of projects) expect(ids, p.name).toContain(p.group);
		for (const g of groups) expect(projects.some((p) => p.group === g.id), g.id).toBe(true);
	});
});

describe('grouped', () => {
	it('returns the groups in order, each with its projects in list order', () => {
		const result = grouped();
		expect(result.map((r) => r.group.id)).toEqual(groups.map((g) => g.id));
		expect(result.flatMap((r) => r.projects)).toHaveLength(projects.length);
		for (const r of result) {
			const expected = projects.filter((p) => p.group === r.group.id);
			expect(r.projects).toEqual(expected);
		}
	});
});

/** The README's project table, as name, line and site host. The README is the list people read. */
function readmeRows(): { name: string; line: string; site: string | undefined }[] {
	const readme = readFileSync(new URL('../../../README.md', import.meta.url), 'utf8');
	return readme
		.split('\n')
		.filter((l) => l.startsWith('| [sg-'))
		.map((l) => {
			const [, repo, line, site] = l.split('|').map((c) => c.trim());
			return {
				name: repo.match(/^\[([^\]]+)\]/)![1],
				line,
				site: site.match(/\((https:[^)]+)\)/)?.[1]
			};
		});
}

describe('the README table', () => {
	it('lists the same projects, lines and sites as the module', () => {
		const rows = readmeRows();
		expect(rows.length).toBeGreaterThan(0);
		const byName = new Map(projects.map((p) => [p.name, p]));
		expect([...rows.map((r) => r.name)].sort()).toEqual([...byName.keys()].sort());
		for (const r of rows) {
			const p = byName.get(r.name)!;
			expect(p.line, r.name).toBe(r.line);
			expect(p.site, r.name).toBe(r.site);
		}
	});
});
