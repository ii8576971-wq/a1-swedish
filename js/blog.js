function resolveImageUrl(path) {
  if (!path || path.startsWith("http")) return path;
  const base = window.location.href.replace(/[^/]*$/, "");
  return base + path;
}

function blogCardHtml(p) {
  return `
    <article class="card">
      <a href="blog-view.html?id=${p.id}">
        <div class="card-image-wrap">
          <img class="card-image" src="${resolveImageUrl(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy" />
        </div>
        <div class="card-body">
          <p class="card-meta">${formatDate(p.date)} · ${escapeHtml(p.author)}</p>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.excerpt)}</p>
          <span class="card-link">자세히 보기 →</span>
        </div>
      </a>
    </article>
  `;
}

function renderBlogList(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const posts = getBlogPosts().sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (!posts.length) {
    el.innerHTML =
      '<p class="board-empty">아직 작성된 글이 없습니다.</p>';
    return;
  }

  const [featured, ...rest] = posts;

  const featuredHtml = `
    <article class="blog-featured">
      <a href="blog-view.html?id=${featured.id}" class="blog-featured-main">
        <div class="featured-img-wrap">
          <img src="${resolveImageUrl(featured.image)}" alt="${escapeHtml(featured.title)}" loading="lazy" />
        </div>
        <div class="blog-featured-overlay">
          <span class="card-meta">${formatDate(featured.date)} · ${featured.views} views</span>
          <h2>${escapeHtml(featured.title)}</h2>
          <p>${escapeHtml(featured.excerpt)}</p>
        </div>
      </a>
    </article>
  `;

  const listHtml =
    rest.length > 0
      ? `
    <p class="blog-list-count">전체 <strong>${posts.length}</strong>개의 글 · 최신순</p>
    <div class="card-grid">${rest.map(blogCardHtml).join("")}</div>
  `
      : "";

  el.innerHTML = featuredHtml + listHtml;
}

function renderHomeBlogPreview(containerId, limit = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const posts = getBlogPosts()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  el.innerHTML = posts.map(blogCardHtml).join("");
}

function setPageMeta(post) {
  const desc = post.excerpt || post.content.slice(0, 150);
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = desc;

  const postUrl =
    typeof absoluteUrl === "function"
      ? absoluteUrl(`blog-view.html?id=${encodeURIComponent(post.id)}`)
      : `${location.origin}${location.pathname.replace(/[^/]+$/, "")}blog-view.html?id=${encodeURIComponent(post.id)}`;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = postUrl;

  [
    ["og:title", post.title],
    ["og:description", desc],
    ["og:url", postUrl],
    ["og:image", resolveImageUrl(post.image)],
    ["og:type", "article"],
    ["og:locale", "ko_KR"],
  ].forEach(([prop, content]) => {
    let tag = document.querySelector(`meta[property="${prop}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", prop);
      document.head.appendChild(tag);
    }
    tag.content = content;
  });

  const existingLd = document.getElementById("post-jsonld");
  if (existingLd) existingLd.remove();
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.id = "post-jsonld";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: desc,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author || "A1 Swedish" },
    image: resolveImageUrl(post.image),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  });
  document.head.appendChild(ld);
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

function formatPostBody(post) {
  const paragraphs = post.content.split("\n\n").filter(Boolean);
  const mid = Math.floor(paragraphs.length / 2);
  return paragraphs
    .map((p, i) => {
      let html = `<p>${formatInlineMarkdown(p).replace(/\n/g, "<br>")}</p>`;
      if (post.image2 && i === mid) {
        html += `<div class="post-inline-wrap"><img src="${resolveImageUrl(post.image2)}" alt="${escapeHtml(post.title)} — 스웨디시 마사지" class="post-inline-img" loading="lazy" /></div>`;
      }
      return html;
    })
    .join("");
}

function renderBlogView() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("blog-view");
  if (!container || !id) {
    if (container)
      container.innerHTML =
        "<p class='board-empty'>글을 찾을 수 없습니다.</p>";
    return;
  }

  const posts = getBlogPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    container.innerHTML =
      "<p class='board-empty'>글을 찾을 수 없습니다.</p>";
    return;
  }

  const post = { ...posts[idx], views: (posts[idx].views || 0) + 1 };
  posts[idx] = post;
  saveBlogPosts(posts);

  document.title = `${post.title} | A1 Swedish — 스웨디시 마사지`;
  setPageMeta(post);

  container.innerHTML = `
    <article class="post-view" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="post-view-header">
        <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
        <div class="post-view-meta">
          <time datetime="${post.date}" itemprop="datePublished">${formatDate(post.date)}</time>
          <span itemprop="author">${escapeHtml(post.author)}</span>
          <span>조회 ${post.views}</span>
        </div>
      </header>
      <div class="post-img-wrap">
        <img src="${resolveImageUrl(post.image)}" alt="${escapeHtml(post.title)}" itemprop="image" class="post-hero-img" loading="lazy" />
      </div>
      <div class="post-view-body" itemprop="articleBody">${formatPostBody(post)}</div>
      <div class="post-actions">
        <a href="blog.html" class="btn btn-ghost">← 목록</a>
        <a href="blog-write.html" class="btn btn-outline btn-sm">새 글 작성</a>
      </div>
    </article>
  `;
}

function initBlogWriteForm() {
  const form = document.getElementById("blog-write-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const excerpt = form.excerpt.value.trim();
    const content = form.content.value.trim();
    const image = form.image.value.trim();
    const author = form.author.value.trim() || "A1 Swedish";

    if (!title || !content) {
      showToast("제목과 본문을 입력해 주세요.");
      return;
    }

    const posts = getBlogPosts();
    posts.unshift({
      id: generateId("b"),
      title,
      excerpt: excerpt || content.slice(0, 120) + "...",
      content,
      image:
        image ||
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      date: new Date().toISOString().slice(0, 10),
      author,
      views: 0,
    });
    saveBlogPosts(posts);
    showToast("블로그 글이 등록되었습니다.");
    setTimeout(() => {
      window.location.href = "blog.html";
    }, 600);
  });
}
