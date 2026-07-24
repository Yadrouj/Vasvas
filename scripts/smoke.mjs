import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = process.cwd();
const artifacts = path.join(root, "test-artifacts");
const browserPath =
  process.env.RAHA_BROWSER_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/usr/bin/google-chrome");

const server = spawn(
  process.execPath,
  [
    path.join(root, "node_modules", "vite", "bin", "vite.js"),
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4173",
  ],
  { cwd: root, stdio: "ignore" },
);

const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4173/");
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Preview server did not start.");
};

let browser;
try {
  await mkdir(artifacts, { recursive: true });
  await waitForServer();
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await context.grantPermissions(["notifications"], { origin: "http://127.0.0.1:4173" });
  const page = await context.newPage();

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(artifacts, "01-onboarding.png"), fullPage: true });

  await page.getByRole("button", { name: "شروع کنیم" }).click();
  await page.getByLabel("دوست دارید چه صدایتان کنیم؟").fill("مریم");
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "ورود به رها" }).click();
  await page.getByText("لازم نیست این فکر را همین حالا حل کنم.").waitFor();
  const fontLoaded = await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
    return globalThis.document.fonts.check('16px "IRANSansX"');
  });
  if (!fontLoaded) throw new Error("IRANSansX did not load");
  await page.screenshot({ path: path.join(artifacts, "02-home.png"), fullPage: true });

  await page.getByRole("button", { name: "مرکز اعلان" }).click();
  await page.getByText("مرکز اعلان رها", { exact: true }).waitFor();
  await page.locator(".notification-section-title .switch").click();
  await page.getByRole("button", { name: "فرستادن تست" }).click();
  await page.screenshot({ path: path.join(artifacts, "03-notifications.png"), fullPage: true });
  await page.locator(".notification-head > button").click();

  await page.locator(".welcome-row > button").click();
  await page.getByText("دعوت مسئولانه", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(artifacts, "04-share.png"), fullPage: true });
  await page.locator(".share-head > button").click();

  await page.getByRole("button", { name: /از رها بپرس/ }).click();
  await page.getByRole("button", { name: "نجس یا پاکی" }).click();
  await page.getByRole("button", { name: "بله، یا مطمئن نیستم" }).click();
  await page.getByText(/بر اساس آخرین منبع رسمیِ ثبت‌شده/).waitFor();
  await page.screenshot({ path: path.join(artifacts, "05-guided-chat.png"), fullPage: true });

  await page.locator(".chat-header > button").click();
  await page.getByRole("button", { name: /کشف/ }).click();
  await page.getByText("دایره‌المعارف رها").waitFor();
  await page.getByRole("button", { name: /وسواس رابطه و ازدواج/ }).click();
  await page.getByText("اولین پاسخ کم‌خطر").waitFor();
  await page.screenshot({ path: path.join(artifacts, "06-topic-detail.png"), fullPage: true });
  await page.getByRole("button", { name: "بستن" }).click();
  await page.getByRole("button", { name: "دارو" }).click();
  await page.getByText("پروپرانولول", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(artifacts, "07-medicine.png"), fullPage: true });

  await page.getByRole("button", { name: /جامعه/ }).click();
  await page.getByText("تالار عمومی زنده", { exact: true }).waitFor();
  await page.getByRole("button", { name: /پیش‌نویس موضوع/ }).click();
  await page.getByPlaceholder("مثلاً امروز یک وارسی را انجام ندادم").fill("امروز سؤال تکراری را نپرسیدم");
  await page
    .getByPlaceholder(/از تجربهٔ خودت/)
    .fill("اضطراب بود، اما به‌جای گرفتن تضمین به کار مهم بعدی برگشتم.");
  await page.locator(".composer-check input").last().check();
  await page.getByRole("button", { name: "ذخیرهٔ پیش‌نویس امن" }).click();
  await page.getByText("فقط روی این دستگاه").waitFor();
  await page.screenshot({ path: path.join(artifacts, "08-community.png"), fullPage: true });

  await page.getByRole("button", { name: /تنظیمات/ }).click();
  await page.getByRole("button", { name: /تاریک/ }).click();
  await page.locator("html[data-theme=dark]").waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifacts, "09-dark-settings.png"), fullPage: true });

  console.log("Smoke test passed: brand, themes, notifications, sharing, OCD guidance, and community.");
} finally {
  if (browser) await browser.close();
  server.kill();
}
