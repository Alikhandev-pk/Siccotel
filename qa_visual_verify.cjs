/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS QA script. */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const screenshotsDir = path.resolve(__dirname, 'docs/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      const data = await res.json();
      return data.webSocketDebuggerUrl;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error('Chrome remote debugging port not responding');
}

async function runQa() {
  console.log('Launching headless Chrome with remote debugging on port 9222...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu-watchdog',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1440,1080',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl();
    console.log('Connected to Chrome DevTools WebSocket:', wsUrl);

    // Simple WebSocket client using native WebSocket in Node 22/24
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, (msg) => {
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await new Promise(r => ws.onopen = r);

    // Create a new target/page
    const { targetId } = await send('Target.createTarget', { url: 'http://localhost:3000' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    const sendSession = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, (msg) => {
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });

    await sendSession('Page.enable');
    await sendSession('Runtime.enable');
    await sendSession('DOM.enable');

    console.log('Navigating to http://localhost:3000 (Desktop 1440x900)...');
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await sendSession('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500)); // wait for initial load and 3D entrance

    // 1. Capture Desktop Hero Screenshot
    console.log('Capturing Desktop Hero screenshot...');
    const heroShot = await sendSession('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(screenshotsDir, 'desktop-hero-1440.jpg'), Buffer.from(heroShot.data, 'base64'));

    // Evaluate hero 3D emblem and text metrics
    const heroEval = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const title = document.getElementById('hero-title');
        const visual = document.querySelector('[data-hero-visual]');
        const canvas = visual ? visual.querySelector('canvas') : null;
        const rect = visual ? visual.getBoundingClientRect() : null;
        return {
          titleText: title ? title.textContent.trim() : null,
          hasVisual: !!visual,
          hasCanvas: !!canvas,
          visualRect: rect ? { width: rect.width, height: rect.height, top: rect.top, left: rect.left } : null,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log('Hero metrics:', heroEval?.result?.value);

    // 2. Scroll to Retail & E-commerce section
    console.log('Scrolling to Retail & E-commerce section...');
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('retail-ecommerce');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    console.log('Capturing Retail & E-commerce screenshot...');
    const retailShot = await sendSession('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(screenshotsDir, 'desktop-retail-ecommerce-1440.jpg'), Buffer.from(retailShot.data, 'base64'));

    const retailEval = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('retail-ecommerce');
        const heading = document.getElementById('retail-ecommerce-title');
        const partnerItems = document.querySelectorAll('.partner-logo-item');
        return {
          exists: !!el,
          headingText: heading ? heading.textContent.trim() : null,
          partnerCount: partnerItems.length,
          visiblePartners: Array.from(partnerItems).map(p => p.querySelector('span')?.textContent.trim())
        };
      })()`,
      returnByValue: true
    });
    console.log('Retail & E-commerce metrics:', retailEval?.result?.value);

    // 3. Scroll to Our Business section
    console.log('Scrolling to Our Business section...');
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('our-business');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));
    const businessShot = await sendSession('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(screenshotsDir, 'desktop-business-1440.jpg'), Buffer.from(businessShot.data, 'base64'));

    // 4. Test Mobile Viewport (390x844 - iPhone 14 style)
    console.log('Testing Mobile Viewport (390x844)...');
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendSession('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 0, behavior: 'instant' })`
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('Capturing Mobile Hero screenshot...');
    const mobileHeroShot = await sendSession('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(screenshotsDir, 'mobile-hero-390.jpg'), Buffer.from(mobileHeroShot.data, 'base64'));

    // Scroll to mobile retail section
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('retail-ecommerce');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Capturing Mobile Retail screenshot...');
    const mobileRetailShot = await sendSession('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(screenshotsDir, 'mobile-retail-390.jpg'), Buffer.from(mobileRetailShot.data, 'base64'));

    // Mobile layout evaluation (no overflow)
    const mobileEval = await sendSession('Runtime.evaluate', {
      expression: `(() => {
        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          noHorizontalOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log('Mobile layout metrics:', mobileEval?.result?.value);

    const heroVal = heroEval?.result?.value || {};
    const retailVal = retailEval?.result?.value || {};
    const mobileVal = mobileEval?.result?.value || {};

    // Save full verification results json
    const verificationReport = {
      timestamp: new Date().toISOString(),
      desktopMetrics: heroVal,
      retailMetrics: retailVal,
      mobileMetrics: mobileVal,
      allChecksPass: (
        heroVal.hasVisual &&
        heroVal.hasCanvas &&
        retailVal.partnerCount === 12 &&
        mobileVal.noHorizontalOverflow
      )
    };

    fs.writeFileSync(
      path.join(screenshotsDir, 'live_verification_report.json'),
      JSON.stringify(verificationReport, null, 2),
      'utf8'
    );
    console.log('Verification completed successfully! Report saved to live_verification_report.json');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

runQa().catch(err => {
  console.error('QA Error:', err);
  process.exit(1);
});
