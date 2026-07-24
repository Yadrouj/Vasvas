export const notificationSamples = [
  {
    title: "یک مکث از رها",
    body: "لازم نیست این تردید را همین حالا حل کنی؛ یک قدم به زندگی برگرد.",
  },
  {
    title: "تمرین کوتاه امروز",
    body: "موفقیت یعنی یک پاسخ متفاوت؛ نه اینکه اضطراب حتماً صفر شود.",
  },
  {
    title: "فکر می‌آید؛ انتخاب با توست",
    body: "شاید، شاید نه. این بار جواب اضافه نده و مسیرت را ادامه بده.",
  },
];

export function isQuietHour(start = 22, end = 8, date = new Date()) {
  const hour = date.getHours();
  if (start === end) return false;
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

export async function showRahaNotification(sample = notificationSamples[0]) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker?.ready;
  if (!registration) return false;
  await registration.showNotification(sample.title, {
    body: sample.body,
    icon: "./icon.svg",
    badge: "./logo-mark.svg",
    tag: "raha-gentle-reminder",
    renotify: false,
    vibrate: [70, 40, 70],
    data: { url: "./?from=notification" },
    actions: [
      { action: "open", title: "بازکردن رها" },
      { action: "later", title: "بعداً" },
    ],
  });
  return true;
}
