/**
 * Every sg- project, as the README table lists it. The page only renders this list.
 * Adding a project means one entry here and one row in the README; a test keeps the two in step.
 */

export type GroupId = 'foundation' | 'libraries' | 'apps' | 'integrations';

export interface Group {
	id: GroupId;
	title: string;
	line: string;
}

export interface Picture {
	/** Under `static/screens/`. */
	src: string;
	alt: string;
	width: number;
	height: number;
	/** Where the picture comes from: the repo's README, or a shot of the live site. */
	from: 'readme' | 'site';
}

/** Where a package is published, as its users know the place. */
export const registries = ['PyPI', 'npm', 'shadcn', 'shadcn-svelte', 'Comfy Registry'] as const;
export type Registry = (typeof registries)[number];

/** A published, installable package. Only what is live on its registry goes here. */
export interface Package {
	registry: Registry;
	name: string;
	/** The package's page on its registry, or the registry file for shadcn. */
	url: string;
	/** The command from the project's README. */
	install: string;
}

/** SPDX licence ids the projects use. */
export type License = 'MIT' | 'BSD-3-Clause';

export interface Project {
	name: string;
	/** What it is, in one line: the README table, link previews and llms.txt. */
	line: string;
	/** The pain people have today, from the project's own docs or Kevin. The panel leads with it. */
	problem: string;
	/** What the project does about it. */
	fix: string;
	repo: string;
	site?: string;
	group: GroupId;
	/** From the repo's LICENSE. sg-mockgun keeps shotgun_api3's BSD-3-Clause. */
	license: License;
	image?: Picture;
	/** Shown in place of a picture when a project has neither a screenshot nor a site. */
	code?: string;
	packages?: Package[];
}

export const groups: Group[] = [
	{ id: 'foundation', title: 'Foundation', line: 'The recorded API, and a mock that answers the same way.' },
	{ id: 'libraries', title: 'Libraries', line: 'Widgets for web and Qt tools.' },
	{ id: 'apps', title: 'Apps', line: 'Web apps built on the widgets.' },
	{ id: 'integrations', title: 'Integrations', line: 'Flow PT inside other tools.' }
];

const gh = (name: string): string => `https://github.com/ksallee/${name}`;

export const projects: Project[] = [
	{
		name: 'sg-groundtruth',
		line: 'Recorded behaviour of the Flow PT REST API: one probe per question, the answer verbatim. The corpus the rest builds on.',
		problem: 'The REST docs are incomplete and in places wrong. Sort on a misspelled field: 200, sort ignored, no warning.',
		fix: 'Each probe asks a live site one question and records the answer verbatim. Doubt an entry, re-run its probe.',
		repo: gh('sg-groundtruth'),
		packages: [
			{ registry: 'PyPI', name: 'sg-groundtruth', url: 'https://pypi.org/project/sg-groundtruth/', install: 'pip install sg-groundtruth' }
		],
		site: 'https://sg-groundtruth.vercel.app',
		group: 'foundation',
		license: 'MIT',
		image: {
			src: '/screens/sg-groundtruth.webp',
			alt: 'The sg-groundtruth site',
			width: 1440,
			height: 900,
			from: 'site'
		}
	},
	{
		name: 'sg-mockgun',
		line: 'Mockgun from shotgun_api3, standalone, extended with behaviour recorded by sg-groundtruth.',
		problem: "Mockgun has no schema field writes and no event log. Code tested on it never meets a live site's answers.",
		fix: 'Mockgun on its own. Field writes and the event log answer as a Flow PT site does, faults and wording included.',
		repo: gh('sg-mockgun'),
		packages: [
			{ registry: 'PyPI', name: 'sg-mockgun', url: 'https://pypi.org/project/sg-mockgun/', install: 'pip install sg-mockgun' }
		],
		group: 'foundation',
		license: 'BSD-3-Clause',
		code: [
			'pip install sg-mockgun',
			'',
			'from sg_mockgun import Shotgun, schemas',
			'Shotgun.set_schema_paths(*schemas.paths())',
			'sg = Shotgun("https://mock.example.com", script_name="x", api_key="y")'
		].join('\n')
	},
	{
		name: 'sg-widgets',
		line: 'shadcn-compatible widgets for React and Svelte: pickers, tables, trees, filter and field editors.',
		problem: 'There are no good ready-made Flow PT widgets for web apps.',
		fix: 'Pickers, tables, trees and editors for React and Svelte, ready for agentic coding. shadcn compatible, so you bring your own components for the rest.',
		repo: gh('sg-widgets'),
		packages: [
			{
				registry: 'shadcn',
				name: 'sg-widgets for React',
				url: 'https://sg-widgets.vercel.app/r/react/sg-widgets.json',
				install: 'pnpm dlx shadcn@latest add https://sg-widgets.vercel.app/r/react/sg-widgets.json'
			},
			{
				registry: 'shadcn-svelte',
				name: 'sg-widgets for Svelte',
				url: 'https://sg-widgets.vercel.app/r/svelte/sg-widgets.json',
				install: 'pnpm dlx shadcn-svelte@latest add https://sg-widgets.vercel.app/r/svelte/sg-widgets.json'
			},
			{ registry: 'npm', name: 'sg-widgets-core', url: 'https://www.npmjs.com/package/sg-widgets-core', install: 'pnpm add sg-widgets-core' }
		],
		site: 'https://sg-widgets.vercel.app',
		group: 'libraries',
		license: 'MIT',
		image: {
			src: '/screens/sg-widgets.webp',
			alt: 'One screen: a table, a tree, a grid, the pickers and the editors',
			width: 1440,
			height: 900,
			from: 'readme'
		}
	},
	{
		name: 'sg-widgets-qt',
		line: 'The Qt port of sg-widgets, for tools inside Maya, Houdini, Nuke, RV or a standalone app.',
		problem: 'The Flow PT Qt widgets that exist come with Toolkit. They are tied to it, and not great.',
		fix: 'Pickers, editors, tables and trees for Maya, Houdini, Nuke, RV or your own app. No Toolkit. They run on whichever Qt binding the host loaded.',
		repo: gh('sg-widgets-qt'),
		packages: [
			{ registry: 'PyPI', name: 'sg-widgets-qt', url: 'https://pypi.org/project/sg-widgets-qt/', install: 'pip install "sg-widgets-qt[pyside6]"' }
		],
		group: 'libraries',
		license: 'MIT',
		image: {
			src: '/screens/sg-widgets-qt.webp',
			alt: 'An entity table grouped by status, with status badges and thumbnails',
			width: 1252,
			height: 636,
			from: 'readme'
		}
	},
	{
		name: 'sg-notes',
		line: 'Every note in a project under the record it is about, threaded, searched and acted on in bulk.',
		problem: 'The Inbox sits at 99+ with no filters. Nothing shows who owes a reply. You cannot forward a note.',
		fix: 'Notes grouped under their shot, asset or version. Reply and close in bulk, forward a copy, see who owes the next word.',
		repo: gh('sg-notes'),
		site: 'https://sg-notes.vercel.app',
		group: 'apps',
		license: 'MIT',
		image: {
			src: '/screens/sg-notes.webp',
			alt: "The lead view: a project's notes grouped under the records they are about, with one thread open",
			width: 1440,
			height: 900,
			from: 'readme'
		}
	},
	{
		name: 'sg-onset',
		line: 'On-set VFX data capture: slates, takes, setups, lenses. Offline-first PWA, iPad first.',
		problem: 'Flow PT has no offline mode and no capture app. Wranglers log takes elsewhere and import a CSV later.',
		fix: 'An iPad app for slates, takes, lenses and photos that works with no network. Sync to Flow PT is next.',
		repo: gh('sg-onset'),
		site: 'https://sg-onset.vercel.app',
		group: 'apps',
		license: 'MIT',
		image: {
			src: '/screens/sg-onset.webp',
			alt: 'The sg-onset site',
			width: 1440,
			height: 900,
			from: 'site'
		}
	},
	{
		name: 'sg-fields-setup',
		line: 'Named sets of field definitions: import from spreadsheets, compare with a live site, install.',
		problem: "Custom fields are made by hand in Flow PT's admin screens, often thirty at once. Slow, and easy to get wrong.",
		fix: 'Keep the fields as a named set, filled from a spreadsheet. Compare it with the site, read the plan, then install.',
		repo: gh('sg-fields-setup'),
		site: 'https://sg-fields-setup.vercel.app',
		group: 'apps',
		license: 'MIT',
		image: {
			src: '/screens/sg-fields-setup.webp',
			alt: 'The editor',
			width: 1280,
			height: 852,
			from: 'readme'
		}
	},
	{
		name: 'sg-task-templates',
		line: 'Apply a Task Template to entities that already have Tasks. Only the missing Tasks are created.',
		problem: 'Switch a Shot to an overlapping template and Flow PT flags every Task. Keep them: duplicates. Delete them: orphaned Versions.',
		fix: 'Tasks are matched by name and Step and linked. Only the missing ones are created. Every change shows before it is written.',
		repo: gh('sg-task-templates'),
		site: 'https://sg-task-templates.vercel.app',
		group: 'apps',
		license: 'MIT',
		image: {
			src: '/screens/sg-task-templates.webp',
			alt: "A Shot with Layout, Anim and Comp gets a template that adds Light. Flow PT's apply duplicates Layout and Anim and deletes Comp, orphaning its 3 Versions. This app links the three and creates Light.",
			width: 1792,
			height: 870,
			from: 'readme'
		}
	},
	{
		name: 'sg-comfyui',
		line: "ComfyUI nodes that publish a generation as a Version and load a Version's media back.",
		problem: 'On a big project, the right Version is hard to find from ComfyUI. What it makes leaves with no record of model, prompt or seed.',
		fix: "The SG tab searches a project's Versions, shows their provenance and adds them to the graph. Each generation is published as a Version, with its model, prompt, seed and workflow.",
		repo: gh('sg-comfyui'),
		packages: [
			{ registry: 'Comfy Registry', name: 'sg-comfyui', url: 'https://registry.comfy.org/nodes/sg-comfyui', install: 'comfy node install sg-comfyui' }
		],
		site: 'https://sg-comfyui.vercel.app',
		group: 'integrations',
		license: 'MIT',
		image: {
			src: '/screens/sg-comfyui.webp',
			alt: 'The example workflow: an image into SG Publish, and SG Load reading the Version back',
			width: 2882,
			height: 920,
			from: 'readme'
		}
	}
];

/** How the projects build on each other. sg-groundtruth is the base. */
export type RelationKind = 'on' | 'port';

/** `from` builds on `to` ('on'), or is a port of it ('port'). Every project but the base has one. */
export interface Relation {
	from: string;
	to: string;
	kind: RelationKind;
}

export const relations: Relation[] = [
	{ from: 'sg-mockgun', to: 'sg-groundtruth', kind: 'on' },
	{ from: 'sg-widgets', to: 'sg-groundtruth', kind: 'on' },
	{ from: 'sg-comfyui', to: 'sg-groundtruth', kind: 'on' },
	{ from: 'sg-widgets-qt', to: 'sg-widgets', kind: 'port' },
	{ from: 'sg-notes', to: 'sg-widgets', kind: 'on' },
	{ from: 'sg-onset', to: 'sg-widgets', kind: 'on' },
	{ from: 'sg-fields-setup', to: 'sg-widgets', kind: 'on' },
	{ from: 'sg-task-templates', to: 'sg-widgets', kind: 'on' }
];

/** The groups in order, each with its projects in list order. */
export function grouped(): { group: Group; projects: Project[] }[] {
	return groups.map((group) => ({ group, projects: projects.filter((p) => p.group === group.id) }));
}
