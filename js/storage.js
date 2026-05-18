const STORAGE_KEYS = {
  blog: "a1swedish_blog",
  board: "a1swedish_board",
};

const DATA_URLS = {
  blog: "data/blog.json",
  board: "data/board.json",
};

const BLOG_DATA_VERSION = "7";

function getDefaultBlog() {
  return typeof BLOG_POSTS !== "undefined" ? [...BLOG_POSTS] : [];
}

const SEED_BOARD = [
  {
    id: "p1",
    title: "예약 문의드립니다 (주말 오후 가능할까요?)",
    content:
      "안녕하세요. 이번 주 토요일 오후 3시 전후 90분 코스 예약 가능한지 문의드립니다.\n연락 부탁드립니다.",
    author: "김**",
    date: "2026-05-17",
    views: 12,
  },
  {
    id: "p2",
    title: "첫 방문 후기 — 정말 편안했어요",
    content:
      "어깨가 너무 뻐근해서 처음 방문했는데, 압도 적당하고 분위기도 조용해서 푹 쉬다 나왔습니다. 다음에 또 올게요!",
    author: "이**",
    date: "2026-05-14",
    views: 28,
  },
  {
    id: "p3",
    title: "커플 패키지 가격 문의",
    content: "두 분이 동시에 받을 수 있는 커플 룸이나 패키지가 있는지 궁금합니다.",
    author: "박**",
    date: "2026-05-08",
    views: 19,
  },
];

let _blogCache = [];
let _boardCache = [];
let _initPromise = null;

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 서버 JSON + 브라우저에만 있는 글을 합칩니다 */
function mergePosts(serverList, localList) {
  const map = new Map();
  (serverList || []).forEach((p) => map.set(p.id, p));
  (localList || []).forEach((p) => {
    if (!map.has(p.id)) map.set(p.id, p);
  });
  return Array.from(map.values());
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

async function initData() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (localStorage.getItem("a1swedish_blog_version") !== BLOG_DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.blog);
      localStorage.setItem("a1swedish_blog_version", BLOG_DATA_VERSION);
    }

    const [serverBlog, serverBoard] = await Promise.all([
      fetchJson(DATA_URLS.blog),
      fetchJson(DATA_URLS.board),
    ]);

    const baseBlog = serverBlog || getDefaultBlog();
    const baseBoard = serverBoard || SEED_BOARD;
    const localBlog = readLocal(STORAGE_KEYS.blog);
    const localBoard = readLocal(STORAGE_KEYS.board);

    _blogCache = mergePosts(baseBlog, localBlog);
    _boardCache = mergePosts(baseBoard, localBoard);

    saveList(STORAGE_KEYS.blog, _blogCache);
    saveList(STORAGE_KEYS.board, _boardCache);
  })();

  return _initPromise;
}

/** 페이지 렌더 전에 반드시 호출 */
function whenDataReady(callback) {
  const run = () => initData().then(callback);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

function getBlogPosts() {
  if (_blogCache.length) return [..._blogCache];
  return getDefaultBlog();
}

function getBoardPosts() {
  return _boardCache.length ? [..._boardCache] : [...SEED_BOARD];
}

function saveBlogPosts(list) {
  _blogCache = [...list];
  saveList(STORAGE_KEYS.blog, _blogCache);
}

function saveBoardPosts(list) {
  _boardCache = [...list];
  saveList(STORAGE_KEYS.board, _boardCache);
}

/** 서버 업로드용 JSON 파일 다운로드 */
function exportData(type) {
  const list = type === "blog" ? getBlogPosts() : getBoardPosts();
  const filename = type === "blog" ? "blog.json" : "board.json";
  const blob = new Blob([JSON.stringify(list, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(
    `${filename} 다운로드됨 → data 폴더에 넣고 서버에 올리세요.`
  );
}

/** JSON 파일에서 글 가져오기 */
function importData(type, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const list = JSON.parse(e.target.result);
      if (!Array.isArray(list)) throw new Error("invalid");
      if (type === "blog") saveBlogPosts(list);
      else saveBoardPosts(list);
      showToast("가져오기 완료. 목록 페이지에서 확인하세요.");
      setTimeout(() => {
        window.location.href = type === "blog" ? "blog.html" : "board.html";
      }, 800);
    } catch {
      showToast("JSON 형식이 올바르지 않습니다.");
    }
  };
  reader.readAsText(file, "UTF-8");
}

function generateId(prefix) {
  return `${prefix}${Date.now().toString(36)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isNewPost(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

function showToast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el = document.querySelector(".toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
