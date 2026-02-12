const { chromium } = require('playwright');
const fs = require('fs');

async function login() {
    console.log('Launching browser... Please login to Ouedkniss or solve the Cloudflare Challenge.');

    // Launch non-headless so user can interact
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    try {
        await page.goto('https://www.ouedkniss.com', { waitUntil: 'domcontentloaded' });

        console.log('---------------------------------------------------------');
        console.log('👉 ACTION REQUIRED: Login or solve the captcha in the browser window.');
        console.log('---------------------------------------------------------');
        console.log('Waiting 60 seconds for you to interact...');

        // Wait for a long time or until a specific "logged in" indicator if we knew one.
        // For now, just wait 60s or wait for user to close browser? 
        // Better: wait for 2 minutes.
        await page.waitForTimeout(120000);

        // Save state
        const storage = await context.storageState();
        fs.writeFileSync('auth.json', JSON.stringify(storage, null, 2));

        console.log('✅ Cookies and Session saved to "auth.json"!');

    } catch (e) {
        console.error('Error or Timeout:', e.message);
    } finally {
        await browser.close();
    }
}

login();
