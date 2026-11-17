// Screenshots of a page, for the design rounds. Run with the dev server up.
//
//   pnpm shoot <path-or-url> [name] [--full] [--mobile] [--dark] [--reduced] [--wait=ms] [--frames=n]
//
// Writes shots/<name>[-mobile][-dark][-reduced].png. --frames=n also writes n frames over the
// entrance (every 150ms) as shots/<name>-f<i>.png, to check motion. Default base http://localhost:5199.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = new Map(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
const [target, nameArg] = args.filter((a) => !a.startsWith('--'));
if (!target) {
	console.error('usage: pnpm shoot <path-or-url> [name] [--full] [--mobile] [--dark] [--reduced] [--wait=ms] [--frames=n]');
	process.exit(1);
}
const base = process.env.SHOOT_BASE ?? 'http://localhost:5199';
const url = /^https?:/.test(target) ? target : base + (target.startsWith('/') ? target : '/' + target);
const mobile = flags.has('mobile');
const suffix = [mobile && 'mobile', flags.has('dark') && 'dark', flags.has('reduced') && 'reduced'].filter(Boolean);
const name = [nameArg ?? (target.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root'), ...suffix].join('-');

mkdirSync('shots', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
	deviceScaleFactor: mobile ? 2 : 1,
	isMobile: mobile,
	hasTouch: mobile,
	colorScheme: flags.has('dark') ? 'dark' : 'light',
	reducedMotion: flags.has('reduced') ? 'reduce' : 'no-preference'
});
const page = await context.newPage();
const logs = [];
page.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
page.on('pageerror', (e) => logs.push(String(e)));
await page.goto(url, { waitUntil: 'domcontentloaded' });
const frames = Number(flags.get('frames') ?? 0);
for (let i = 0; i < frames; i++) {
	await page.screenshot({ path: `shots/${name}-f${i}.png` });
	await page.waitForTimeout(150);
}
await page.waitForLoadState('networkidle');
await page.waitForTimeout(Number(flags.get('wait') ?? 1500));
if (flags.has('full')) {
	// Scroll through so scroll-triggered reveals have fired, then back to the top.
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 400) {
			window.scrollTo({ top: y, behavior: 'instant' });
			await new Promise((r) => setTimeout(r, 120));
		}
		window.scrollTo({ top: 0, behavior: 'instant' });
		await new Promise((r) => setTimeout(r, 600));
	});
}
await page.screenshot({ path: `shots/${name}.png`, fullPage: flags.has('full') });
console.log(`shots/${name}.png`);
if (logs.length) console.log('console errors:\n' + logs.join('\n'));
await browser.close();
