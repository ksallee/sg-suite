// Renders the page's own first screen to static/og.png, 1200 by 630, for link previews.
// Run with the dev server up on port 5199: node tools/make-og.mjs. Rerun when the hero changes.
import { chromium } from 'playwright';

const base = process.env.SHOOT_BASE ?? 'http://localhost:5199';
const browser = await chromium.launch();
// 1680x882 is the card's 1200:630, at a width where the title and the whole graph sit side by
// side as on a desktop; a 1200/1680 scale brings it to 1200x630.
const page = await browser.newPage({ viewport: { width: 1680, height: 882 }, deviceScaleFactor: 1200 / 1680, colorScheme: 'light' });
await page.goto(base + '/', { waitUntil: 'networkidle' });
// The legend falls below the card's bottom edge; a cut line reads as a mistake, so it goes.
await page.addStyleTag({ content: 'nav.legend { visibility: hidden }' });
await page.waitForTimeout(2500);
await page.screenshot({ path: 'static/og.png' });
await browser.close();
console.log('static/og.png');
