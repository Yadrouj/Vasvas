import { useEffect, useState } from "react";
import { BrandMark } from "./Brand.jsx";
import { notificationSamples, showRahaNotification } from "./notificationUtils.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export function NotificationCenter({ appState, update, notify, onClose }) {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported",
  );
  const [pushState, setPushState] = useState("checking");
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
  const prefs = appState.notificationPrefs;

  useEffect(() => {
    let mounted = true;
    const checkPush = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (mounted) setPushState("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (mounted) setPushState(subscription ? "connected" : "ready");
    };
    checkPush().catch(() => mounted && setPushState("error"));
    return () => {
      mounted = false;
    };
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      notify("این مرورگر اعلان وب را پشتیبانی نمی‌کند.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    update({
      reminderEnabled: result === "granted",
      notificationPermission: result,
      lastReminderAt: result === "granted" ? new Date().toISOString() : appState.lastReminderAt,
    });
    if (result === "granted") {
      notify("مجوز اعلان فعال شد؛ نوع پیام و ساعات سکوت دست خودت است.");
      await showRahaNotification({
        title: "رها به اعلان‌های اندروید وصل شد",
        body: "این یک پیام آزمایشی است. هر زمان بخواهی می‌توانی اعلان‌ها را خاموش کنی.",
      });
    } else if (result === "denied") {
      notify("مجوز رد شد؛ فقط خودت می‌توانی آن را از تنظیمات مرورگر دوباره فعال کنی.");
    }
  };

  const toggleNotifications = (enabled) => {
    if (enabled && permission !== "granted") {
      requestPermission();
      return;
    }
    update({ reminderEnabled: enabled });
    notify(enabled ? "یادآوری‌های داخل دستگاه روشن شد." : "همهٔ یادآوری‌ها خاموش شد.");
  };

  const testNotification = async () => {
    const sent = await showRahaNotification(notificationSamples[appState.wins % notificationSamples.length]);
    notify(sent ? "اعلان آزمایشی ارسال شد." : "ابتدا مجوز اعلان را با دکمهٔ اصلی فعال کن.");
  };

  const connectBackgroundPush = async () => {
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscribeUrl = import.meta.env.VITE_PUSH_SUBSCRIBE_URL;
    if (!publicKey || !subscribeUrl) {
      notify("بخش اندروید آماده است؛ برای Push در حالت بسته، کلید VAPID و آدرس سرور لازم است.");
      return;
    }
    if (permission !== "granted") {
      await requestPermission();
      if (Notification.permission !== "granted") return;
    }
    try {
      setPushState("connecting");
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      const response = await fetch(subscribeUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("Subscription server rejected the request");
      setPushState("connected");
      notify("Push پس‌زمینه به این دستگاه متصل شد.");
    } catch {
      setPushState("error");
      notify("اتصال Push کامل نشد؛ تنظیمات سرور و VAPID باید بررسی شود.");
    }
  };

  const updatePref = (key, value) =>
    update({ notificationPrefs: { ...prefs, [key]: value } });

  const statusText = {
    default: "هنوز اجازه نخواسته‌ایم",
    granted: "مجوز اندروید/مرورگر فعال است",
    denied: "مجوز در مرورگر مسدود است",
    unsupported: "این مرورگر پشتیبانی نمی‌کند",
  }[permission];

  return (
    <div className="modal-backdrop notification-backdrop" role="dialog" aria-modal="true" aria-label="مرکز اعلان">
      <section className="sheet notification-sheet">
        <div className="sheet-handle" />
        <header className="notification-head">
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <BrandMark />
          <div>
            <small>کنترل کامل با خودت</small>
            <h2>مرکز اعلان رها</h2>
          </div>
          <span className={`permission-pill permission-${permission}`}>{statusText}</span>
        </header>

        <div className="notification-body">
          <section className="android-connect-card">
            <div className="android-device" aria-hidden="true">
              <span />
              <BrandMark />
              <i />
            </div>
            <div>
              <span className="eyebrow">{isAndroid ? "دستگاه اندرویدی شناسایی شد" : "اعلان امن روی دستگاه"}</span>
              <h3>{permission === "granted" ? "اعلان‌های سیستمی آماده‌اند" : "اجازهٔ اعلان را خودت فعال کن"}</h3>
              <p>
                درخواست فقط با لمس این دکمه نمایش داده می‌شود. رها اعلان تبلیغاتی اجباری نمی‌فرستد و همسر هم
                نمی‌تواند این تنظیم را از راه دور تغییر دهد.
              </p>
              <button className="notification-primary" onClick={requestPermission} disabled={permission === "granted"}>
                {permission === "granted" ? "مجوز فعال است ✓" : "اتصال به اعلان اندروید"}
              </button>
            </div>
          </section>

          <div className="notification-status-grid">
            <article>
              <span>◉</span>
              <small>نصب PWA</small>
              <strong>{isInstalled ? "نصب‌شده" : "قابل نصب"}</strong>
            </article>
            <article>
              <span>↯</span>
              <small>Push پس‌زمینه</small>
              <strong>{pushState === "connected" ? "متصل" : pushState === "unsupported" ? "پشتیبانی نمی‌شود" : "آمادهٔ سرور"}</strong>
            </article>
            <article>
              <span>☾</span>
              <small>ساعت سکوت</small>
              <strong>
                {prefs.quietStart} تا {prefs.quietEnd}
              </strong>
            </article>
          </div>

          <section className="notification-controls">
            <div className="notification-section-title">
              <div>
                <span className="eyebrow">پیام‌ها</span>
                <h3>فقط چیزی که انتخاب می‌کنی</h3>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={appState.reminderEnabled}
                  onChange={(event) => toggleNotifications(event.target.checked)}
                />
                <span />
              </label>
            </div>

            {[
              ["gentle", "مکث مهربان", "یک جملهٔ کوتاه، بدون اطمینان‌دهی", "✦"],
              ["practice", "تمرین روزانه", "یادآوری یک پاسخ متفاوت", "⌁"],
              ["community", "پاسخ جامعه", "فقط پس از اتصال backend", "◎"],
              ["partner", "پیام همراه", "فقط با مجوز جداگانهٔ صاحب حساب", "∞"],
            ].map(([key, title, description, icon]) => (
              <label className="notification-row" key={key}>
                <span className="notification-row-icon">{icon}</span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(event) => updatePref(key, event.target.checked)}
                  />
                  <span />
                </span>
              </label>
            ))}

            <label className="notification-select-row">
              <span>
                <strong>فاصلهٔ یادآوری</strong>
                <small>تکرار زیاد ممکن است خودش به آیین تبدیل شود.</small>
              </span>
              <select
                value={appState.reminderEvery}
                onChange={(event) => update({ reminderEvery: Number(event.target.value) })}
              >
                <option value={2}>۲ ساعت</option>
                <option value={3}>۳ ساعت</option>
                <option value={4}>۴ ساعت</option>
                <option value={6}>۶ ساعت</option>
                <option value={12}>۱۲ ساعت</option>
              </select>
            </label>

            <div className="quiet-hours">
              <span>
                <strong>ساعات سکوت</strong>
                <small>در این بازه هیچ یادآوری محلی نمی‌آید.</small>
              </span>
              <label>
                از
                <select value={prefs.quietStart} onChange={(event) => updatePref("quietStart", Number(event.target.value))}>
                  {[20, 21, 22, 23, 0].map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:۰۰
                    </option>
                  ))}
                </select>
              </label>
              <label>
                تا
                <select value={prefs.quietEnd} onChange={(event) => updatePref("quietEnd", Number(event.target.value))}>
                  {[6, 7, 8, 9, 10].map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:۰۰
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {permission === "denied" && (
            <aside className="permission-help">
              <strong>برای فعال‌کردن دوباره در Android</strong>
              <p>Chrome ← تنظیمات سایت ← اعلان‌ها ← Allow. رها نمی‌تواند این انتخاب سیستم را دور بزند.</p>
            </aside>
          )}

          <div className="notification-actions">
            <button onClick={testNotification}>فرستادن تست</button>
            <button onClick={connectBackgroundPush} disabled={pushState === "connected"}>
              {pushState === "connected" ? "Push متصل است ✓" : "اتصال Push پس‌زمینه"}
            </button>
          </div>

          <p className="notification-boundary">
            یادآوری زمان‌بندی‌شده در این نسخه تا وقتی اپ یا مرورگر فعال باشد اجرا می‌شود. دریافت پیام در حالت
            کاملاً بسته فقط پس از اتصال امن VAPID/backend ممکن است.
          </p>
        </div>
      </section>
    </div>
  );
}
