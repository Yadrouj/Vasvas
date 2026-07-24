# اعلان اندروید و Web Push در «رها»

آخرین بازبینی: ۲ مرداد ۱۴۰۵ / 24 July 2026

## چه چیزی همین حالا کار می‌کند؟

- PWA روی Android/Chrome نصب می‌شود.
- «مرکز اعلان» فقط پس از لمس مستقیم کاربر `Notification.requestPermission()` را اجرا می‌کند.
- پس از مجوز، اعلان آزمایشی با `ServiceWorkerRegistration.showNotification()` نمایش داده می‌شود.
- کاربر نوع پیام، فاصله و ساعات سکوت را کنترل می‌کند.
- Service Worker رویدادهای `push` و `notificationclick` را دریافت می‌کند.
- یادآوری محلی تا زمانی که اپ یا مرورگر فعال باشد، با فاصلهٔ انتخابی بررسی می‌شود.

## چه چیزی به سرور نیاز دارد؟

مرورگر نمی‌تواند وقتی اپ کاملاً بسته است با یک تایمر جاوااسکریپت ساده پیام بفرستد. برای Push واقعی:

1. یک جفت کلید VAPID فقط یک‌بار روی سرور تولید شود؛
2. کلید عمومی در `VITE_VAPID_PUBLIC_KEY` قرار بگیرد؛
3. کلید خصوصی فقط در secret manager سرور بماند؛
4. endpoint امن اشتراک در `VITE_PUSH_SUBSCRIBE_URL` تنظیم شود؛
5. `PushSubscription` با حساب مستعار و رضایت کاربر ذخیره شود؛
6. worker زمان‌بندی سرور پیام را به endpoint هر دستگاه بفرستد؛
7. subscriptionهای منقضی یا پاسخ‌های 404/410 پاک شوند.

فایل `.env.example` فقط نام متغیرها را دارد و هیچ کلید یا سرویس جعلی در پروژه قرار داده نشده است.

## قرارداد endpoint اشتراک

```http
POST /api/push/subscribe
Content-Type: application/json
Cookie: authenticated_session

{
  "endpoint": "https://push-service.example/...",
  "expirationTime": null,
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

پاسخ موفق: `201 Created` یا `204 No Content`.

الزامات:

- احراز هویت یا token یک‌بارمصرف؛
- محافظت CSRF، rate limit و محدودیت CORS؛
- رمزنگاری subscription در دیتابیس؛
- عدم اشتراک endpoint با همراه یا مدیر؛
- endpoint لغو اشتراک و حذف کامل؛
- ثبت نسخهٔ رضایت، نه محتوای فکر یا شرح وسواس.

## payload پیشنهادی

```json
{
  "title": "یک مکث از رها",
  "body": "لازم نیست این تردید را همین حالا حل کنی؛ به کار مهمت برگرد.",
  "tag": "gentle-reminder",
  "url": "./?from=push",
  "renotify": false
}
```

پیام نباید نتیجهٔ وسواس را تأیید کند، محتوای خصوصی را روی صفحهٔ قفل نشان دهد یا بدون انتخاب کاربر ارسال شود.

## Android بومی

اگر هدف، کنترل اپ‌های دیگر یا زمان‌بندی بسیار دقیق است، PWA کافی نیست. نسخهٔ بومی Android به Kotlin/Compose، کانال‌های Notification، WorkManager و در صورت Push به Firebase Cloud Messaging نیاز دارد. Accessibility برای کنترل اپ‌های دیگر فقط با نیاز واقعی، افشای برجسته، رضایت و رعایت سیاست Google Play قابل بررسی است؛ نباید برای کنترل پنهانی همسر استفاده شود.

منابع رسمی:

- [MDN Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web.dev: Push subscription و VAPID](https://web.dev/articles/push-notifications-subscribing-a-user)
