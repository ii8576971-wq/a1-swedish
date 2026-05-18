import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const SITE = "https://kyungrock.github.io/a1-soul-outcall/";
const LINK = `[서울출장마사지 20·30대 힐링 출장](${SITE})`;
const blogPath = path.join(root, "data", "blog.json");
const imgDir = path.join(root, "images", "blog");

function loadShops() {
  const raw = fs
    .readFileSync(
      path.join(root, "중요한정보", "shops-outcall-matched.json"),
      "utf8"
    )
    .replace(/^window\.shopsDataOutcallMatched\s*=\s*/, "")
    .replace(/;\s*$/, "");
  return JSON.parse(raw).shops.filter((s) => s.region === "서울");
}

function swedishCourses(shop) {
  return (shop.courses || []).filter((c) => /스웨디시/i.test(c.category));
}

function courseText(shop) {
  const cats = swedishCourses(shop);
  if (!cats.length) {
    const oil = (shop.courses || []).find((c) => /오일|아로마|힐링/i.test(c.category));
    if (oil)
      return (oil.items || [])
        .slice(0, 3)
        .map((i) => `· ${i.name}: ${i.price} / ${i.duration}`)
        .join("\n");
    return "· 상담 시 스웨디시·오일·스포츠 라인 안내";
  }
  return cats
    .map((cat) => {
      const items = (cat.items || [])
        .slice(0, 4)
        .map((i) => `· ${cat.category} ${i.name}: ${i.price} / ${i.duration}`)
        .join("\n");
      return items;
    })
    .join("\n");
}

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 4000) {
      resolve(true);
      return;
    }
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          download(res.headers.location, dest).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch (_) {}
          resolve(false);
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      })
      .on("error", () => resolve(false));
  });
}

const TOPIC_POSTS = [
  {
    id: "seoul-main",
    slug: "seoul-outcall-massage-guide-2026",
    title: "서울출장마사지 완벽 가이드 — 20·30대 힐링 홈타이 2026",
    excerpt:
      "서울출장마사지란? 강남·전지역 홈타이, 스웨디시 코스, 가격·24시간 체크리스트. 등록 업체는 공식 안내 사이트에서 확인하세요.",
    content: `서울출장마사지는 관리사가 고객이 지정한 **자택·호텔·오피스텔**로 방문해 마사지를 받는 **홈타이·출장** 형태입니다. 퇴근 후 이동 없이 몸을 풀 수 있어, 장시간 앉아 있는 직장인·출장객에게 선택되는 경우가 많습니다.

【서울출장마사지가 인기 있는 이유】
· **이동 부담 최소** — 외근·회식 후 바로 진행 가능
· **익숙한 공간** — 호텔·집에서 긴장이 빨리 풀리는 경우가 많음
· **24시간 상담** — 야근·심야 일정에 맞춘 업체 다수
· **코스 다양** — 스포츠, 오일, 스웨디시, VVIP 등 단계 선택

【서울출장마사지 프로그램 종류】
· **스포츠·딥티슈** — 어깨·허리 등 뭉친 근육 위주
· **오일·아로마** — 부드러운 이완, 향 테라피
· **스웨디시·감성힐링** — 롱 스트로크 중심 전신 이완 (가장 많이 문의)
· **VVIP·믹스** — 장시간·복합 코스

【가격 가이드 (수도권 일반)】
· 60분: 6만~10만 원대
· 90분: 9만~13만 원대
· 120분 이상: 깊은 이완·수면 전 루틴에 유리
※ 업체·코스마다 다르며, **출장비 무료** 여부는 반드시 확인하세요.

【지역별 이용 팁】
· **강남·서초·송파** — 일정이 촘촘한 만큼 넉넉한 시간 예약 권장
· **마포·영등포** — 호텔·오피스텔, 역세권 주소를 구체적으로 전달
· **종로·중구** — 행사·교통 체증 시간대는 여유 있게

【공식 업체·지역 안내】
서울·경기·인천 전지역 등록 업체 카드, 구별별 메뉴, 오늘의 글은 아래 사이트에서 한눈에 볼 수 있습니다.

👉 ${LINK}

【예약 전 체크리스트】
1. 희망 일시·대략 주소(동·역 이름)
2. 코스명(스웨디시/오일/스포츠)
3. 60·90·120분 중 선택
4. 출장비·현금 할인·회원 할인
5. 건강 이력·임신·통증 부위 사전 고지

【주의사항】
서울출장마사지는 **웰니스·이완** 목적이며 의료 행위가 아닙니다. 심한 통증·질환 의심 시에는 병원 진료를 우선하세요. 과음 직후·공복 극단 상태는 시술을 피하는 것이 좋습니다.

A1 Swedish 블로그에서는 아래에서 **업체별 서울출장마사지** 코스·가격·추천 대상을 개별 정리해 두었습니다.`,
    imageKey: "seoul-main",
  },
  {
    id: "seoul-gangnam",
    slug: "seoul-outcall-massage-gangnam",
    title: "서울출장마사지 강남·서초 — 호텔·오피스텔 이용 팁",
    excerpt:
      "강남·서초·송파에서 서울출장마사지 받을 때 예약·주소·시간대만 알면 되는 실전 가이드.",
    content: `강남·서초·송파는 서울출장마사지 문의가 가장 많은 **남부 비즈니스·주거 밀집권**입니다. 호텔·오피스텔·고층 주택이 많아 홈타이 수요가 높습니다.

【강남권 서울출장마사지 특징】
· 저녁 8~11시, 주말 오후 **예약 밀도**가 높음
· 역세권보다 **도로명·동·호수**까지 정확히 전달할수록 방문이 빠름
· 호텔 투숙 시 **층·호실·주차·엘리베이터** 정보를 미리 공유

【추천 코스】
· 회식·미팅 후: **90분 스웨디시** 또는 오일 이완
· 운동 다음 날: **스포츠 60분 + 스웨디시 60분** 믹스
· 수면 전: **120분 저자극 스웨디시**

【업체 확인】
강남·서초 포함 서울 전지역 방문 업체는 ${LINK} 카드 목록에서 비교해 보세요.

【실전 팁】
· "강남역 근처"보다 **구체 주소**가 정확합니다
· 소음·조명은 커튼·조도 조절로 이완도가 올라갑니다
· 시술 2시간 전 가벼운 식사, 카페인·주류는 줄이세요`,
    imageKey: "seoul-gangnam",
  },
  {
    id: "seoul-swedish",
    slug: "seoul-outcall-massage-swedish-course",
    title: "서울출장마사지 스웨디시 코스 — 감성힐링·VIP 차이",
    excerpt:
      "서울출장마사지에서 '스웨디시' 이름만 같은 코스의 차이. 감성힐링, 한국인 스웨디시, VIP 라인 비교.",
    content: `서울출장마사지 업체마다 **스웨디시**라는 이름 아래 코스 구성이 다릅니다. 가격·시간·관리사 라인을 구분하면 실망 없이 선택할 수 있습니다.

【흔한 스웨디시 코스명】
· **감성힐링 스웨디시** — 90분 11만 전후, 부드러운 전신 이완
· **한국인 스웨디시** — 한국인 관리사 전용, 14~18만 원대
· **VIP·VVIP 스웨디시** — 프리미엄 라인, 13~17만 원(60·90분)
· **센슈얼 스웨디시** — 감성+오일 테크닉 혼합, 8~10만 원대

【첫 이용 추천】
1. **60~90분 감성힐링 스웨디시**로 몸 반응 확인
2. 압·향·오일 불편 시 즉시 말하기
3. 만족 시 **120분** 또는 한국인/VIP 라인 업그레이드

【어디서 비교하나】
${LINK}에서 업체별 스웨디시·오일·스포츠 태그를 확인하고, 전화 상담으로 당일 스케줄을 맞추세요.

【스웨디시 vs 스포츠】
· **뭉친 어깨·허리** → 스포츠 먼저, 마무리 스웨디시
· **전신 피로·수면** → 스웨디시 단독이 무난`,
    imageKey: "seoul-swedish",
  },
  {
    id: "seoul-24h",
    slug: "seoul-outcall-massage-24hours",
    title: "서울출장마사지 24시간 — 야근·심야 이용 가이드",
    excerpt:
      "서울출장마사지 24시간 업체 이용 시 전화 OFF 시간, 코스 선택, 안전·준비물까지 정리.",
    content: `서울출장마사지 중 상당수가 **24시간 상담**을 표기합니다. 야근·국제 전화·새벽 귀가 후 이용하는 분들이 많습니다.

【24시간의 의미】
· **전화 연결 가능 시간**이지, 모든 시간대 즉시 방문을 뜻하지는 않습니다
· "폰 OFF = 마감·랜덤 휴무"인 업체가 많으니 **2~3곳 번호**를 저장해 두세요

【심야 이용 팁】
· 주소·호실·엘리베이터를 **문자로 한 번 더** 확인
· 이웃 민원 방지를 위해 **조도·음량** 조율
· 90분 코스면 종료 시각을 미리 계산 (수면 계획과 겹치지 않게)

【추천 코스】
심야에는 자극 과한 스포츠보다 **스웨디시·오일 이완**이 수면 전환에 유리한 경우가 많습니다.

【업체 목록】
24시간 표기 업체는 ${LINK}에서 "24시간" 운영 시간으로 필터링해 비교할 수 있습니다.`,
    imageKey: "seoul-24h",
  },
  {
    id: "seoul-price",
    slug: "seoul-outcall-massage-price-compare",
    title: "서울출장마사지 가격 비교 — 6만~16만 원 코스 나누기",
    excerpt:
      "서울출장마사지 60·90·120분, 스포츠·스웨디시·VVIP 가격대를 한눈에. 출장비·할인 체크 포인트.",
    content: `서울출장마사지 가격은 **코스 종류·시간·관리사 라인**에 따라 크게 갈립니다. 아래는 수도권에서 자주 보이는 **현금가 기준 예시**입니다.

【입문 6~8만 원대】
· 건식·짧은 타이, 일부 센슈얼 스웨디시 60분
· **T팬티 콜걸** 센슈얼 스웨디시, **재팬혼혈** 타이 40~60분

【표준 9~11만 원대】
· **감성힐링 스웨디시** 60~90분
· **20대 인스타이쁜이·한국 20대 이쁜이** 스웨디시 A·B코스

【프리미엄 13~17만 원+】
· **VIP 스웨디시** 전문 (**VVIP 20대 여신**)
· 한국인 스웨디시 VVIP, 120~150분 믹스

【숨은 비용 체크】
· 출장비 무료 여부
· 현금 vs 카드, 회원·재방문 할인
· 주차·대기 비용 (호텔 valet 등)

【실시간 비교】
가격·코스는 ${LINK} 각 업체 카드에서 확인하고, **2곳 이상** 통화 비교를 권장합니다.`,
    imageKey: "seoul-price",
  },
];

const SHOP_SEO = {
  seoul_instapretty_001: {
    title: "서울출장마사지 20대 인스타이쁜이 — 감성힐링 스웨디시 9만~",
    hook: "수도권 24시간 홈타이에서 감성힐링·한국인 스웨디시를 분리 운영하는 대표 업체입니다.",
    good: "퇴근 후 집·호텔에서 90~120분 스웨디시를 받고 싶은 분",
    tip: "믹스 코스(스포츠+힐링)는 결림+이완을 한 번에 잡고 싶을 때 추천",
  },
  seoul_korean_pretty_001: {
    title: "서울출장마사지 한국 20대 이쁜이 — 한국인 관리사 코스",
    hook: "한국인 20대 관리사 중심, 스웨디시·오일·VVIP가 체계적으로 나뉜 서울출장마사지 업체입니다.",
    good: "한국어 소통이 편하고 20대 관리사를 선호하는 분",
    tip: "한국인 스웨디시 VVIP는 감성힐링보다 압·구성이 한 단계 업그레이드",
  },
  seoul_24hour_korean_japanese_001: {
    title: "서울출장마사지 24시 한국일본혼혈 — 새벽 홈타이",
    hook: "24시간 운영과 한·일 혼혈 라인이 강점인 서울출장마사지입니다.",
    good: "야근·심야 일정, 호텔 체류 중 갑작스런 피로 회복",
    tip: "심야 예약 전 통화 연결 여부를 반드시 확인",
  },
  seoul_vvip_goddess_korean_001: {
    title: "서울출장마사지 VVIP 20대 여신 — VIP 스웨디시 전문",
    hook: "다른 종목 없이 VIP 스웨디시만 운영하는 서울출장마사지 전문 샵입니다.",
    good: "군더더기 없이 스웨디시 60·90분만 원하는 분",
    tip: "60분 13만·90분 17만 원대 — 스웨디시만 받는 명확함이 장점",
  },
  seoul_tpanty_callgirl_001: {
    title: "서울출장마사지 T팬티 콜걸 — 센슈얼 스웨디시 8만~",
    hook: "센슈얼 스웨디시 60분 8만 원대부터, 서울출장마사지 입문에 부담이 적습니다.",
    good: "가성비·센슈얼 테라피를 처음 경험하는 분",
    tip: "예선전(건식) vs 본선전(센슈얼 스웨디시) 목적에 맞게 선택",
  },
  seoul_ukraine_001: {
    title: "서울출장마사지 우크라이나출장 — 유럽 라인 홈타이",
    hook: "우크라이나 출장 라인으로 차별화된 수도권 서울출장마사지입니다.",
    good: "기존 한국인 샵과 다른 스타일을 원하는 분",
    tip: "한국인 스웨디시 코스는 상담 시 별도 요청",
  },
  seoul_tokyo_hot_001: {
    title: "서울출장마사지 도쿄핫 — 짜릿 스웨디시·365일",
    hook: "'짜릿 스웨디시'와 동남아 혼혈 20대 라인이 특징인 서울출장마사지입니다.",
    good: "365일 연중무휴, 개성 있는 테마 코스 선호",
    tip: "짜릿 스웨디시 60분 8만·90분 10만 — VIP로 단계 업그레이드 가능",
  },
  seoul_wonjeong_001: {
    title: "서울출장마사지 원정녀 — 힙업·오일 힐링 출장",
    hook: "원정녀 컨셉 홈타이, 끈적 오일·힙업 힐링이 강점입니다.",
    good: "오일+스웨디시 성격의 전신 이완을 원하는 분",
    tip: "VVIP 원정 풀 150분 — 하루 종일 피로에 추천",
  },
  seoul_japan_mixed_001: {
    title: "서울출장마사지 재팬혼혈출장 — 5만 원대 입문",
    hook: "수도권 서울출장마사지 중 가성비. 힐링&스웨디시 60분 8만 원.",
    good: "첫 서울출장마사지, 재팬 혼혈 관리사 경험",
    tip: "타이 40분 5만 원은 짧은 틈새용, 스웨디시는 60분 이상",
  },
};

function buildShopPost(shop, i) {
  const meta = SHOP_SEO[shop.id] || {
    title: `서울출장마사지 ${shop.name} — 코스·가격 안내`,
    hook: shop.description?.slice(0, 80) || "",
    good: "서울 전지역 홈타이 이용자",
    tip: "예약 시 코스·시간을 명확히",
  };
  const hasSw = swedishCourses(shop).length > 0;
  const content = `${meta.hook}

【${shop.name} 요약】
· 키워드: **서울출장마사지** · ${shop.district}
· 가격: ${shop.price} · 운영: ${shop.operatingHours}
· 서비스: ${(shop.services || []).slice(0, 5).join(", ")}

【스웨디시·힐링 코스】
${courseText(shop)}

【이런 분께】
${meta.good}

【이용 팁】
${meta.tip}
· 시술 2시간 전 가벼운 식사, 과음·공복 극단은 피하기
· 압·향·부위 불편 시 즉시 말씀

【공식 안내·상세】
업체 카드·전화·구별 메뉴는 서울출장마사지 공식 안내 페이지에서 확인하세요.

👉 ${LINK}

※ 코스·가격은 업체 정책에 따라 변동될 수 있습니다.`;

  return {
    id: `seoul-${shop.id}`,
    slug: `seoul-outcall-${shop.id.replace(/_/g, "-")}`,
    shopId: shop.id,
    title: meta.title,
    excerpt: `서울출장마사지 ${shop.name} — ${hasSw ? "스웨디시" : "힐링"} 코스·가격·예약 팁. ${shop.price}부터. 공식 안내 링크 포함.`,
    content,
    image: `images/blog/${shop.id}-hero.jpg`,
    image2: `images/blog/${shop.id}-inline.jpg`,
    date: `2026-05-${String(17 - (i % 10)).padStart(2, "0")}`,
    author: "A1 Swedish",
    views: 95 + i * 11,
    siteUrl: SITE,
  };
}

async function main() {
  fs.mkdirSync(imgDir, { recursive: true });
  const shops = loadShops();
  const seoulPosts = [
    ...TOPIC_POSTS.map((p, i) => ({
      ...p,
      shopId: null,
      image: `images/blog/${p.imageKey}-hero.jpg`,
      image2: `images/blog/${p.imageKey}-inline.jpg`,
      date: "2026-05-18",
      author: "A1 Swedish",
      views: 400 - i * 20,
      siteUrl: SITE,
    })),
    ...shops.map((s, i) => buildShopPost(s, i)),
  ];

  for (const post of seoulPosts) {
    const id = post.imageKey || post.shopId || post.id;
    const s1 = encodeURIComponent(`seoul-${id}-a`);
    const s2 = encodeURIComponent(`seoul-${id}-b`);
    await download(
      `https://picsum.photos/seed/${s1}/1200/800.jpg`,
      path.join(root, post.image)
    );
    await download(
      `https://picsum.photos/seed/${s2}/1200/800.jpg`,
      path.join(root, post.image2)
    );
  }

  const existing = JSON.parse(fs.readFileSync(blogPath, "utf8"));
  const nonSeoul = existing.filter((p) => !p.id?.startsWith("seoul-"));
  const merged = [...seoulPosts, ...nonSeoul];

  fs.writeFileSync(blogPath, JSON.stringify(merged, null, 2), "utf8");
  fs.writeFileSync(
    path.join(root, "js", "blog-data.js"),
    `/** 블로그 — 서울출장마사지 + 기존 글 */\nconst BLOG_POSTS = ${JSON.stringify(merged, null, 2)}\n`,
    "utf8"
  );
  console.log(`Seoul posts: ${seoulPosts.length}, total: ${merged.length}`);
}

main().catch(console.error);
