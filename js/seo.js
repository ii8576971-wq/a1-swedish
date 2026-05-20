function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

function setMetaName(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setOg(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function initStaticPageSeo(pagePath) {
  if (typeof absoluteUrl !== "function") return;
  const url = absoluteUrl(pagePath);
  setCanonical(url);
  setOg("og:url", url);
  setOg("og:site_name", window.SITE_CONFIG?.siteName || "A1 Swedish");
  setOg("og:locale", "ko_KR");
}

function injectJsonLd(data) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function initHomeJsonLd() {
  if (typeof absoluteUrl !== "function") return;
  const base = getSiteBase();
  injectJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: "A1 Swedish",
        description: window.SITE_CONFIG?.defaultDescription,
        inLanguage: "ko-KR",
        potentialAction: {
          "@type": "SearchAction",
          target: `${base}/blog.html?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "A1 Swedish",
        url: `${base}/`,
      },
    ],
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.seoPage;
  if (page === "home") initHomeJsonLd();
  else if (page) initStaticPageSeo(page);
});
