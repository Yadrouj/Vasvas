# معماری پیشنهادی «رها»

## وضعیت فعلی

نسخه ۰.۳ یک PWA ایستا با پیش‌نمایش جامعه، هویت بصری و اتصال اعلان دستگاه است:

- React + Vite
- ذخیره محلی در `localStorage`
- Service Worker برای app shell و نصب روی Home Screen
- بدون حساب، سرور، تحلیل‌گر یا انتقال داده
- بدون ادعای مسدودسازی اپ یا خواندن ساعت
- دایره‌المعارف موضوعی جست‌وجوشونده
- فید، پیش‌نویس، پاسخ، واکنش و گزارش به‌صورت محلی
- GitHub Discussions به‌عنوان تالار عمومی زندهٔ موقت
- تم سیستم/روشن/تاریک، IRANSansX و تنظیمات کاهش حرکت
- Notification permission واقعی و `showNotification` از Service Worker
- handlerهای `push` و `notificationclick`
- رابط اشتراک‌گذاری بومی و کد دعوت محلی

این انتخاب برای تست محتوا و تجربه کاربری کم‌خطر است. «شبکهٔ اجتماعی واقعی» هنوز به حساب، backend، مدیریت انسانی و مسیر بحران نیاز دارد؛ رابط این مرز را به‌روشنی نشان می‌دهد.

## اعلان و Push

جریان فعلی:

```text
لمس کاربر
  → Notification.requestPermission()
  → انتخاب نوع پیام/فاصله/ساعات سکوت
  → ServiceWorkerRegistration.showNotification()
```

جریان production برای حالت بسته:

```text
کاربر دارای رضایت
  → PushManager.subscribe(VAPID public key)
  → POST subscription به backend احراز‌شده
  → scheduler امن
  → push service
  → service worker push event
  → اعلان قابل مشاهده
```

کلید خصوصی VAPID فقط روی سرور می‌ماند. subscription یک capability حساس است و باید رمزنگاری، قابل‌لغو و وابسته به scope رضایت باشد. جزئیات در [PUSH_ANDROID.md](./PUSH_ANDROID.md) است.

یادآوری محلی مرورگر تضمین اجرای دقیق در حالت بسته نمی‌دهد. اپ نیز اجازه ندارد بدون gesture کاربر مجوز بخواهد یا تنظیم سیستم را دور بزند.

## حلقهٔ دعوت

نسخهٔ فعلی `navigator.share()` را در پاسخ به لمس کاربر اجرا می‌کند و fallback مستقیم دارد. کد دعوت از نام محلی hash می‌شود و اطلاعات تماس را نمی‌خواند. سنجش واقعی referral در آینده باید:

- opt-in و بدون fingerprinting باشد؛
- شمارش ربات/تکرار را از کاربر واقعی جدا کند؛
- امکان حذف attribution داشته باشد؛
- هیچ محتوای سلامت یا موضوع وسواس را وارد URL نکند.

## فاز ۱.۵ — جامعهٔ عمومی مدیریت‌شده

مدل پیشنهادی backend:

- هویت مستعار و تأیید ایمیل/شماره بدون نمایش عمومی؛
- `Topic`، `Reply`، `Reaction`، `Follow`، `Report` و `ModerationAction`؛
- نرخ‌محدودسازی و ضداسپم؛
- فیلتر اولیه برای درخواست دوز، فتوای موردی، اطمینان‌خواهی و محتوای بحران؛
- صف بازبینی انسانی با متخصصان آموزش‌دیده در OCD؛
- برچسب محتوای دارای بازبینی بالینی یا فقهی؛
- قفل موضوع و slow mode برای حلقه‌های اطمینان‌خواهی؛
- سیاست کودک/نوجوان و جلوگیری از پیام خصوصی بزرگسال به کودک؛
- فرجام‌خواهی، audit log و محافظت از سلامت مدیران.

فیلتر خودکار فقط سرعت‌دهنده است و نباید خطر یا معنای بالینی را «تشخیص» دهد.

## فاز ۱ — پایلوت بالینی محلی

- بازبینی متن‌ها با درمانگر OCD فارسی‌زبان
- مصاحبه رضایتمندی جداگانه با صاحب علائم
- سنجش اینکه اعلان، کارت شرعی یا ثبت شدت به اجبار تازه تبدیل نمی‌شود
- افزودن سازندهٔ برنامه درمانی فقط برای درمانگر
- نسخه‌بندی و امضای محتوای شرعی

## فاز ۲ — همراه و پیام امن

Backend پیشنهادی می‌تواند Supabase یا Firebase باشد، اما باید این مدل را رعایت کند:

- حساب مستعار و حداقل اطلاعات شناسایی؛
- کد جفت‌سازی یک‌بارمصرف و منقضی‌شونده؛
- مجوز جدا برای پیام، تعداد تمرین، شدت میل، یادداشت و داده سلامت؛
- پیش‌فرض عدم اشتراک یادداشت و سلامت؛
- لغو اتصال فوری از هر دو دستگاه؛
- ثبت audit برای تغییر مجوزها؛
- رمزنگاری انتقال و ذخیره؛ برای پیام‌های حساس، رمزنگاری سرتاسری در لایه کلاینت؛
- حذف دائمی و خروجی داده.

پیام همراه نباید وضعیت را کنترل یا فتوا بدهد. قالب‌های پیشنهادی روی دستگاه اعتبارسنجی می‌شوند.

## فاز ۳ — iOS

### گوشی

- SwiftUI
- `UserNotifications` برای اعلان‌های محلی
- Screen Time API:
  - `FamilyControls` برای مجوز
  - `ManagedSettings` برای shield
  - `DeviceActivity` برای زمان‌بندی
- مکث کاملاً opt-in و قابل deauthorize

Apple برای Family Controls entitlement و review نیاز دارد. shield نباید نقش تنبیه یا کنترل همسر بالغ را بازی کند.

### Apple Watch

- watchOS companion
- دکمهٔ دستی check-in و haptic
- HealthKit فقط با مجوز ریزدانه
- پردازش کوتاه self-care در محدوده‌های مجاز watchOS
- عدم ادعای پایش دائمی یا تشخیص OCD

## فاز ۴ — Android و Wear OS

### گوشی

- Kotlin + Jetpack Compose
- WorkManager/AlarmManager و Notification API
- Health Connect برای داده‌های سلامت با مجوز
- مکث اپ‌ها:
  - ابتدا روش کم‌مجوز مثل launcher/widget و Deep Link؛
  - در صورت نیاز واقعی Accessibility، افشای برجسته، رضایت، امکان رد، Declaration در Google Play و محدودکردن استفاده به rule ثابت کاربر؛
  - عدم جلوگیری از uninstall یا تغییر تنظیمات بدون مجوز قانونی.

### Wear OS

- Compose for Wear OS
- `Health Services` و `PassiveMonitoringClient`
- `READ_HEART_RATE` و مجوز پس‌زمینه متناسب با API
- eventها ممکن است batch و نامنظم باشند؛ بنابراین هشدار لحظه‌ای تضمین نمی‌شود.

## منطق سیگنال پیشنهادی

این الگوریتم «تشخیص» نیست:

1. baseline ضربان در ساعت مشابه روز و وضعیت مشابه، روی خود دستگاه؛
2. حذف بازه ورزش/پیاده‌روی فعال؛
3. افزایش پایدار نسبت به baseline + حرکت تکراری اختیاری؛
4. cooldown حداقل ۳۰ تا ۶۰ دقیقه؛
5. پرسش خنثی روی ساعت: «یک مکث می‌خواهی؟»؛
6. بدون ارسال به همراه مگر کاربر همان لحظه یا در مجوز جدا تأیید کند.

کاربر می‌تواند false positive را علامت بزند و کل قابلیت را خاموش کند.

## داده‌ها

مدل پیشنهادی:

```text
User
  id, locale, timezone

ConsentScope
  owner_id, partner_id, scope, granted_at, revoked_at

UrgeEvent
  owner_id, category, intensity_before, response_chosen, created_at

SupportMessage
  sender_id, recipient_id, encrypted_payload, created_at

Topic
  author_id, category, title, body, safety_state, created_at

Reply
  author_id, topic_id, body, safety_state, created_at

Report
  reporter_id, target_type, target_id, reason, status, created_at

ModerationAction
  moderator_id, target_type, target_id, action, rationale, created_at

ContentVersion
  type, authority, source_url, reviewed_by, reviewed_at, hash
```

محتوای فکر، متن اعتراف، جزئیات نجاست و داده خام ضربان به‌صورت پیش‌فرض ذخیره نمی‌شوند.

## دروازه‌های انتشار

- بازبینی بالینی و فقهی
- تست دسترس‌پذیری و RTL
- threat modeling و penetration test
- سیاست حریم خصوصی فارسی ساده
- Data Safety در Google Play و Privacy Nutrition Labels در App Store
- سازوکار گزارش محتوای تبدیل‌شده به اجبار
- پایلوت کوچک با معیار harm و family conflict، نه فقط engagement
