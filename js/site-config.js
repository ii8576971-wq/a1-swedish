/** 배포 URL — GitHub Pages 기준 (로컬·다른 호스트는 자동 보정) */
window.SITE_CONFIG = {
  baseUrl: "https://ii8576971-wq.github.io/a1-swedish",
  siteName: "A1 Swedish",
  defaultDescription:
    "스웨디시 마사지·서울출장마사지 웰니스 정보. 효과, 코스 선택, 홈타이 가이드 블로그.",
  locale: "ko_KR",
};

function getSiteBase() {
  const cfg = window.SITE_CONFIG?.baseUrl;
  if (cfg) return cfg.replace(/\/$/, "");
  const path = location.pathname.replace(/\/[^/]*$/, "");
  return (location.origin + path).replace(/\/$/, "") || location.origin;
}

function absoluteUrl(relativePath) {
  const base = getSiteBase();
  const path = String(relativePath || "")
    .replace(/^\//, "")
    .replace(/^https?:\/\//, "");
  if (path.startsWith("http")) return path;
  return `${base}/${path}`;
}
