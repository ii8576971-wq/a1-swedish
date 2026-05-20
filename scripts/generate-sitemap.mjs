import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const BASE = "https://ii8576971-wq.github.io/a1-swedish";

function url(loc, { lastmod, changefreq, priority }) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority != null) xml += `    <priority>${priority}</priority>\n`;
  xml += `  </url>\n`;
  return xml;
}

function postPriority(post) {
  if (post.id?.startsWith("seoul-")) return 0.85;
  if (post.id?.startsWith("b")) return 0.75;
  if (post.id === "out-guide") return 0.8;
  return 0.7;
}

const blog = JSON.parse(
  fs.readFileSync(path.join(root, "data", "blog.json"), "utf8")
);
const board = JSON.parse(
  fs.readFileSync(path.join(root, "data", "board.json"), "utf8")
);

const today = new Date().toISOString().slice(0, 10);
const urls = [];

urls.push(
  url(`${BASE}/`, {
    lastmod: today,
    changefreq: "weekly",
    priority: 1.0,
  })
);
urls.push(
  url(`${BASE}/index.html`, {
    lastmod: today,
    changefreq: "weekly",
    priority: 1.0,
  })
);
urls.push(
  url(`${BASE}/blog.html`, {
    lastmod: blog[0]?.date || today,
    changefreq: "daily",
    priority: 0.95,
  })
);
urls.push(
  url(`${BASE}/board.html`, {
    lastmod: board[0]?.date || today,
    changefreq: "weekly",
    priority: 0.6,
  })
);

for (const post of blog) {
  const loc = `${BASE}/blog-view.html?id=${encodeURIComponent(post.id)}`;
  urls.push(
    url(loc, {
      lastmod: post.date || today,
      changefreq: "monthly",
      priority: postPriority(post),
    })
  );
}

for (const post of board) {
  urls.push(
    url(`${BASE}/board-view.html?id=${encodeURIComponent(post.id)}`, {
      lastmod: post.date || today,
      changefreq: "monthly",
      priority: 0.5,
    })
  );
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");

const robots = `User-agent: *
Allow: /

Disallow: /admin.html
Disallow: /blog-write.html
Disallow: /board-write.html

Sitemap: ${BASE}/sitemap.xml
`;

fs.writeFileSync(path.join(root, "robots.txt"), robots, "utf8");
console.log(`sitemap.xml: ${urls.length} URLs`);
console.log(`robots.txt written`);
