import { useMemo, useState } from "react";
import { topicCatalog, topicGroups } from "./content.js";

export function TopicExplorer() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [selected, setSelected] = useState(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");
    return topicCatalog.filter((topic) => {
      const inGroup = group === "all" || topic.group === group;
      const haystack = [topic.title, topic.summary, ...topic.patterns, topic.response].join(" ").toLocaleLowerCase("fa");
      return inGroup && (!normalized || haystack.includes(normalized));
    });
  }, [group, query]);

  return (
    <div className="topic-explorer">
      <section className="catalog-intro">
        <span className="catalog-orbit">✦</span>
        <div>
          <small>دایره‌المعارف رها</small>
          <h2>وسواس موضوع عوض می‌کند؛ چرخه معمولاً همان است</h2>
          <p>
            این‌ها «موضوع‌های رایج» و اختلالات مرتبط‌اند، نه تشخیص‌های جدا و نه فهرست کامل. روی هر کارت بزن تا
            الگو و اولین پاسخ سالم را ببینی.
          </p>
        </div>
      </section>

      <label className="catalog-search">
        <span>⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثلاً نشخوار، بارداری، رابطه یا نجاست"
          aria-label="جست‌وجوی موضوعات"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="پاک‌کردن جست‌وجو">
            ×
          </button>
        )}
      </label>

      <div className="topic-filters" role="tablist" aria-label="دسته‌بندی موضوعات">
        {topicGroups.map((item) => (
          <button
            key={item.id}
            className={group === item.id ? "active" : ""}
            onClick={() => setGroup(item.id)}
            role="tab"
            aria-selected={group === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="women-spotlight">
        <div>
          <small>پروندهٔ ویژهٔ زنان</small>
          <strong>بدن، چرخه، بارداری و یائسگی</strong>
          <p>علائم را جدی بگیریم، اما هر تغییر بدن را هم به وسواس یا هورمون نسبت ندهیم.</p>
        </div>
        <button onClick={() => setGroup("women")}>دیدن پرونده ←</button>
      </section>

      <div className="catalog-count">
        <strong>{results.length} موضوع</strong>
        <span>آخرین بازبینی محتوایی: تیر ۱۴۰۵</span>
      </div>

      <div className="topic-grid">
        {results.map((topic) => (
          <button key={topic.id} className={`topic-card topic-${topic.group}`} onClick={() => setSelected(topic)}>
            <span className="topic-icon">{topic.icon}</span>
            <span>
              <strong>{topic.title}</strong>
              <p>{topic.summary}</p>
            </span>
            <b>←</b>
          </button>
        ))}
      </div>

      {!results.length && (
        <div className="empty-state">
          <span>⌕</span>
          <strong>موضوعی پیدا نشد</strong>
          <p>یک واژهٔ کوتاه‌تر امتحان کن. نام یک فکر برای تشخیص کافی نیست.</p>
        </div>
      )}

      <div className="catalog-caution">
        <strong>یک مرز مهم</strong>
        <p>
          خواندن پشت‌سرهم مقاله‌ها برای رسیدن به قطعیت می‌تواند شکل تازه‌ای از اطمینان‌خواهی باشد. یک موضوع را بخوان،
          یک پاسخ عملی انتخاب کن و به زندگی برگرد.
        </p>
      </div>

      {selected && <TopicSheet topic={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function TopicSheet({ topic, onClose }) {
  return (
    <div className="modal-backdrop topic-backdrop" role="dialog" aria-modal="true" aria-label={topic.title}>
      <article className="sheet topic-sheet">
        <div className="sheet-handle" />
        <header className="topic-sheet-header">
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <span className={`topic-icon topic-${topic.group}`}>{topic.icon}</span>
          <div>
            <small>راهنمای کوتاه، نه تشخیص</small>
            <h2>{topic.title}</h2>
          </div>
        </header>

        <div className="topic-sheet-body">
          <p className="topic-lead">{topic.summary}</p>

          <section>
            <span className="topic-step-number">۱</span>
            <div>
              <h3>چرخه ممکن است این‌طور دیده شود</h3>
              <ul>
                {topic.patterns.map((pattern) => (
                  <li key={pattern}>{pattern}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="topic-response">
            <span className="topic-step-number">۲</span>
            <div>
              <h3>اولین پاسخ کم‌خطر</h3>
              <p>{topic.response}</p>
            </div>
          </section>

          <aside>
            <strong>مرز ایمنی</strong>
            <p>{topic.boundary}</p>
          </aside>

          <a className="topic-source" href={topic.sourceUrl} target="_blank" rel="noreferrer">
            <span>
              <small>منبع بیرونی</small>
              <strong>{topic.sourceTitle}</strong>
            </span>
            <b>↗</b>
          </a>

          <button className="primary-button" onClick={onClose}>
            خواندم؛ حالا به یک کار ارزشمند برمی‌گردم
          </button>
        </div>
      </article>
    </div>
  );
}
