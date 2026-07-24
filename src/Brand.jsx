import { brand } from "./brandData.js";

export function BrandMark({ className = "", label = "نشان رها" }) {
  return <img className={`brand-logo ${className}`.trim()} src="./logo-mark.svg" alt={label} />;
}

export function BrandLockup({ compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? "compact" : ""}`}>
      <BrandMark />
      <span>
        <strong>{brand.name}</strong>
        <small>{brand.slogan}</small>
      </span>
    </div>
  );
}
