import { useEffect, useMemo, useState } from "react";
import { BrandLockup, BrandMark } from "./Brand.jsx";
import { Community } from "./Community.jsx";
import { NotificationCenter } from "./NotificationCenter.jsx";
import { ShareRaha } from "./ShareRaha.jsx";
import { TopicExplorer } from "./TopicExplorer.jsx";
import { brand } from "./brandData.js";
import { communitySeedPosts } from "./content.js";
import { isQuietHour, showRahaNotification } from "./notificationUtils.js";

const STORAGE_KEY = "raha-state-v1";

const defaultState = {
  onboarded: false,
  name: "",
  role: "self",
  wins: 0,
  streak: 0,
  dailyPracticeDone: false,
  completedLessons: [],
  urgeLogs: [],
  reminderEnabled: false,
  reminderEvery: 3,
  pauseBeforeApps: false,
  watchEnabled: false,
  marja: "آیت‌الله سیستانی",
  theme: "system",
  motionEnabled: true,
  funEnabled: true,
  notificationPermission: "default",
  notificationPrefs: {
    gentle: true,
    practice: true,
    community: false,
    partner: false,
    quietStart: 22,
    quietEnd: 8,
  },
  lastReminderAt: null,
  shareCount: 0,
  lastSharedAt: null,
  referredBy: null,
  communityPosts: communitySeedPosts,
  supportedPostIds: [],
  reportedPostIds: [],
  sharing: {
    messages: true,
    wins: true,
    urgeLevel: false,
    notes: false,
    health: false,
  },
};

const sources = [
  {
    type: "راهنمای درمان",
    title: "راهنمای درمان OCD",
    publisher: "IOCDF",
    url: "https://iocdf.org/about-ocd/ocd-treatment-guide/",
  },
  {
    type: "وسواس مذهبی",
    title: "OCD و وسواس دینی چیست؟",
    publisher: "IOCDF",
    url: "https://iocdf.org/faith-ocd/what-is-ocd-scrupulosity/",
  },
  {
    type: "برای خانواده",
    title: "خانواده چگونه کمک کند؟",
    publisher: "IOCDF",
    url: "https://iocdf.org/families/",
  },
  {
    type: "راهنمای بالینی",
    title: "توصیه‌های درمانی OCD",
    publisher: "NICE",
    url: "https://www.nice.org.uk/guidance/cg31/chapter/Recommendations",
  },
];

const media = [
  {
    kind: "ویدئو",
    duration: "انگلیسی · زیرنویس",
    title: "غلبه بر وسواس مذهبی",
    subtitle: "Scrupulosity: Overcoming Religious Obsessions",
    url: "https://www.youtube.com/watch?v=4gE6D2Ra2Yc",
    accent: "mint",
  },
  {
    kind: "ویدئو",
    duration: "انگلیسی · زیرنویس",
    title: "پنج کلید برای وسواس مذهبی",
    subtitle: "Five Keys to Beating Scrupulosity",
    url: "https://www.youtube.com/watch?v=po7Ohfby8Po",
    accent: "sand",
  },
  {
    kind: "مجموعه ویدئو",
    duration: "IOCDF",
    title: "Faith & OCD",
    subtitle: "گفت‌وگو با درمانگران و رهبران دینی",
    url: "https://www.youtube.com/playlist?list=PLx2UyPr4U3GIeK64mV7fxTEWBCTFDvFpC",
    accent: "lilac",
  },
  {
    kind: "پادکست",
    duration: "Spotify",
    title: "The OCD Confessional",
    subtitle: "تجربه‌های واقعی، درمان و امید",
    url: "https://open.spotify.com/show/1Y6wCnlesVWL3unbwP6YWh",
    accent: "rose",
  },
];

const lessons = [
  {
    id: "cycle",
    eyebrow: "۳ دقیقه",
    title: "چرخهٔ وسواس را بشناس",
    summary: "فکر ناخواسته → اضطراب → اجبار → آرامش کوتاه → قوی‌تر شدن چرخه",
    body:
      "مشکل، آمدنِ فکر نیست؛ تلاش تکراری برای رسیدن به اطمینان کامل است. شستن، وارسی، مرور مکالمه، سؤال‌کردن و حتی دلیل‌آوردن در ذهن می‌توانند اجبار باشند. هدف، حذف فکر نیست؛ انتخابِ نکردنِ اجبار است.",
  },
  {
    id: "rumination",
    eyebrow: "۴ دقیقه",
    title: "نشخوار، حل مسئله نیست",
    summary: "مرور بی‌پایان معمولاً پاسخ تازه‌ای تولید نمی‌کند.",
    body:
      "وقتی متوجه مرور شدید، فقط نامش را بگذارید: «دارم دنبال قطعیت می‌گردم.» سپس با جملهٔ «شاید، شاید نه» جا برای ابهام باز کنید و به کار ارزشمند بعدی برگردید. تلاش برای بیرون‌کردن فکر هم می‌تواند شکل دیگری از درگیری باشد.",
  },
  {
    id: "family",
    eyebrow: "۵ دقیقه",
    title: "حمایت بدون اطمینان‌دادن",
    summary: "همدلی با رنج، بدون پاسخ‌گویی تکراری به سؤال وسواس",
    body:
      "همراه می‌تواند بگوید «می‌بینم سخت است و کنارت هستم»؛ اما جواب قطعی دربارهٔ پاکی، درست‌گفتن یا بی‌خطر بودن ندهد. کاهش همراهی با اجبار بهتر است تدریجی و با توافق قبلی باشد، نه ناگهانی و تنبیهی.",
  },
  {
    id: "faith",
    eyebrow: "۴ دقیقه",
    title: "ایمان و درمان مقابل هم نیستند",
    summary: "وسواس مذهبی می‌تواند ارزش‌های دینی را گروگان بگیرد.",
    body:
      "درمانگر آشنا با وسواس و یک مرجع دینی ثابت باید هماهنگ باشند. پرسیدن یک سؤال از چند نفر یا جست‌وجوی مکرر فتوا معمولاً چرخهٔ اطمینان‌خواهی را تقویت می‌کند. اپ فقط منبع انتخاب‌شده را نمایش می‌دهد و فتوا تولید نمی‌کند.",
  },
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const referredBy = new URLSearchParams(window.location.search).get("ref");
    return saved
      ? {
          ...defaultState,
          ...saved,
          referredBy: saved.referredBy || referredBy,
          sharing: { ...defaultState.sharing, ...saved.sharing },
          notificationPrefs: { ...defaultState.notificationPrefs, ...saved.notificationPrefs },
        }
      : { ...defaultState, referredBy };
  } catch {
    return defaultState;
  }
}

function App() {
  const [appState, setAppState] = useState(loadState);
  const [screen, setScreen] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("screen");
    return ["home", "practice", "learn", "community", "profile"].includes(requested) ? requested : "home";
  });
  const [quickOpen, setQuickOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [breathOpen, setBreathOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [toast, setToast] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyAppearance = () => {
      const theme = appState.theme === "system" ? (media.matches ? "dark" : "light") : appState.theme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.motion = appState.motionEnabled ? "on" : "off";
      document.documentElement.dataset.fun = appState.funEnabled ? "on" : "off";
      document.documentElement.style.colorScheme = theme;
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      themeMeta?.setAttribute("content", theme === "dark" ? "#071311" : "#f4f1e9");
    };
    applyAppearance();
    media.addEventListener("change", applyAppearance);
    return () => media.removeEventListener("change", applyAppearance);
  }, [appState.funEnabled, appState.motionEnabled, appState.theme]);

  useEffect(() => {
    if (!appState.reminderEnabled || !appState.notificationPrefs.gentle) return undefined;
    if (!("Notification" in window) || Notification.permission !== "granted") return undefined;

    const checkReminder = async () => {
      const now = new Date();
      if (
        isQuietHour(
          appState.notificationPrefs.quietStart,
          appState.notificationPrefs.quietEnd,
          now,
        )
      ) {
        return;
      }
      const last = appState.lastReminderAt ? new Date(appState.lastReminderAt).getTime() : now.getTime();
      const due = now.getTime() - last >= appState.reminderEvery * 60 * 60 * 1000;
      if (!due) return;
      const sent = await showRahaNotification();
      if (sent) {
        setAppState((current) => ({ ...current, lastReminderAt: now.toISOString() }));
      }
    };

    const timer = window.setInterval(checkReminder, 60 * 1000);
    checkReminder();
    return () => window.clearInterval(timer);
  }, [
    appState.lastReminderAt,
    appState.notificationPrefs.gentle,
    appState.notificationPrefs.quietEnd,
    appState.notificationPrefs.quietStart,
    appState.reminderEnabled,
    appState.reminderEvery,
  ]);

  useEffect(() => {
    if (!celebrating) return undefined;
    const timer = window.setTimeout(() => setCelebrating(false), 1800);
    return () => window.clearTimeout(timer);
  }, [celebrating]);

  useEffect(() => {
    const onInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const update = (patch) => setAppState((current) => ({ ...current, ...patch }));
  const finishResponse = (entry) => {
    setAppState((current) => ({
      ...current,
      wins: current.wins + 1,
      streak: Math.max(1, current.streak),
      urgeLogs: [{ ...entry, createdAt: new Date().toISOString() }, ...current.urgeLogs].slice(0, 20),
    }));
    setQuickOpen(false);
    setToast("یک پاسخ متفاوت ثبت شد؛ همین تمرین مهم است.");
  };

  const requestInstall = async () => {
    if (!installPrompt) {
      setToast("از منوی مرورگر، «افزودن به صفحهٔ اصلی» را انتخاب کنید.");
      return;
    }
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  if (!appState.onboarded) {
    return <Onboarding onDone={(profile) => setAppState({ ...appState, ...profile, onboarded: true })} />;
  }

  return (
    <div className="app-shell redesigned-shell">
      <div className="ambient-scene" aria-hidden="true">
        <span className="ambient-orb ambient-one" />
        <span className="ambient-orb ambient-two" />
        <span className="ambient-grid" />
      </div>
      <main className="phone-frame">
        <div className="safe-top" />
        {screen === "home" && (
          <Home
            appState={appState}
            onQuick={() => setQuickOpen(true)}
            onAsk={() => setAskOpen(true)}
            onBreath={() => setBreathOpen(true)}
            onNotifications={() => setNotificationOpen(true)}
            onShare={() => setShareOpen(true)}
            onNavigate={setScreen}
            onPracticeDone={() => {
              update({ dailyPracticeDone: true, wins: appState.wins + 1 });
              setCelebrating(true);
              navigator.vibrate?.([35, 40, 55]);
              setToast("تمرین امروز ثبت شد.");
            }}
          />
        )}
        {screen === "practice" && (
          <Practice
            appState={appState}
            update={update}
            onQuick={() => setQuickOpen(true)}
            onBreath={() => setBreathOpen(true)}
            notify={setToast}
          />
        )}
        {screen === "learn" && (
          <Learn appState={appState} update={update} notify={setToast} />
        )}
        {screen === "community" && (
          <Community
            appState={appState}
            update={update}
            notify={setToast}
            onOpenCompanion={() => setScreen("companion")}
          />
        )}
        {screen === "companion" && (
          <Companion
            appState={appState}
            update={update}
            notify={setToast}
            onBack={() => setScreen("community")}
          />
        )}
        {screen === "profile" && (
          <Profile
            appState={appState}
            update={update}
            onInstall={requestInstall}
            onNotifications={() => setNotificationOpen(true)}
            onShare={() => setShareOpen(true)}
            notify={setToast}
          />
        )}
        <BottomNav active={screen === "companion" ? "community" : screen} onChange={setScreen} />
      </main>

      {quickOpen && <QuickSupport onClose={() => setQuickOpen(false)} onFinish={finishResponse} />}
      {askOpen && <AskRaha appState={appState} onClose={() => setAskOpen(false)} />}
      {breathOpen && <Breathing onClose={() => setBreathOpen(false)} />}
      {notificationOpen && (
        <NotificationCenter
          appState={appState}
          update={update}
          notify={setToast}
          onClose={() => setNotificationOpen(false)}
        />
      )}
      {shareOpen && (
        <ShareRaha
          appState={appState}
          update={update}
          notify={setToast}
          onClose={() => setShareOpen(false)}
        />
      )}
      {celebrating && appState.funEnabled && <Celebration />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("self");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="app-shell onboarding-shell">
      <main className="phone-frame onboarding">
        <div className="onboarding-art" aria-hidden="true">
          <span className="leaf leaf-one" />
          <span className="leaf leaf-two" />
          <span className="soft-orbit" />
          <div className="brand-mark">
            <BrandMark label="" />
          </div>
        </div>

        {step === 0 ? (
          <section className="onboarding-copy">
            <span className="eyebrow light">رها · یک همراه، نه یک قاضی</span>
            <h1>{brand.slogan}</h1>
            <p>
              برای جنگیدن با فکر نیامده‌ایم؛ برای پس‌گرفتن انتخاب و برگشتن به زندگی آمده‌ایم.
            </p>
            <button className="primary-button light-button" onClick={() => setStep(1)}>
              شروع کنیم
              <span>←</span>
            </button>
            <button className="text-button light-text" onClick={() => setStep(1)}>
              آشنایی با حریم خصوصی
            </button>
          </section>
        ) : (
          <section className="onboarding-form">
            <button className="back-round" onClick={() => setStep(0)} aria-label="بازگشت">
              →
            </button>
            <span className="eyebrow">فضای شخصی شما</span>
            <h2>رها را برای چه کسی می‌سازیم؟</h2>
            <label className="field-label" htmlFor="first-name">
              دوست دارید چه صدایتان کنیم؟
            </label>
            <input
              id="first-name"
              className="text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثلاً مریم"
            />
            <div className="role-grid">
              <button className={`role-card ${role === "self" ? "selected" : ""}`} onClick={() => setRole("self")}>
                <span className="role-icon">◌</span>
                <strong>برای خودم</strong>
                <small>تمرین‌ها و پیگیری روزانه</small>
              </button>
              <button
                className={`role-card ${role === "companion" ? "selected" : ""}`}
                onClick={() => setRole("companion")}
              >
                <span className="role-icon">∞</span>
                <strong>برای همراهی</strong>
                <small>حمایت بدون اطمینان‌دهی</small>
              </button>
            </div>
            <label className="consent-row">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>
                می‌دانم این ابزار جای تشخیص، روان‌درمانی یا تجویز پزشک را نمی‌گیرد و اشتراک داده فقط با
                اجازهٔ من انجام می‌شود.
              </span>
            </label>
            <button
              className="primary-button"
              disabled={!agreed}
              onClick={() => onDone({ name: name.trim() || "دوست من", role })}
            >
              ورود به رها
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function Home({
  appState,
  onQuick,
  onAsk,
  onBreath,
  onNotifications,
  onShare,
  onNavigate,
  onPracticeDone,
}) {
  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  return (
    <div className="screen home-screen">
      <header className="topbar brand-topbar">
        <BrandLockup compact />
        <div className="topbar-actions">
          <button className="notification-bell" onClick={onNotifications} aria-label="مرکز اعلان">
            ♢
            {appState.reminderEnabled && <span />}
          </button>
          <button className="avatar-button" onClick={() => onNavigate("profile")} aria-label="پروفایل">
            {appState.name.slice(0, 1)}
            <span className="online-dot" />
          </button>
        </div>
      </header>

      <div className="welcome-row">
        <div>
          <span className="date-label">{date}</span>
          <h1>سلام {appState.name}</h1>
        </div>
        <button onClick={onShare}>دعوت یک هم‌قدم ↗</button>
      </div>

      <section className="hero-card glass-hero">
        <div className="hero-brand-orbit" aria-hidden="true">
          <BrandMark label="" />
        </div>
        <span className="hero-kicker">یادآوری امروز · {brand.shortSlogan}</span>
        <h2>لازم نیست این فکر را همین حالا حل کنم.</h2>
        <p>می‌توانم حضورش را تحمل کنم و کار مهم بعدی‌ام را انجام بدهم.</p>
        <span className="hero-line" />
        <span className="hero-orb" />
        <span className="hero-leaf" />
      </section>

      <button className="stuck-button" onClick={onQuick}>
        <span className="stuck-icon">⌁</span>
        <span>
          <strong>الان گیر کردم</strong>
          <small>یک مکث کوتاه و قدم بعدی</small>
        </span>
        <span className="arrow">←</span>
      </button>

      <button className="ask-raha-button" onClick={onAsk}>
        <span className="ask-spark">✦</span>
        <span>
          <strong>از رها بپرس</strong>
          <small>یک راهنمای کوتاه؛ بدون جواب‌سازی برای وسواس</small>
        </span>
        <span className="arrow">←</span>
      </button>

      <div className="home-discovery-grid">
        <button onClick={() => onNavigate("learn")}>
          <span>✦</span>
          <strong>همهٔ موضوعات وسواس</strong>
          <small>زنان، رابطه، شرعی، نشخوار و بیشتر</small>
        </button>
        <button onClick={() => onNavigate("community")}>
          <span>◎</span>
          <strong>جامعهٔ رها</strong>
          <small>موضوع بساز و از هم‌قدم‌ها کمک بگیر</small>
        </button>
      </div>

      <button className="viral-invite-card" onClick={onShare}>
        <span className="invite-spark">✦</span>
        <span>
          <small>رها را تکثیر کن، نه وسواس را</small>
          <strong>این فضای امن را برای یک نفر بفرست</strong>
          <p>دعوت با لینک ناشناس و متن آماده؛ بدون دسترسی به مخاطبان گوشی.</p>
        </span>
        <b>↗</b>
      </button>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">تمرین امروز</span>
            <h3>یک قدم کوچک، کافی است</h3>
          </div>
          <span className="tiny-badge">{appState.dailyPracticeDone ? "انجام شد" : "۵ دقیقه"}</span>
        </div>
        <article className={`practice-card ${appState.dailyPracticeDone ? "done" : ""}`}>
          <div className="practice-visual" aria-hidden="true">
            <span className="drop-one" />
            <span className="drop-two" />
            <span className="open-hand">✋</span>
          </div>
          <div className="practice-copy">
            <span>جلوگیری از پاسخ</span>
            <h4>پس از شست‌وشوی معمول، فقط یک بار تمامش کن.</h4>
            <p>هدف، آرام‌شدن فوری نیست؛ هدف این است که دوباره وارسی نکنی.</p>
            <button className="small-action" disabled={appState.dailyPracticeDone} onClick={onPracticeDone}>
              {appState.dailyPracticeDone ? "ثبت شد ✓" : "انجامش دادم"}
            </button>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <h3>ابزارهای فوری</h3>
          <button className="link-button" onClick={() => onNavigate("practice")}>
            همه ابزارها
          </button>
        </div>
        <div className="tool-grid">
          <button className="tool-card mint" onClick={onQuick}>
            <span>↻</span>
            <strong>مرور ذهنی</strong>
            <small>از حلقه بیرون بیا</small>
          </button>
          <button className="tool-card sand" onClick={onQuick}>
            <span>◒</span>
            <strong>نجس و پاک</strong>
            <small>ابهام را نگه دار</small>
          </button>
          <button className="tool-card lilac" onClick={onBreath}>
            <span>≈</span>
            <strong>تنفس آرام</strong>
            <small>۱ دقیقه، بدون اجبار</small>
          </button>
        </div>
      </section>

      <section className="weekly-strip">
        <div>
          <span>پاسخ‌های متفاوت</span>
          <strong>{appState.wins}</strong>
        </div>
        <div className="mini-chart" aria-label={`${appState.wins} پاسخ متفاوت`}>
          {[32, 48, 38, 68, 52, 76, Math.min(90, 38 + appState.wins * 4)].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height: `${height}%` }} />
          ))}
        </div>
        <p>موفقیت یعنی انتخابِ پاسخ، نه صفرشدنِ اضطراب.</p>
      </section>
    </div>
  );
}

function Practice({ appState, update, onQuick, onBreath, notify }) {
  const tools = [
    {
      color: "mint",
      icon: "↻",
      title: "توقف نشخوار",
      text: "نام‌گذاری، «شاید/شاید نه»، برگشت به کار",
      action: onQuick,
    },
    {
      color: "sand",
      icon: "◒",
      title: "مکث نجس و پاک",
      text: "بدون بررسی و پرسش دوباره",
      action: onQuick,
    },
    {
      color: "lilac",
      icon: "≈",
      title: "تنفس ۴–۶",
      text: "برای ماندن کنار احساس، نه حذف آن",
      action: onBreath,
    },
    {
      color: "rose",
      icon: "✋",
      title: "دست‌های آزاد",
      text: "برای مالیدن یا تمیزکردن ناخن‌ها",
      action: onQuick,
    },
  ];

  return (
    <div className="screen">
      <ScreenHeader eyebrow="جعبه ابزار" title="تمرین، نه اطمینان‌خواهی" />
      <div className="notice-card">
        <span>i</span>
        <p>
          تمرین مواجههٔ شخصی باید با درمانگر آشنا با OCD تنظیم شود. اینجا فقط ابزارهای کم‌خطر و عمومی
          قرار دارند.
        </p>
      </div>
      <div className="large-tool-list">
        {tools.map((tool) => (
          <button key={tool.title} className={`large-tool ${tool.color}`} onClick={tool.action}>
            <span className="large-tool-icon">{tool.icon}</span>
            <span>
              <strong>{tool.title}</strong>
              <small>{tool.text}</small>
            </span>
            <b>←</b>
          </button>
        ))}
      </div>

      <section className="section-block">
        <div className="section-heading compact">
          <h3>قرار تمرینی امروز</h3>
          <span className="tiny-badge">قابل ویرایش با درمانگر</span>
        </div>
        <article className="contract-card">
          <span className="contract-check">✓</span>
          <div>
            <strong>بعد از پایان کار، به صحنه برنمی‌گردم.</strong>
            <p>نه با چشم، نه با سؤال از دیگری و نه با مرور ذهنی.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={appState.dailyPracticeDone}
              onChange={(event) => {
                update({ dailyPracticeDone: event.target.checked });
                notify(event.target.checked ? "قرار امروز ثبت شد." : "ثبت تمرین برداشته شد.");
              }}
            />
            <span />
          </label>
        </article>
      </section>
      <section className="ritual-warning">
        <span>یادآوری مهم</span>
        <p>
          اگر تنفس، ذکر، خواندن کارت‌ها یا ثبت‌کردن در اپ را «تا وقتی حس درست شود» تکرار می‌کنید، ابزار
          دارد به اجبار تازه تبدیل می‌شود. آن را متوقف کنید و با درمانگر در میان بگذارید.
        </p>
      </section>
    </div>
  );
}

function Learn({ appState, update, notify }) {
  const [tab, setTab] = useState("topics");
  const [openLesson, setOpenLesson] = useState(null);

  const completeLesson = (id) => {
    if (appState.completedLessons.includes(id)) return;
    update({ completedLessons: [...appState.completedLessons, id] });
    notify("درس به فهرست خوانده‌شده‌ها اضافه شد.");
  };

  return (
    <div className="screen">
      <ScreenHeader eyebrow="مرکز جامع رها" title="موضوع را بشناس؛ چرخه را هدف بگیر" />
      <div className="segmented segmented-five">
        <button className={tab === "topics" ? "active" : ""} onClick={() => setTab("topics")}>
          موضوعات
        </button>
        <button className={tab === "lessons" ? "active" : ""} onClick={() => setTab("lessons")}>
          آموزش
        </button>
        <button className={tab === "faith" ? "active" : ""} onClick={() => setTab("faith")}>
          شرعی
        </button>
        <button className={tab === "medicine" ? "active" : ""} onClick={() => setTab("medicine")}>
          دارو
        </button>
        <button className={tab === "media" ? "active" : ""} onClick={() => setTab("media")}>
          شنیدنی
        </button>
      </div>

      {tab === "topics" && <TopicExplorer />}
      {tab === "lessons" && (
        <div className="lesson-list">
          <div className="progress-card">
            <div>
              <span>مسیر یادگیری</span>
              <strong>
                {appState.completedLessons.length} از {lessons.length} درس
              </strong>
            </div>
            <div className="progress-track">
              <i style={{ width: `${(appState.completedLessons.length / lessons.length) * 100}%` }} />
            </div>
          </div>
          {lessons.map((lesson, index) => {
            const isOpen = openLesson === lesson.id;
            const done = appState.completedLessons.includes(lesson.id);
            return (
              <article key={lesson.id} className={`lesson-card ${isOpen ? "open" : ""}`}>
                <button onClick={() => setOpenLesson(isOpen ? null : lesson.id)}>
                  <span className="lesson-number">{done ? "✓" : index + 1}</span>
                  <span>
                    <small>{lesson.eyebrow}</small>
                    <strong>{lesson.title}</strong>
                    <p>{lesson.summary}</p>
                  </span>
                  <b>{isOpen ? "−" : "+"}</b>
                </button>
                {isOpen && (
                  <div className="lesson-body">
                    <p>{lesson.body}</p>
                    <button className="small-action" onClick={() => completeLesson(lesson.id)}>
                      {done ? "خوانده شد ✓" : "خواندم"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          <SourceList />
        </div>
      )}

      {tab === "faith" && <FaithPanel appState={appState} update={update} />}
      {tab === "medicine" && <MedicinePanel />}
      {tab === "media" && <MediaPanel />}
    </div>
  );
}

function FaithPanel({ appState, update }) {
  return (
    <div className="faith-panel">
      <div className="faith-hero">
        <span className="faith-moon">☾</span>
        <span className="eyebrow light">وسواس نجس و پاک</span>
        <h3>اپ فتوا نمی‌دهد؛ فقط منبع ثابت شما را نگه می‌دارد.</h3>
        <p>یک مرجع، یک پاسخ ثبت‌شده، بدون جست‌وجوی دوباره.</p>
      </div>
      <label className="select-label">
        مرجع انتخاب‌شده
        <select value={appState.marja} onChange={(event) => update({ marja: event.target.value })}>
          <option>آیت‌الله سیستانی</option>
          <option disabled>مرجع دیگر — پس از افزودن منبع رسمی</option>
        </select>
      </label>
      <article className="fatwa-card">
        <div className="verified-row">
          <span>منبع رسمی تأییدشده</span>
          <b>✓</b>
        </div>
        <h4>قاعدهٔ ثبت‌شده برای فرد وسواسی</h4>
        <p>
          در شک دربارهٔ طهارت، بنا بر پاکی است. اگر «یقین» فرد وسواسی از نوعی باشد که افراد معمولی در
          همان موقعیت به آن یقین نمی‌رسند، به آن اعتنا نمی‌شود. عمل‌کردن به این وظیفهٔ شرعی گناه نیست.
        </p>
        <a href="https://www.sistani.org/persian/qa/01082/" target="_blank" rel="noreferrer">
          مشاهده در پایگاه رسمی دفتر مرجع
          <span>↗</span>
        </a>
      </article>
      <div className="faith-boundary">
        <strong>مرز کمک و اجبار</strong>
        <p>
          این کارت برای یک‌بار یادگیری است، نه اینکه هنگام هر شک دوباره باز شود. بازکردن مکرر آن برای
          رسیدن به آرامش می‌تواند اطمینان‌خواهی باشد.
        </p>
      </div>
    </div>
  );
}

function MedicinePanel() {
  return (
    <div className="medicine-panel">
      <div className="medical-disclaimer">
        <span>＋</span>
        <div>
          <strong>این بخش نسخه یا دوز مصرفی نمی‌دهد.</strong>
          <p>شروع، قطع یا تغییر دارو فقط با روان‌پزشک؛ قطع ناگهانی بعضی داروها خطرناک است.</p>
        </div>
      </div>
      <EvidenceCard
        level="خط اول"
        color="green"
        title="SSRIها و کلومیپرامین"
        text="داروهای دارای شواهد برای خودِ علائم OCD هستند. انتخاب دارو، مدت آزمون، عوارض، بارداری و تداخل‌ها باید فردی بررسی شوند؛ اثر بر وسواس معمولاً فوری نیست."
        foot="نمونه‌های SSRI در راهنماها: سرترالین، فلوکستین، فلووکسامین، پاروکستین و سیتالوپرام/اس‌سیتالوپرام بسته به کشور و نظر پزشک."
      />
      <EvidenceCard
        level="درمان وسواس نیست"
        color="amber"
        title="پروپرانولول"
        text="ممکن است فقط نشانه‌های جسمی اضطراب مثل تپش یا لرزش را کم کند؛ فکر وسواسی و اجبار را درمان نمی‌کند. آسم، ضربان یا فشار پایین و برخی بیماری‌های قلبی از موضوعات مهم بررسی پزشک‌اند."
        foot="به‌دلیل خطر افت فشار، کندی ضربان و مصرف بیش‌ازحد، حتی «دوز کم» هم خودسرانه نیست."
      />
      <EvidenceCard
        level="روتین توصیه نمی‌شود"
        color="rose"
        title="بنزودیازپین‌ها و آرام‌بخش‌ها"
        text="برای علائم اصلی OCD مؤثر شناخته نمی‌شوند و می‌توانند وابستگی، تحمل و خواب‌آلودگی ایجاد کنند. فقط ممکن است پزشک در موقعیت مشخص و کوتاه‌مدت تصمیم دیگری بگیرد."
      />
      <EvidenceCard
        level="شواهد ناکافی برای OCD"
        color="lilac"
        title="گیاهی و مکمل‌ها"
        text="بابونه، سنبل‌الطیب یا اسطوخودوس شاید در برخی پژوهش‌های اضطراب عمومی اثر محدود داشته باشند، اما درمان OCD نیستند. «طبیعی» به معنی بی‌خطر نیست."
        foot="علف چای با بسیاری از داروها، از جمله بعضی ضدافسردگی‌ها و قرص جلوگیری، تداخل جدی دارد. بابونه با وارفارین/حساسیت‌ها و ترکیبات آرام‌بخش هم می‌تواند مسئله‌ساز باشد."
      />
      <div className="doctor-checklist">
        <h4>برای ویزیت چه چیزهایی آماده کنیم؟</h4>
        <ul>
          <li>مدت روزانهٔ شست‌وشو، وارسی یا نشخوار</li>
          <li>اثر علائم بر خواب، کار، رابطه و عبادت</li>
          <li>همهٔ داروها، مکمل‌ها، احتمال بارداری و بیماری‌های زمینه‌ای</li>
          <li>سابقهٔ خلق خیلی بالا، کم‌خوابی غیرعادی یا افکار آسیب به خود</li>
        </ul>
      </div>
      <div className="source-inline">
        <a href="https://www.nice.org.uk/guidance/cg31/chapter/Recommendations" target="_blank" rel="noreferrer">
          NICE
        </a>
        <a href="https://iocdf.org/about-ocd/ocd-treatment-guide/medication/" target="_blank" rel="noreferrer">
          IOCDF
        </a>
        <a href="https://www.nhs.uk/medicines/propranolol/" target="_blank" rel="noreferrer">
          NHS
        </a>
        <a href="https://www.nccih.nih.gov/health/anxiety-and-complementary-health-approaches" target="_blank" rel="noreferrer">
          NCCIH
        </a>
      </div>
    </div>
  );
}

function EvidenceCard({ level, color, title, text, foot }) {
  return (
    <article className={`evidence-card ${color}`}>
      <span>{level}</span>
      <h4>{title}</h4>
      <p>{text}</p>
      {foot && <small>{foot}</small>}
    </article>
  );
}

function MediaPanel() {
  return (
    <div className="media-list">
      <div className="notice-card">
        <span>▶</span>
        <p>منابع انگلیسی‌اند و بیشترشان زیرنویس خودکار دارند. دیدن ویدئو جای تمرین و درمان را نمی‌گیرد.</p>
      </div>
      {media.map((item) => (
        <a key={item.url} className={`media-card ${item.accent}`} href={item.url} target="_blank" rel="noreferrer">
          <span className="play-button">{item.kind === "پادکست" ? "♫" : "▶"}</span>
          <span>
            <small>
              {item.kind} · {item.duration}
            </small>
            <strong>{item.title}</strong>
            <p>{item.subtitle}</p>
          </span>
          <b>↗</b>
        </a>
      ))}
    </div>
  );
}

function SourceList() {
  return (
    <section className="source-list">
      <div className="section-heading compact">
        <h3>منابع اصلی</h3>
        <span className="tiny-badge">بازبینی ۱۴۰۵</span>
      </div>
      {sources.map((source) => (
        <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
          <span>
            <small>{source.type}</small>
            <strong>{source.title}</strong>
          </span>
          <b>
            {source.publisher} ↗
          </b>
        </a>
      ))}
    </section>
  );
}

function Companion({ appState, update, notify, onBack }) {
  const [message, setMessage] = useState("");
  const templates = [
    "می‌بینم خیلی سخت است. کنارت هستم؛ جوابِ وسواس را نمی‌دهم.",
    "لازم نیست حالا حلش کنیم. بیا پنج دقیقه کنار این حس بمانیم.",
    "به تلاشت افتخار می‌کنم، نه به میزان آرامشت.",
  ];

  const send = (text) => {
    if (!text.trim()) return;
    setMessage("");
    notify("در نسخهٔ آزمایشی، پیام فقط محلی ثبت شد.");
  };

  return (
    <div className="screen">
      <button className="companion-back" onClick={onBack}>
        → بازگشت به جامعه
      </button>
      <ScreenHeader eyebrow="حالت همراه" title="کنارش باش، نه کنار وسواس" />
      <div className="pair-card">
        <span className="pair-icon">∞</span>
        <div>
          <small>اتصال آزمایشی</small>
          <strong>همراه هنوز جفت نشده</strong>
          <p>پیام‌رسانی واقعی پس از اتصال سرویس امن فعال می‌شود.</p>
        </div>
        <button onClick={() => notify("کد آزمایشی: RAH-482")}>ساخت کد</button>
      </div>

      <section className="message-box">
        <label htmlFor="support-message">یک پیام کوتاه و بدون اطمینان‌دهی</label>
        <div>
          <textarea
            id="support-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="من اینجا هستم..."
          />
          <button onClick={() => send(message)}>↑</button>
        </div>
        <div className="template-list">
          {templates.map((template) => (
            <button key={template} onClick={() => setMessage(template)}>
              {template}
            </button>
          ))}
        </div>
      </section>

      <section className="do-dont-grid">
        <article className="do-card">
          <span>کمک می‌کند</span>
          <ul>
            <li>نام‌بردن از سختی تجربه</li>
            <li>تشویقِ انتخابِ بدون اجبار</li>
            <li>ثبات و لحن آرام</li>
            <li>مرزهای توافق‌شده</li>
          </ul>
        </article>
        <article className="dont-card">
          <span>چرخه را تغذیه می‌کند</span>
          <ul>
            <li>تأیید مکرر پاکی یا درستی</li>
            <li>شستن یا وارسی به‌جای او</li>
            <li>بحث طولانی با محتوای فکر</li>
            <li>تهدید، شرم یا اجبار</li>
          </ul>
        </article>
      </section>

      <section className="sharing-card">
        <h3>چه چیزی با همراه دیده شود؟</h3>
        <p>صاحب حساب هر مورد را جداگانه کنترل می‌کند.</p>
        {[
          ["messages", "پیام‌های حمایتی"],
          ["wins", "تعداد پاسخ‌های متفاوت"],
          ["urgeLevel", "شدت میل ثبت‌شده"],
          ["notes", "یادداشت‌های شخصی"],
          ["health", "داده‌های ساعت و سلامت"],
        ].map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={appState.sharing[key]}
                onChange={(event) =>
                  update({ sharing: { ...appState.sharing, [key]: event.target.checked } })
                }
              />
              <span />
            </span>
          </label>
        ))}
      </section>
    </div>
  );
}

function Profile({ appState, update, onInstall, onNotifications, onShare, notify }) {
  return (
    <div className="screen profile-screen">
      <ScreenHeader eyebrow="تنظیمات شخصی" title="کنترل در دست شماست" />
      <section className="profile-card profile-card-pro">
        <div className="large-avatar">{appState.name.slice(0, 1)}</div>
        <div>
          <strong>{appState.name}</strong>
          <p>{appState.role === "self" ? "حساب شخصی" : "حساب همراه"}</p>
        </div>
        <button onClick={() => update({ role: appState.role === "self" ? "companion" : "self" })}>
          تغییر حالت
        </button>
      </section>

      <div className="profile-slogan">
        <BrandMark />
        <span>
          <small>هویت رها</small>
          <strong>{brand.slogan}</strong>
        </span>
      </div>

      <SettingsGroup title="ظاهر و حس">
        <div className="theme-picker">
          {[
            ["system", "خودکار", "◐"],
            ["light", "روشن", "☼"],
            ["dark", "تاریک", "☾"],
          ].map(([value, label, icon]) => (
            <button
              key={value}
              className={appState.theme === value ? "active" : ""}
              onClick={() => update({ theme: value })}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <SettingRow
          title="حرکت و انیمیشن"
          description="خاموش‌کردن، حرکت‌ها را برای دسترس‌پذیری متوقف می‌کند."
          checked={appState.motionEnabled}
          onChange={(enabled) => update({ motionEnabled: enabled })}
        />
        <SettingRow
          title="جزئیات فان"
          description="جرقه‌ها، جشن کوچک و ریزتعامل‌های بازی‌گونه"
          checked={appState.funEnabled}
          onChange={(enabled) => update({ funEnabled: enabled })}
        />
      </SettingsGroup>

      <SettingsGroup title="اعلان و اندروید">
        <button className="settings-feature-action" onClick={onNotifications}>
          <span className="settings-feature-icon">♢</span>
          <span>
            <strong>مرکز اعلان رها</strong>
            <small>
              {appState.reminderEnabled
                ? `فعال · هر ${appState.reminderEvery} ساعت`
                : "مجوز، نوع پیام و ساعات سکوت"}
            </small>
          </span>
          <b>←</b>
        </button>
      </SettingsGroup>

      <SettingsGroup title="مکث قبل از گوشی">
        <SettingRow
          title="پیمانِ مکث"
          description="پیش از اپ‌های انتخابی، یک کارت ۲۰ ثانیه‌ای"
          checked={appState.pauseBeforeApps}
          onChange={(enabled) => {
            update({ pauseBeforeApps: enabled });
            notify("در PWA این قابلیت نمایشی است؛ نسخهٔ بومی لازم دارد.");
          }}
        />
        <div className="platform-note">
          نسخهٔ وب نمی‌تواند اپ‌های دیگر را مسدود کند. در iPhone به مجوز Screen Time/Family Controls و
          در Android به پیاده‌سازی بومی با رضایت روشن نیاز است. کاربر همیشه باید امکان لغو داشته باشد.
        </div>
      </SettingsGroup>

      <SettingsGroup title="ساعت هوشمند">
        <SettingRow
          title="سیگنال ساعت"
          description="ضربهٔ دستی یا پیشنهاد مکث بر اساس الگوی شخصی"
          checked={appState.watchEnabled}
          onChange={(enabled) => {
            update({ watchEnabled: enabled });
            notify("اتصال ساعت در این نسخه شبیه‌سازی شده است.");
          }}
        />
        <div className="watch-preview">
          <span className="watch-face">⌁</span>
          <div>
            <strong>ساعت متصل نیست</strong>
            <p>ضربان بالا به‌تنهایی نشانهٔ وسواس نیست و نباید به همسر گزارش خودکار شود.</p>
          </div>
          <button onClick={() => notify("سیگنال تمرینی ثبت شد؛ «یک مکث می‌خواهی؟»")}>آزمایش</button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="اپ و داده">
        <button className="settings-action" onClick={onShare}>
          <span>دعوت و اشتراک‌گذاری رها</span>
          <b>↗</b>
        </button>
        <button className="settings-action" onClick={onInstall}>
          <span>افزودن رها به صفحهٔ اصلی</span>
          <b>←</b>
        </button>
        <button
          className="settings-action"
          onClick={() => {
            const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "raha-data.json";
            link.click();
            URL.revokeObjectURL(link.href);
          }}
        >
          <span>دریافت نسخهٔ داده‌های من</span>
          <b>↓</b>
        </button>
        <a
          className="settings-action"
          href="https://github.com/Yadrouj/Vasvas/blob/main/RESEARCH_FA.md"
          target="_blank"
          rel="noreferrer"
        >
          <span>پژوهش و منابع پروژه</span>
          <b>↗</b>
        </a>
      </SettingsGroup>

      <div className="care-note">
        <strong>اگر وضعیت شدید یا فوری شد</strong>
        <p>
          این اپ ابزار بحران نیست. اگر فرد نمی‌تواند از خود مراقبت کند، آسیب پوستی/جسمی جدی ایجاد شده،
          چند شب نمی‌خوابد، یا فکر آسیب به خود دارد، از خدمات فوری پزشکی یا نزدیک‌ترین مرکز درمانی کمک
          بگیرید.
        </p>
      </div>
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <section className="settings-group">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <label className="setting-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="switch">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span />
      </span>
    </label>
  );
}

function QuickSupport({ onClose, onFinish }) {
  const [stage, setStage] = useState(0);
  const [trigger, setTrigger] = useState("");
  const [urge, setUrge] = useState(6);
  const [delayStarted, setDelayStarted] = useState(false);
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    if (!delayStarted || seconds <= 0) return undefined;
    const interval = window.setInterval(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearInterval(interval);
  }, [delayStarted, seconds]);

  const triggerOptions = [
    ["purity", "نجس و پاک", "◒"],
    ["rumination", "مرور یک حرف", "↻"],
    ["nails", "ناخن و تمیزکاری", "✋"],
    ["other", "یک میل دیگر", "○"],
  ];

  const responses = {
    purity: "ممکن است پاک باشد، ممکن است نباشد. الان دوباره بررسی نمی‌کنم.",
    rumination: "شاید حرفم کامل بود، شاید نبود. مرور ذهنی را ادامه نمی‌دهم.",
    nails: "میل را حس می‌کنم و دست‌ها را آزاد می‌گذارم؛ لازم نیست درستش کنم.",
    other: "این یک هشدار است، نه دستور. می‌توانم با ندانستن جلو بروم.",
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="کمک فوری">
      <div className="sheet quick-sheet">
        <div className="sheet-handle" />
        <div className="sheet-top">
          <button onClick={onClose}>×</button>
          <span>
            {stage + 1} / 3
          </span>
          <i>
            <b style={{ width: `${((stage + 1) / 3) * 100}%` }} />
          </i>
        </div>

        {stage === 0 && (
          <div className="quick-stage">
            <span className="eyebrow">اول فقط نامش را بگذاریم</span>
            <h2>الان وسواس از کدام در آمده؟</h2>
            <p>لازم نیست داستان را تعریف کنی؛ فقط موضوع کلی کافی است.</p>
            <div className="trigger-grid">
              {triggerOptions.map(([id, label, icon]) => (
                <button key={id} className={trigger === id ? "selected" : ""} onClick={() => setTrigger(id)}>
                  <span>{icon}</span>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>
            <button className="primary-button" disabled={!trigger} onClick={() => setStage(1)}>
              ادامه
            </button>
          </div>
        )}

        {stage === 1 && (
          <div className="quick-stage">
            <span className="eyebrow">بدون جنگیدن با حس</span>
            <h2>میل به انجام اجبار چقدر است؟</h2>
            <div className="urge-value">
              <strong>{urge}</strong>
              <span>از ۱۰</span>
            </div>
            <input
              className="urge-range"
              type="range"
              min="0"
              max="10"
              value={urge}
              onChange={(event) => setUrge(Number(event.target.value))}
            />
            <div className="range-labels">
              <span>کم</span>
              <span>خیلی شدید</span>
            </div>
            <div className="acceptance-note">
              قرار نیست عدد را پایین بیاوریم؛ فقط آن را می‌بینیم و انتخاب بعدی را به وسواس نمی‌سپاریم.
            </div>
            <button className="primary-button" onClick={() => setStage(2)}>
              پاسخ متفاوت
            </button>
          </div>
        )}

        {stage === 2 && (
          <div className="quick-stage response-stage">
            <span className="response-icon">⌁</span>
            <span className="eyebrow">جملهٔ پاسخ</span>
            <h2>«{responses[trigger]}»</h2>
            <p>حالا یک کار کوچکِ واقعی انتخاب کن: ادامهٔ گفت‌وگو، برگشتن به کار، یا بازگذاشتن دست‌ها.</p>
            <div className="delay-box">
              <div>
                <small>تأخیر اختیاری در اجبار</small>
                <strong>
                  {String(Math.floor(seconds / 60)).padStart(2, "0")}:
                  {String(seconds % 60).padStart(2, "0")}
                </strong>
              </div>
              <button onClick={() => setDelayStarted((current) => !current)}>
                {delayStarted ? "مکث" : "شروع ۵ دقیقه"}
              </button>
            </div>
            <button
              className="primary-button"
              onClick={() => onFinish({ trigger, urgeBefore: urge, delayed: delayStarted })}
            >
              به کارم برمی‌گردم
            </button>
            <button
              className="text-button"
              onClick={() => onFinish({ trigger, urgeBefore: urge, delayed: false })}
            >
              بدون تایمر ادامه می‌دهم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AskRaha({ appState, onClose }) {
  const [messages, setMessages] = useState([
    {
      from: "raha",
      text: `سلام ${appState.name}. من فتوا تولید نمی‌کنم؛ از قاعدهٔ رسمیِ ثبت‌شده برای ${appState.marja} استفاده می‌کنم. پرسشت بیشتر دربارهٔ چیست؟`,
    },
  ]);
  const [step, setStep] = useState("topic");
  const [topic, setTopic] = useState("");
  const [input, setInput] = useState("");

  const add = (from, text) => setMessages((current) => [...current, { from, text }]);

  const chooseTopic = (id, label) => {
    setTopic(id);
    add("user", label);
    window.setTimeout(() => {
      add(
        "raha",
        "آیا هدفت از پرسیدن، رسیدن به اطمینان یا آرام‌شدنِ فوری است—حتی اگر کاملاً مطمئن نیستی؟",
      );
      setStep("reassurance");
    }, 180);
  };

  const answerReassurance = (answer) => {
    add("user", answer === "yes" ? "بله یا شاید" : "نه، خطر جسمیِ فوری دارم");
    window.setTimeout(() => {
      if (answer === "danger") {
        add(
          "raha",
          "اگر خطر جسمیِ واقعی و فوری، زخم جدی، تماس با ماده خطرناک یا ناتوانی در مراقبت از خود وجود دارد، اینجا جای پاسخ نیست؛ از خدمات پزشکی کمک بگیر. برای تردید فقهیِ وسواسی وارد جزئیات تازه نمی‌شوم.",
        );
        setStep("done");
        return;
      }

      const response =
        topic === "talk"
          ? "این سؤال شبیه مرور وسواسیِ گفت‌وگوست. شاید حرفت کامل بوده، شاید نه؛ دوباره مرور، توضیح یا عذرخواهی نکن و به گفت‌وگو یا کار بعدی برگرد."
          : topic === "nails"
            ? "این میل را لازم نیست کامل کنی. ناخن را وارسی یا تمیز نکن؛ دست‌ها را آزاد بگذار و مثل حالت معمول ادامه بده."
            : "بر اساس آخرین منبع رسمیِ ثبت‌شده در رها (بازبینی ۱۴۰۵) و با توجه به وسواسی‌بودن این تردید، بهتر است اعتنا نکنی: بررسی، شست‌وشو، سؤال یا تکرار نکن و بنا را بر پاکی و رفتار معمول بگذار. این پاسخ موردی یا فتوای تازه نیست؛ همان قاعدهٔ ثابتِ فرد وسواسی است.";
      add("raha", response);
      window.setTimeout(() => {
        add(
          "raha",
          "برای ضعیف‌شدن چرخه، دربارهٔ همین موضوع تا مدتی جواب تازه نمی‌دهم. قدم بعدی‌ات چیست؟",
        );
        setStep("next");
      }, 260);
    }, 180);
  };

  const submitFreeText = () => {
    const clean = input.trim();
    if (!clean) return;
    setInput("");
    add("user", clean);
    window.setTimeout(() => {
      add(
        "raha",
        "جزئیات بیشتر معمولاً قطعیت بیشتری نمی‌آورد. اگر این پرسش از همان تردید وسواسی می‌آید، طبق قاعدهٔ ثبت‌شده بهتر است انجامش ندهی، دوباره نپرسی و مثل فرد معمولی ادامه بدهی.",
      );
      setStep("done");
    }, 180);
  };

  return (
    <div className="modal-backdrop chat-backdrop" role="dialog" aria-modal="true" aria-label="از رها بپرس">
      <div className="sheet chat-sheet">
        <header className="chat-header">
          <button onClick={onClose}>×</button>
          <div>
            <span className="raha-dot">ر</span>
            <span>
              <strong>راهنمای رها</strong>
              <small>قاعده‌محور · نه پاسخ‌گوی اطمینان</small>
            </span>
          </div>
          <a href="https://www.sistani.org/persian/qa/01082/" target="_blank" rel="noreferrer">
            منبع ↗
          </a>
        </header>
        <div className="source-status">
          منبع شرعی ثبت‌شده: دفتر رسمی {appState.marja} · بازبینی ۱۴۰۵
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={`${message.from}-${index}`} className={`chat-message ${message.from}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="chat-actions">
          {step === "topic" && (
            <div className="chat-choice-grid">
              <button onClick={() => chooseTopic("purity", "نجس یا پاکی")}>نجس یا پاکی</button>
              <button onClick={() => chooseTopic("washing", "شستن یا تکرار عبادت")}>شستن یا تکرار</button>
              <button onClick={() => chooseTopic("talk", "حرفی که زده‌ام")}>حرفی که زده‌ام</button>
              <button onClick={() => chooseTopic("nails", "ناخن و تمیزکاری")}>ناخن و تمیزکاری</button>
            </div>
          )}
          {step === "reassurance" && (
            <div className="chat-choice-stack">
              <button className="recommended" onClick={() => answerReassurance("yes")}>
                بله، یا مطمئن نیستم
              </button>
              <button onClick={() => answerReassurance("danger")}>خطر جسمیِ فوری و واقعی وجود دارد</button>
            </div>
          )}
          {step === "next" && (
            <div className="chat-choice-grid next-actions">
              <button
                onClick={() => {
                  add("user", "به کار قبلی برمی‌گردم");
                  add("raha", "همین انتخاب کافی است. لازم نیست اول احساس بهتری پیدا کنی.");
                  setStep("done");
                }}
              >
                برگشت به کار قبلی
              </button>
              <button
                onClick={() => {
                  add("user", "دست‌ها را آزاد می‌گذارم");
                  add("raha", "دست‌ها آزاد، فکر آزاد است بماند؛ تو ادامه بده.");
                  setStep("done");
                }}
              >
                آزادگذاشتن دست‌ها
              </button>
            </div>
          )}
          {step === "done" && (
            <div className="chat-finish">
              <p>جواب تازه به همین تردید کمک‌کننده نیست. این گفت‌وگو را ببند و قدم بعدی را انجام بده.</p>
              <button className="primary-button" onClick={onClose}>
                پایان و ادامهٔ زندگی
              </button>
            </div>
          )}
          {step !== "done" && (
            <div className="chat-input">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && submitFreeText()}
                placeholder="اگر لازم است، فقط یک جمله..."
              />
              <button onClick={submitFreeText}>↑</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Breathing({ onClose }) {
  const [elapsed, setElapsed] = useState(0);
  const total = 60;
  const cycle = elapsed % 10;
  const phase = cycle < 4 ? "آرام دَم" : "آرام بازدَم";

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((current) => Math.min(total, current + 1)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="modal-backdrop breathing-backdrop" role="dialog" aria-modal="true" aria-label="تنفس آرام">
      <div className="breathing-modal">
        <button className="breath-close" onClick={onClose}>
          ×
        </button>
        <span className="eyebrow light">یک دقیقه کنار احساس</span>
        <h2>{elapsed >= total ? "تمام شد؛ حالا به زندگی برگرد." : phase}</h2>
        <div className={`breath-orb ${cycle < 4 ? "inhale" : "exhale"}`}>
          <span>{elapsed >= total ? "✓" : cycle < 4 ? 4 - cycle : 10 - cycle}</span>
          <i />
          <b />
        </div>
        <div className="breath-progress">
          <i style={{ width: `${(elapsed / total) * 100}%` }} />
        </div>
        <p>
          نرم و بی‌زور نفس بکش. قرار نیست اضطراب را صفر کنی؛ فقط فضایی می‌سازی تا اجبار را انتخاب نکنی.
        </p>
        <button className="light-outline" onClick={onClose}>
          {elapsed >= total ? "بازگشت" : "پایان زودتر"}
        </button>
      </div>
    </div>
  );
}

function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {["✦", "●", "◆", "✦", "●", "◆", "✦", "●", "◆", "✦", "●", "◆"].map((shape, index) => (
        <span key={`${shape}-${index}`} style={{ "--i": index }}>
          {shape}
        </span>
      ))}
      <div>
        <BrandMark label="" />
        <strong>یک انتخاب تازه!</strong>
      </div>
    </div>
  );
}

function ScreenHeader({ eyebrow, title }) {
  return (
    <header className="screen-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
    </header>
  );
}

function BottomNav({ active, onChange }) {
  const items = [
    ["home", "خانه", "⌂"],
    ["practice", "تمرین", "⌁"],
    ["learn", "کشف", "✦"],
    ["community", "جامعه", "◎"],
    ["profile", "تنظیمات", "◉"],
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([id, label, icon]) => (
        <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)}>
          <span>{icon}</span>
          <small>{label}</small>
        </button>
      ))}
    </nav>
  );
}

export default App;
