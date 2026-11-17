import { describe, expect, it } from 'vitest';
import { groups, projects, relations } from './projects.ts';
import { DESCRIPTION, headFor, jsonLd, llmsTxt, SITE, sitemapXml } from './seo.ts';

describe('headFor', () => {
	const h = headFor();

	it('writes the title, description and canonical', () => {
		expect(h).toContain('<title>sg-suite</title>');
		expect(h).toContain(`<meta name="description" content="${DESCRIPTION}" />`);
		expect(h).toContain(`<link rel="canonical" href="${SITE}/" />`);
	});

	it('writes Open Graph and Twitter tags with a 1200x630 card', () => {
		expect(h).toContain('<meta property="og:type" content="website" />');
		expect(h).toContain(`<meta property="og:url" content="${SITE}/" />`);
		expect(h).toContain(`<meta property="og:image" content="${SITE}/og.png" />`);
		expect(h).toContain('<meta property="og:image:width" content="1200" />');
		expect(h).toContain('<meta property="og:image:height" content="630" />');
		expect(h).toMatch(/<meta property="og:image:alt" content="[^"]+" \/>/);
		expect(h).toContain('<meta name="twitter:card" content="summary_large_image" />');
		expect(h).toContain(`<meta name="twitter:image" content="${SITE}/og.png" />`);
	});

	it('links the favicon and the llms.txt', () => {
		expect(h).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />');
		expect(h).toContain('<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />');
	});

	it('carries the JSON-LD in a script that nothing in the data can close early', () => {
		expect(h).toContain('<script type="application/ld+json">');
		const body = h.split('<script type="application/ld+json">')[1].split('</script>')[0];
		expect(body).not.toContain('<');
		expect(JSON.parse(body)).toEqual(jsonLd());
	});
});

describe('jsonLd', () => {
	const ld = jsonLd() as {
		'@type': string;
		url: string;
		mainEntity: { itemListElement: { position: number; item: Record<string, unknown> }[] };
	};
	const items = ld.mainEntity.itemListElement;

	it('is a collection page at the site, listing every project once, in order', () => {
		expect(ld['@type']).toBe('CollectionPage');
		expect(ld.url).toBe(`${SITE}/`);
		expect(items.map((i) => i.item.name)).toEqual(projects.map((p) => p.name));
		expect(items.map((i) => i.position)).toEqual(projects.map((_, i) => i + 1));
	});

	it('gives each project its line, repository, licence, site and what it builds on', () => {
		for (const p of projects) {
			const item = items.find((i) => i.item.name === p.name)!.item;
			expect(item['@type']).toBe('SoftwareSourceCode');
			expect(item.description).toBe(p.line);
			expect(item.codeRepository).toBe(p.repo);
			expect(item.license).toBe(`https://spdx.org/licenses/${p.license}.html`);
			expect(item.url).toBe(p.site ?? p.repo);
			const on = relations.find((r) => r.from === p.name);
			expect(item.isBasedOn, p.name).toEqual(on ? projects.find((q) => q.name === on.to)!.repo : undefined);
		}
	});
});

describe('sitemapXml', () => {
	it('lists the one page, absolute', () => {
		const xml = sitemapXml();
		expect(xml).toContain(`<loc>${SITE}/</loc>`);
		expect(xml.match(/<url>/g)).toHaveLength(1);
	});
});

describe('llmsTxt', () => {
	const text = llmsTxt();

	it('opens with the name and the line, as llms.txt asks', () => {
		expect(text.startsWith('# sg-suite\n\n> ')).toBe(true);
	});

	it('has every group, and under it every project with its links and installs', () => {
		for (const g of groups) expect(text).toContain(`## ${g.title}`);
		for (const p of projects) {
			expect(text, p.name).toContain(`### ${p.name}`);
			expect(text, p.name).toContain(p.line);
			expect(text, p.name).toContain(p.repo);
			if (p.site) expect(text, p.name).toContain(p.site);
			for (const k of p.packages ?? []) expect(text, `${p.name} ${k.name}`).toContain(k.install);
		}
	});

	it('says what each project builds on, or that it is a port', () => {
		expect(text).toContain('Builds on: sg-groundtruth');
		expect(text).toContain('Port of: sg-widgets');
	});
});
