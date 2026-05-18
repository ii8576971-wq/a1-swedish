document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  highlightActiveNav();
});

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-main");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.setAttribute(
      "aria-expanded",
      nav.classList.contains("open") ? "true" : "false"
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

function highlightActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-main a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

function renderHeader(activePage) {
  const pages = {
    home: "index.html",
    blog: "blog.html",
    board: "board.html",
  };
  return `
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="logo">A1 <span>Swedish</span></a>
        <button class="nav-toggle" aria-label="메뉴 열기" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav>
          <ul class="nav-main">
            <li><a href="index.html" class="${activePage === "home" ? "active" : ""}">홈</a></li>
            <li><a href="index.html#services">서비스</a></li>
            <li><a href="blog.html" class="${activePage === "blog" ? "active" : ""}">블로그</a></li>
            <li><a href="board.html" class="${activePage === "board" ? "active" : ""}">게시판</a></li>
            <li><a href="index.html#contact">문의</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">A1 <span>Swedish</span></div>
            <p>몸과 마음을 깊이 이완시키는 프리미엄 스웨디시 마사지.<br>블로그와 게시판으로 소식을 나눕니다.</p>
          </div>
          <div class="footer-col">
            <h4>바로가기</h4>
            <ul>
              <li><a href="blog.html">블로그</a></li>
              <li><a href="blog-write.html">글쓰기</a></li>
              <li><a href="board.html">게시판</a></li>
              <li><a href="board-write.html">게시글 작성</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>문의</h4>
            <ul>
              <li>운영시간 10:00 – 22:00</li>
              <li>전화 02-0000-0000</li>
              <li>카카오 @a1swedish</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 A1 Swedish. All rights reserved.</span>
          <span>Swedish Massage & Wellness Blog</span>
        </div>
      </div>
    </footer>
  `;
}
