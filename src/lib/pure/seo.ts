/**
 * What a crawler, a link preview and an AI reader get: the head tags with their JSON-LD,
 * `/sitemap.xml` and `/llms.txt`. All of it from the data module, so it never drifts from the
 * page. After sg-fields-setup's `seo.ts`.
 */

import { grouped, projects, relations, type Project } from './projects.ts';

export const SITE = 'https://sg-suite.vercel.app';
export const REPO = 'https://github.com/ksallee/sg-suite';
const NAME = 'sg-suite';
export const LINE = 'The sg- projects on one page: tools and libraries for Flow Production Tracking, formerly ShotGrid.';
export const DESCRIPTION = `${LINE} The recorded REST API, a standalone mockgun, React, Svelte and Qt widgets, five web apps and ComfyUI nodes.`;
const IMAGE_ALT = 'sg-suite: a node graph of the ten sg- projects, sg-groundtruth at the base.';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const byName = new Map(projects.map((p) => [p.name, p]));
const relationOf = (p: Project) => relations.find((r) => r.from === p.name);

/** schema.org: the page as a collection, each project as source code with its repository. */
export function jsonLd(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: NAME,
		url: `${SITE}/`,
		description: DESCRIPTION,
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: projects.length,
			itemListElement: projects.map((p, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				item: {
					'@type': 'SoftwareSourceCode',
					name: p.name,
					description: p.line,
					abstract: `${p.problem} ${p.fix}`,
					codeRepository: p.repo,
					url: p.site ?? p.repo,
					license: `https://spdx.org/licenses/${p.license}.html`,
					image: p.image ? `${SITE}${p.image.src}` : undefined,
					isBasedOn: relationOf(p) ? byName.get(relationOf(p)!.to)!.repo : undefined
				}
			}))
		}
	};
}

/** The head tags. JSON-LD with every `<` escaped, so no string in the data can close the script. */
export function headFor(): string {
	const img = `${SITE}/og.png`;
	const d = esc(DESCRIPTION);
	const ld = JSON.stringify(jsonLd()).replace(/</g, '\\u003c');
	return [
		`<title>${NAME}</title>`,
		`<meta name="description" content="${d}" />`,
		`<link rel="canonical" href="${SITE}/" />`,
		'<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
		'<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />',
		'<meta property="og:type" content="website" />',
		`<meta property="og:site_name" content="${NAME}" />`,
		`<meta property="og:title" content="${NAME}" />`,
		`<meta property="og:description" content="${d}" />`,
		`<meta property="og:url" content="${SITE}/" />`,
		`<meta property="og:image" content="${img}" />`,
		'<meta property="og:image:width" content="1200" />',
		'<meta property="og:image:height" content="630" />',
		`<meta property="og:image:alt" content="${esc(IMAGE_ALT)}" />`,
		'<meta name="twitter:card" content="summary_large_image" />',
		`<meta name="twitter:title" content="${NAME}" />`,
		`<meta name="twitter:description" content="${d}" />`,
		`<meta name="twitter:image" content="${img}" />`,
		`<script type="application/ld+json">${ld}</script>`
	].join('\n\t\t');
}

export function sitemapXml(): string {
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\t<url><loc>${SITE}/</loc></url>\n</urlset>\n`;
}

/** The whole family in one fetch, for an AI reader: every project by group, links and installs. */
export function llmsTxt(): string {
	const out = [
		`# ${NAME}`,
		'',
		`> ${LINE}`,
		'',
		'Ten open source projects. sg-groundtruth is the base: it records how the Flow Production Tracking REST API answers. sg-mockgun, sg-widgets and sg-comfyui build on it; sg-widgets-qt ports sg-widgets to Qt; the five apps build on sg-widgets.',
		''
	];
	for (const { group, projects: list } of grouped()) {
		out.push(`## ${group.title}`, '', group.line, '');
		for (const p of list) {
			const r = relationOf(p);
			out.push(`### ${p.name}`, '', p.line, '');
			out.push(`- Problem: ${p.problem}`, `- Fix: ${p.fix}`);
			out.push(`- Repository: ${p.repo}`);
			if (p.site) out.push(`- Site: ${p.site}`);
			out.push(`- Licence: ${p.license}`);
			if (r) out.push(`- ${r.kind === 'port' ? 'Port of' : 'Builds on'}: ${r.to}`);
			for (const k of p.packages ?? []) out.push(`- Install (${k.registry}, ${k.name}): \`${k.install}\``);
			out.push('');
		}
	}
	out.push('## This page', '', `- Site: ${SITE}/`, `- Repository: ${REPO}`, '');
	return out.join('\n');
}
