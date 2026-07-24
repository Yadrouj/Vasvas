import { useMemo, useState } from "react";
import { communityCategories } from "./content.js";

const LIVE_COMMUNITY_URL = "https://github.com/Yadrouj/Vasvas/discussions";
const NEW_TOPIC_URL = "https://github.com/Yadrouj/Vasvas/discussions/new/choose";

const riskyPatterns = [
  {
    pattern: /(خودکشی|کشتن خودم|آسیب به خود|نمی‌خواهم زنده)/,
    type: "crisis",
    message: "این نوشته ممکن است به خطر فوری اشاره کند. تالار همتا جای کمک فوری نیست؛ همین حالا با یک فرد امن و خدمات حضوری یا اورژانسی محل زندگی تماس بگیر.",
  },
  {
    pattern: /(چند\s*میلی|چه\s*دوز|دوز\s*دارو|نسخه\s*بده|چه\s*قرصی|خودسرانه)/,
    type: "medical",
    message: "در جامعه نمی‌توان دوز یا نسخهٔ شخصی خواست یا داد. سؤال را به تجربهٔ مراجعه و آماده‌شدن برای ویزیت تغییر بده.",
  },
  {
    pattern: /(پاکه\s*[؟?]|نجسه\s*[؟?]|باطله\s*[؟?]|فتوا\s*بده|گناه\s*کردم\s*[؟?])/,
    type: "reassurance",
    message: "این شکل سؤال احتمالاً درخواست اطمینان یا فتوای موردی است. به‌جای نتیجه، دربارهٔ مهارتِ بی‌اعتنایی به شک یا مراجعه به منبع ثابت بنویس.",
  },
];

function assessText(text) {
  return riskyPatterns.find((item) => item.pattern.test(text)) || null;
}

export function Community({ appState, update, notify, onOpenCompanion }) {
  const [category, setCategory] = useState("همه");
  const [sort, setSort] = useState("new");
  const [composerOpen, setComposerOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);

  const hidden = appState.reportedPostIds;
  const supported = appState.supportedPostIds;
  const posts = appState.communityPosts;

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter(
      (post) => !hidden.includes(post.id) && (category === "همه" || post.category === category),
    );
    if (sort === "unanswered") return filtered.filter((post) => !post.comments?.length);
    if (sort === "popular") return [...filtered].sort((a, b) => b.supports - a.supports);
    return filtered;
  }, [category, hidden, posts, sort]);

  const toggleSupport = (postId) => {
    const hasSupported = supported.includes(postId);
    update({
      supportedPostIds: hasSupported ? supported.filter((id) => id !== postId) : [...supported, postId],
      communityPosts: posts.map((post) =>
        post.id === postId ? { ...post, supports: Math.max(0, post.supports + (hasSupported ? -1 : 1)) } : post,
      ),
    });
  };

  const addPost = (draft) => {
    const post = {
      id: `local-${Date.now()}`,
      author: draft.anonymous ? "هم‌قدم ناشناس" : appState.name || "عضو رها",
      badge: "پیش‌نویس محلی",
      category: draft.category,
      title: draft.title.trim(),
      body: draft.body.trim(),
      createdAt: "همین حالا",
      supports: 0,
      comments: [],
      localOnly: true,
    };
    update({ communityPosts: [post, ...posts] });
    setComposerOpen(false);
    notify("پیش‌نویس روی همین دستگاه ذخیره شد؛ برای انتشار عمومی، تالار زنده را باز کن.");
  };

  const addReply = (postId, body) => {
    update({
      communityPosts: posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                {
                  id: `comment-${Date.now()}`,
                  author: appState.name || "هم‌قدم",
                  body,
                },
              ],
            }
          : post,
      ),
    });
    setActivePost((current) =>
      current
        ? {
            ...current,
            comments: [
              ...(current.comments || []),
              { id: `preview-${Date.now()}`, author: appState.name || "هم‌قدم", body },
            ],
          }
        : current,
    );
    notify("پاسخ روی این دستگاه ثبت شد.");
  };

  const reportPost = (postId) => {
    update({ reportedPostIds: [...hidden, postId] });
    setActivePost(null);
    notify("موضوع از این دستگاه پنهان و برای بازبینی علامت‌گذاری شد.");
  };

  return (
    <div className="screen community-screen">
      <header className="community-header">
        <div>
          <span className="eyebrow">جامعهٔ رها · حمایت همتا</span>
          <h1>تنها نیستیم؛ چرخه را هم تغذیه نمی‌کنیم</h1>
        </div>
        <button onClick={() => setRulesOpen(true)} aria-label="قوانین جامعه">
          ⓘ
        </button>
      </header>

      <section className="live-community-banner">
        <span className="live-dot" />
        <div>
          <small>تالار عمومی زنده</small>
          <strong>موضوع بساز، پاسخ بده و بحث‌ها را دنبال کن</strong>
          <p>نسخهٔ زنده فعلاً روی GitHub Discussions است و برای نوشتن به حساب GitHub نیاز دارد.</p>
        </div>
        <div className="live-community-actions">
          <a href={LIVE_COMMUNITY_URL} target="_blank" rel="noreferrer">
            ورود به تالار
          </a>
          <a href={NEW_TOPIC_URL} target="_blank" rel="noreferrer">
            موضوع عمومی تازه ＋
          </a>
        </div>
      </section>

      <div className="community-shortcuts">
        <button onClick={() => setComposerOpen(true)}>
          <span>＋</span>
          <strong>پیش‌نویس موضوع</strong>
          <small>اول با محافظ ایمنی بررسی کن</small>
        </button>
        <button onClick={onOpenCompanion}>
          <span>∞</span>
          <strong>فضای زن و شوهر</strong>
          <small>پیام حمایتی و مرزها</small>
        </button>
      </div>

      <div className="community-category-scroll">
        {communityCategories.map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="feed-controls">
        <strong>گفت‌وگوها</strong>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="مرتب‌سازی گفت‌وگوها">
          <option value="new">تازه‌ترین</option>
          <option value="popular">بیشترین هم‌قدمی</option>
          <option value="unanswered">بی‌پاسخ</option>
        </select>
      </div>

      <div className="community-feed">
        {visiblePosts.map((post) => (
          <article key={post.id} className={`community-post ${post.pinned ? "pinned" : ""}`}>
            <button className="post-main" onClick={() => setActivePost(post)}>
              <div className="post-meta">
                <span className="post-avatar">{post.author.slice(0, 1)}</span>
                <span>
                  <strong>{post.author}</strong>
                  <small>
                    {post.badge} · {post.createdAt}
                  </small>
                </span>
                {post.pinned && <b>پین‌شده</b>}
              </div>
              <span className="post-category">{post.category}</span>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              {post.localOnly && <em>فقط روی این دستگاه</em>}
            </button>
            <div className="post-actions">
              <button className={supported.includes(post.id) ? "active" : ""} onClick={() => toggleSupport(post.id)}>
                ♡ {post.supports} هم‌قدم
              </button>
              <button onClick={() => setActivePost(post)}>◌ {post.comments?.length || 0} پاسخ</button>
              <button onClick={() => reportPost(post.id)} aria-label="گزارش موضوع">
                ⋯
              </button>
            </div>
          </article>
        ))}
      </div>

      {!visiblePosts.length && (
        <div className="empty-state">
          <span>◌</span>
          <strong>هنوز گفت‌وگویی اینجا نیست</strong>
          <p>می‌توانی تجربهٔ یک مهارت یا یک موفقیت کوچک را بنویسی.</p>
        </div>
      )}

      <aside className="local-data-note">
        <strong>این فید داخل اپ، نمونهٔ حریم‌خصوصی‌محور است</strong>
        <p>
          پیش‌نویس‌ها، واکنش‌ها و پاسخ‌های این صفحه فعلاً فقط در مرورگر همین دستگاه ذخیره می‌شوند. بخش عمومی واقعی از
          دکمهٔ «تالار عمومی زنده» باز می‌شود.
        </p>
      </aside>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} onPublish={addPost} />}
      {rulesOpen && <CommunityRules onClose={() => setRulesOpen(false)} />}
      {activePost && (
        <PostSheet
          post={posts.find((post) => post.id === activePost.id) || activePost}
          onClose={() => setActivePost(null)}
          onReply={addReply}
          onReport={reportPost}
        />
      )}
    </div>
  );
}

function Composer({ onClose, onPublish }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("موفقیت کوچک");
  const [anonymous, setAnonymous] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const assessment = assessText(`${title} ${body}`);
  const blocked = assessment?.type === "crisis";
  const canPublish = title.trim().length >= 5 && body.trim().length >= 15 && accepted && !assessment;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="ساخت موضوع">
      <div className="sheet composer-sheet">
        <div className="sheet-handle" />
        <header>
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <div>
            <small>محافظ بالینی روشن است</small>
            <h2>یک موضوع حمایت‌محور بساز</h2>
          </div>
        </header>

        <div className="composer-body">
          <label>
            دسته‌بندی
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {communityCategories
                .filter((item) => item !== "همه")
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </label>
          <label>
            عنوان
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثلاً امروز یک وارسی را انجام ندادم"
              maxLength={90}
            />
          </label>
          <label>
            متن
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="از تجربهٔ خودت، مهارتی که تمرین کردی یا حمایتی که نیاز داری بنویس؛ نه درخواست تضمین."
              maxLength={800}
            />
          </label>

          {assessment && (
            <div className={`composer-warning ${blocked ? "danger" : ""}`}>
              <strong>{blocked ? "انتشار متوقف شد" : "بهتر است متن را بازنویسی کنی"}</strong>
              <p>{assessment.message}</p>
            </div>
          )}

          <label className="composer-check">
            <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            <span>با نام مستعار منتشر شود</span>
          </label>
          <label className="composer-check">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
            <span>می‌دانم اینجا جای تشخیص، نسخه، فتوای شخصی یا اطمینان‌دادن نیست.</span>
          </label>

          <button
            className="primary-button"
            disabled={!canPublish}
            onClick={() => onPublish({ title, body, category, anonymous })}
          >
            ذخیرهٔ پیش‌نویس امن
          </button>
          <a className="public-compose-link" href={NEW_TOPIC_URL} target="_blank" rel="noreferrer">
            انتشار در تالار عمومی زنده ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function PostSheet({ post, onClose, onReply, onReport }) {
  const [reply, setReply] = useState("");
  const assessment = assessText(reply);
  const canReply = reply.trim().length >= 8 && !assessment;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={post.title}>
      <article className="sheet post-sheet">
        <div className="sheet-handle" />
        <header>
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <span>
            <small>{post.category}</small>
            <strong>{post.author}</strong>
          </span>
          <button onClick={() => onReport(post.id)} aria-label="گزارش">
            ⋯
          </button>
        </header>
        <div className="post-sheet-body">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <div className="reply-guide">
            <strong>پاسخ مفید = دیدن رنج + اشتراک تجربه + دعوت به مهارت</strong>
            <small>پاسخ نامفید = تضمینِ پاکی، بی‌خطری، عشق یا درست‌بودن</small>
          </div>

          <section className="comment-list">
            <h3>{post.comments?.length || 0} پاسخ</h3>
            {(post.comments || []).map((comment) => (
              <article key={comment.id}>
                <strong>{comment.author}</strong>
                <p>{comment.body}</p>
              </article>
            ))}
          </section>

          <label className="reply-box">
            پاسخ حمایت‌محور
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="می‌بینم سخت بوده... تجربهٔ من از یک مهارت این بود که..."
              maxLength={500}
            />
          </label>
          {assessment && (
            <div className="composer-warning">
              <strong>این پاسخ ممکن است چرخه را تقویت کند</strong>
              <p>{assessment.message}</p>
            </div>
          )}
          <button
            className="primary-button"
            disabled={!canReply}
            onClick={() => {
              onReply(post.id, reply.trim());
              setReply("");
            }}
          >
            ثبت پاسخ روی دستگاه
          </button>
        </div>
      </article>
    </div>
  );
}

function CommunityRules({ onClose }) {
  const rules = [
    ["از تجربهٔ خودم می‌گویم", "به‌جای تشخیص یا دستور، مهارت و تجربهٔ زیسته را به اشتراک می‌گذارم."],
    ["اطمینان نمی‌دهم", "به «پاک است؟»، «دوستم دارد؟» یا «خطر ندارد؟» جواب قطعی نمی‌دهم."],
    ["نسخه و فتوا نمی‌دهم", "نام دارو فقط در آموزش عمومی؛ دوز، تغییر دارو و حکم موردی حذف می‌شود."],
    ["جزئیات تحریک‌کننده نمی‌نویسم", "برای افکار ناخواسته، نام کلی موضوع و نیاز به حمایت کافی است."],
    ["حریم خصوصی و رضایت", "نام، تصویر، اعتراف یا اطلاعات همسر و کودک را بدون رضایت منتشر نمی‌کنم."],
    ["خطر فوری را به متخصص می‌سپارم", "تالار جای پاسخ به خطر خودآسیبی، روان‌پریشی یا خشونت واقعی نیست."],
  ];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="قوانین جامعه">
      <div className="sheet rules-sheet">
        <div className="sheet-handle" />
        <header>
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <div>
            <small>پیش از مشارکت</small>
            <h2>قوانین جامعهٔ رها</h2>
          </div>
        </header>
        <div className="rules-list">
          {rules.map(([title, text], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="rules-foot">
          این فضا حمایت همتاست، نه درمان یا خدمات بحران. گزارش محتوا و مدیریت فعال، بخشی از نسخهٔ چندکاربرهٔ نهایی است.
        </p>
        <a
          className="rules-external"
          href="https://github.com/Yadrouj/Vasvas/blob/main/COMMUNITY_GUIDELINES_FA.md"
          target="_blank"
          rel="noreferrer"
        >
          خواندن نسخهٔ کامل قواعد جامعه ↗
        </a>
        <button className="primary-button" onClick={onClose}>
          متوجه شدم
        </button>
      </div>
    </div>
  );
}
