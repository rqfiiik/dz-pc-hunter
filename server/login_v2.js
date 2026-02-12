const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

chromium.use(stealth());

async function smartLogin() {
    console.log('🚀 Launching Smart Login Browser...');
    const browser = await chromium.launch({ headless: false });

    // Create context with existing auth if it exists, to see if it helps
    let contextOptions = {
        viewport: { width: 1280, height: 720 }
    };
    if (fs.existsSync('auth.json')) {
        contextOptions.storageState = JSON.parse(fs.readFileSync('auth.json', 'utf8'));
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
        await page.goto('https://www.ouedkniss.com/auth/login', { waitUntil: 'domcontentloaded' });

        console.log('---------------------------------------------------------');
        console.log('👉 PLEASE LOGIN NOW (or solve Captcha)');
        console.log('👀 I am watching LocalStorage for your Token...');
        console.log('---------------------------------------------------------');

        // Poll for token every 2 seconds
        let tokenFound = false;
        const maxRetries = 150; // 5 minutes approx

        for (let i = 0; i < maxRetries; i++) {
            const authFrame = await page.evaluate(() => {
                return localStorage.getItem('ok-auth-frame');
            });

            if (authFrame) {
                const parsed = JSON.parse(authFrame);
                if (parsed && parsed.token) {
                    console.log('🎉 TOKEN DETECTED!');
                    console.log(`Token: ${parsed.token.substring(0, 10)}...`);
                    tokenFound = true;
                    break;
                }
            }

            if (i % 5 === 0) console.log(`Waiting for token... (${i * 2}s)`);
            await page.waitForTimeout(2000);
        }

        if (tokenFound) {
            const storage = await context.storageState();
            // We can also extract the token specifically if we want to save it as a separate file/env var
            // But storageState includes localStorage, which should be enough.
            fs.writeFileSync('auth.json', JSON.stringify(storage, null, 2));
            console.log('✅ Auth saved to auth.json');
        } else {
            console.log('❌ Timed out waiting for token.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        console.log('Closing browser...');
        await browser.close();
    }
}

smartLogin();
