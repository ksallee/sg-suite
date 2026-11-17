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

export interface Project {
	name: string;
	line: string;
	repo: string;
	site?: string;
	group: GroupId;
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
		repo: gh('sg-groundtruth'),
		packages: [
			{ registry: 'PyPI', name: 'sg-groundtruth', url: 'https://pypi.org/project/sg-groundtruth/', install: 'pip install sg-groundtruth' }
		],
		site: 'https://sg-groundtruth.vercel.app',
		group: 'foundation',
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
		repo: gh('sg-mockgun'),
		packages: [
			{ registry: 'PyPI', name: 'sg-mockgun', url: 'https://pypi.org/project/sg-mockgun/', install: 'pip install sg-mockgun' }
		],
		group: 'foundation',
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
		repo: gh('sg-widgets-qt'),
		packages: [
			{ registry: 'PyPI', name: 'sg-widgets-qt', url: 'https://pypi.org/project/sg-widgets-qt/', install: 'pip install "sg-widgets-qt[pyside6]"' }
		],
		group: 'libraries',
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
		repo: gh('sg-notes'),
		site: 'https://sg-notes.vercel.app',
		group: 'apps',
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
		repo: gh('sg-onset'),
		site: 'https://sg-onset.vercel.app',
		group: 'apps',
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
		repo: gh('sg-fields-setup'),
		site: 'https://sg-fields-setup.vercel.app',
		group: 'apps',
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
		repo: gh('sg-task-templates'),
		site: 'https://sg-task-templates.vercel.app',
		group: 'apps',
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
		repo: gh('sg-comfyui'),
		packages: [
			{ registry: 'Comfy Registry', name: 'sg-comfyui', url: 'https://registry.comfy.org/nodes/sg-comfyui', install: 'comfy node install sg-comfyui' }
		],
		site: 'https://sg-comfyui.vercel.app',
		group: 'integrations',
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
