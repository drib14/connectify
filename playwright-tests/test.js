const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:5174');

  // Wait for the splash screen to disappear
  await page.waitForTimeout(3000);

  // Take screenshot of Login page
  await page.screenshot({ path: '../auth-login.png' });

  // Navigate to Register
  await page.evaluate(() => {
    const textNodes = document.evaluate('//div[text()="Register"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    if(textNodes.snapshotLength > 0) {
        textNodes.snapshotItem(0).click();
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../auth-register.png' });

  // Navigate back to Login
  await page.evaluate(() => {
    const textNodes = document.evaluate('//div[text()="Login"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    if(textNodes.snapshotLength > 0) {
        textNodes.snapshotItem(0).click();
    }
  });

  await page.waitForTimeout(1000);

  // Navigate to Forgot Password
  await page.evaluate(() => {
    const textNodes = document.evaluate('//div[text()="Forgot Password?"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    if(textNodes.snapshotLength > 0) {
        textNodes.snapshotItem(0).click();
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../auth-forgot-password.png' });

  await browser.close();
  console.log('Screenshots saved!');
})();
