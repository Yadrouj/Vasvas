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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(artifacts, "01-onboarding.png"), fullPage: true });

  await page.getByRole("button", { name: "شروع کنیم" }).click();
  await page.getByLabel("دوست دارید چه صدایتان کنیم؟").fill("مریم");
  await page.locator(".consent-row input").check();
  await page.getByRole("button", { name: "ورود به رها" }).click();
  await page.getByText("لازم نیست این فکر را همین حالا حل کنم.").waitFor();
  await page.screenshot({ path: path.join(artifacts, "02-home.png"), fullPage: true });

  await page.getByRole("button", { name: /از رها بپرس/ }).click();
  await page.getByRole("button", { name: "نجس یا پاکی" }).click();
  await page.getByRole("button", { name: "بله، یا مطمئن نیستم" }).click();
  await page.getByText(/بر اساس آخرین منبع رسمیِ ثبت‌شده/).waitFor();
  await page.screenshot({ path: path.join(artifacts, "03-guided-chat.png"), fullPage: true });

  await page.locator(".chat-header > button").click();
  await page.getByRole("button", { name: /یادگیری/ }).click();
  await page.getByRole("button", { name: "دارو" }).click();
  await page.getByText("پروپرانولول", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(artifacts, "04-medicine.png"), fullPage: true });

  console.log("Smoke test passed: onboarding, home, guided chat, and medicine panel.");
} finally {
  if (browser) await browser.close();
  server.kill();
}
