const BOARD_PAGE_SIZE = 10;

function renderBoardList() {
  const tbody = document.getElementById("board-tbody");
  const pagination = document.getElementById("board-pagination");
  const searchInput = document.getElementById("board-search");
  if (!tbody) return;

  let posts = getBoardPosts().sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const query = (searchInput?.value || "").trim().toLowerCase();
  if (query) {
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
    );
  }

  const page = Math.max(
    1,
    parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10)
  );
  const totalPages = Math.max(1, Math.ceil(posts.length / BOARD_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * BOARD_PAGE_SIZE;
  const pagePosts = posts.slice(start, start + BOARD_PAGE_SIZE);

  if (!pagePosts.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="board-empty">게시글이 없습니다.</td></tr>`;
  } else {
    tbody.innerHTML = pagePosts
      .map((p, i) => {
        const num = posts.length - start - i;
        const newBadge = isNewPost(p.date)
          ? '<span class="badge-new">NEW</span>'
          : "";
        return `
        <tr data-id="${p.id}">
          <td class="col-num">${num}</td>
          <td class="title-cell">${escapeHtml(p.title)}${newBadge}</td>
          <td>${escapeHtml(p.author)}</td>
          <td class="col-date">${p.date}</td>
          <td class="col-views">${p.views || 0}</td>
        </tr>
      `;
      })
      .join("");

    tbody.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", () => {
        window.location.href = `board-view.html?id=${row.dataset.id}`;
      });
    });
  }

  if (pagination) {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", i);
        window.location.href = url.toString();
      });
      pagination.appendChild(btn);
    }
  }
}

function initBoardSearch() {
  const input = document.getElementById("board-search");
  const btn = document.getElementById("board-search-btn");
  if (!input) return;

  const run = () => renderBoardList();
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });
  btn?.addEventListener("click", run);
}

function renderBoardView() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("board-view");
  if (!container || !id) {
    if (container)
      container.innerHTML =
        "<p class='board-empty'>게시글을 찾을 수 없습니다.</p>";
    return;
  }

  const posts = getBoardPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    container.innerHTML =
      "<p class='board-empty'>게시글을 찾을 수 없습니다.</p>";
    return;
  }

  const post = { ...posts[idx], views: (posts[idx].views || 0) + 1 };
  posts[idx] = post;
  saveBoardPosts(posts);

  document.title = `${post.title} | A1 Swedish`;

  container.innerHTML = `
    <article class="post-view">
      <header class="post-view-header">
        <h1>${escapeHtml(post.title)}</h1>
        <div class="post-view-meta">
          <span>${escapeHtml(post.author)}</span>
          <span>${formatDate(post.date)}</span>
          <span>조회 ${post.views}</span>
        </div>
      </header>
      <div class="post-view-body">${escapeHtml(post.content)}</div>
      <div class="post-actions">
        <a href="board.html" class="btn btn-ghost">← 목록</a>
        <a href="board-write.html" class="btn btn-primary btn-sm">글쓰기</a>
      </div>
    </article>
  `;
}

function initBoardWriteForm() {
  const form = document.getElementById("board-write-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const content = form.content.value.trim();
    const author = form.author.value.trim() || "익명";

    if (!title || !content) {
      showToast("제목과 내용을 입력해 주세요.");
      return;
    }

    const posts = getBoardPosts();
    posts.unshift({
      id: generateId("p"),
      title,
      content,
      author,
      date: new Date().toISOString().slice(0, 10),
      views: 0,
    });
    saveBoardPosts(posts);
    showToast("게시글이 등록되었습니다.");
    setTimeout(() => {
      window.location.href = "board.html";
    }, 600);
  });
}

function renderHomeBoardPreview(containerId, limit = 5) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const posts = getBoardPosts()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  el.innerHTML = posts
    .map(
      (p, i) => `
    <tr data-id="${p.id}" style="cursor:pointer">
      <td class="col-num">${posts.length - i}</td>
      <td class="title-cell">${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.author)}</td>
      <td class="col-date">${p.date}</td>
    </tr>
  `
    )
    .join("");

  el.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", () => {
      window.location.href = `board-view.html?id=${row.dataset.id}`;
    });
  });
}
