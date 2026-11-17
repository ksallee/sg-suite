# sg-suite

The sg- projects on one page: tools and libraries for Flow Production Tracking, formerly ShotGrid.
Live at [sg-suite.vercel.app](https://sg-suite.vercel.app).

## Projects

| repo | what | site |
|---|---|---|
| [sg-groundtruth](https://github.com/ksallee/sg-groundtruth) | Recorded behaviour of the Flow PT REST API: one probe per question, the answer verbatim. The corpus the rest builds on. | [sg-groundtruth.vercel.app](https://sg-groundtruth.vercel.app) |
| [sg-mockgun](https://github.com/ksallee/sg-mockgun) | Mockgun from shotgun_api3, standalone, extended with behaviour recorded by sg-groundtruth. | |
| [sg-widgets](https://github.com/ksallee/sg-widgets) | shadcn-compatible widgets for React and Svelte: pickers, tables, trees, filter and field editors. | [sg-widgets.vercel.app](https://sg-widgets.vercel.app) |
| [sg-widgets-qt](https://github.com/ksallee/sg-widgets-qt) | The Qt port of sg-widgets, for tools inside Maya, Houdini, Nuke, RV or a standalone app. | |
| [sg-notes](https://github.com/ksallee/sg-notes) | Every note in a project under the record it is about, threaded, searched and acted on in bulk. | [sg-notes.vercel.app](https://sg-notes.vercel.app) |
| [sg-onset](https://github.com/ksallee/sg-onset) | On-set VFX data capture: slates, takes, setups, lenses. Offline-first PWA, iPad first. | [sg-onset.vercel.app](https://sg-onset.vercel.app) |
| [sg-fields-setup](https://github.com/ksallee/sg-fields-setup) | Named sets of field definitions: import from spreadsheets, compare with a live site, install. | [sg-fields-setup.vercel.app](https://sg-fields-setup.vercel.app) |
| [sg-task-templates](https://github.com/ksallee/sg-task-templates) | Apply a Task Template to entities that already have Tasks. Only the missing Tasks are created. | [sg-task-templates.vercel.app](https://sg-task-templates.vercel.app) |
| [sg-comfyui](https://github.com/ksallee/sg-comfyui) | ComfyUI nodes and a sidebar tab that publish a generation as a Version, find Versions and load them back. | [sg-comfyui.vercel.app](https://sg-comfyui.vercel.app) |

## Adding a project

One entry in `src/lib/pure/projects.ts` and one row in the table above. A test fails when the two
disagree. The entry names its group, what it builds on (`relations`), its picture in
`static/screens/` and its packages. List a package only once it is live on its registry.

## Development

    pnpm install
    pnpm dev          # the page
    pnpm test         # the pure modules
    pnpm check
    pnpm build        # prerenders the page

`pnpm shoot <path> [name] [--full] [--mobile] [--dark] [--reduced] [--frames=n]` writes screenshots
to `shots/`, against a dev server on port 5199 (`pnpm dev --port 5199`).

Deployed on Vercel from `main` alone: `vercel.json` skips every other branch.
