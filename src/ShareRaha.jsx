import { useMemo } from "react";
import { BrandLockup, BrandMark } from "./Brand.jsx";
import { brand } from "./brandData.js";

function makeReferralCode(name) {
  const input = name || "raha";
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `R${hash.toString(36).toUpperCase().slice(0, 5).padStart(5, "0")}`;
}

export function ShareRaha({ appState, update, notify, onClose }) {
  const referralCode = useMemo(() => makeReferralCode(appState.name), [appState.name]);
  const shareUrl = useMemo(() => {
    const url = new URL(import.meta.env.BASE_URL, window.location.origin);
    url.searchParams.set("ref", referralCode);
    return url.href;
  }, [referralCode]);
  const shareText = `${brand.slogan}\nرها؛ همراه فارسی برای پاسخ سالم‌تر به وسواس.\n${shareUrl}`;
  const encodedText = encodeURIComponent(shareText);

  const markShared = () => {
    update({ shareCount: (appState.shareCount || 0) + 1, lastSharedAt: new Date().toISOString() });
    navigator.vibrate?.(35);
  };

  const nativeShare = async () => {
    const data = {
      title: "رها | فکر می‌آید؛ انتخاب با توست",
      text: "یک همراه فارسی برای پاسخ سالم‌تر به وسواس؛ بدون اطمینان‌دهی و بدون قضاوت.",
      url: shareUrl,
    };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data);
        markShared();
        notify("رها به انتخاب خودت برای اشتراک‌گذاری فرستاده شد.");
      } else {
        await navigator.clipboard.writeText(shareText);
        markShared();
        notify("لینک دعوت کپی شد.");
      }
    } catch (error) {
      if (error.name !== "AbortError") notify("اشتراک‌گذاری کامل نشد؛ می‌توانی لینک را کپی کنی.");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    markShared();
    notify("لینک اختصاصی دعوت کپی شد.");
  };

  return (
    <div className="modal-backdrop share-backdrop" role="dialog" aria-modal="true" aria-label="اشتراک رها">
      <section className="sheet share-sheet">
        <div className="sheet-handle" />
        <header className="share-head">
          <button onClick={onClose} aria-label="بستن">
            ×
          </button>
          <BrandLockup compact />
          <span>دعوت مسئولانه</span>
        </header>

        <div className="share-body">
          <article className="share-poster">
            <span className="poster-noise" />
            <div className="poster-top">
              <BrandMark />
              <span>RAHA · رها</span>
            </div>
            <div className="poster-copy">
              <span>نه جنگ با فکر، نه فرار از آن</span>
              <h2>فکر می‌آید؛<br />انتخاب با توست.</h2>
              <p>یک فضای فارسی، علمی و مهربان برای تمرین زندگی کنار ابهام.</p>
            </div>
            <div className="poster-bottom">
              <span>raha</span>
              <strong>{referralCode}</strong>
            </div>
            <i className="poster-orbit orbit-one" />
            <i className="poster-orbit orbit-two" />
            <b className="poster-spark">✦</b>
          </article>

          <section className="share-story">
            <span className="eyebrow">متن آمادهٔ دعوت</span>
            <p>
              «اگر ذهنت زیاد دنبال قطعیت می‌گردد، رها کمک می‌کند جواب تازه‌ای تمرین کنی. نه تشخیص می‌دهد و نه
              جای درمانگر را می‌گیرد.»
            </p>
          </section>

          <button className="share-main-action" onClick={nativeShare}>
            <span>↗</span>
            اشتراک‌گذاری با منوی گوشی
          </button>

          <div className="social-share-grid">
            <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noreferrer" onClick={markShared}>
              <span>W</span>
              واتساپ
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(brand.slogan)}`}
              target="_blank"
              rel="noreferrer"
              onClick={markShared}
            >
              <span>↗</span>
              تلگرام
            </a>
            <button onClick={copyLink}>
              <span>⌘</span>
              کپی لینک
            </button>
          </div>

          <div className="referral-card">
            <div>
              <small>کد دعوت ناشناس</small>
              <strong>{referralCode}</strong>
            </div>
            <div>
              <small>اشتراک‌گذاری‌های این دستگاه</small>
              <strong>{appState.shareCount || 0}</strong>
            </div>
          </div>

          <p className="share-privacy">
            این شمارنده فقط دفعات اشتراک‌گذاری روی همین دستگاه را نشان می‌دهد؛ تعداد کاربر جذب‌شده یا اطلاعات
            مخاطبان بدون backend و رضایت جمع‌آوری نمی‌شود.
          </p>
        </div>
      </section>
    </div>
  );
}
