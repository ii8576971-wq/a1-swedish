import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const shopsPath = path.join(root, "중요한정보", "shops-outcall-matched.json");
const blogPath = path.join(root, "data", "blog.json");
const imgDir = path.join(root, "images", "shops");

function loadShops() {
  let raw = fs.readFileSync(shopsPath, "utf8");
  raw = raw.replace(/^window\.shopsDataOutcallMatched\s*=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(raw).shops;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "shop";
}

function getSwedishCourses(shop) {
  const sw = (shop.courses || []).filter((c) => /스웨디시/i.test(c.category));
  if (sw.length) return sw;
  const oil = (shop.courses || []).filter((c) =>
    /오일|아로마|힐링/i.test(c.category)
  );
  return oil.slice(0, 1);
}

function formatCourseBlock(courses) {
  if (!courses.length)
    return "스웨디시·오일 기반 출장 테라피 코스를 상담 시 안내받을 수 있습니다.";
  return courses
    .map((cat) => {
      const lines = (cat.items || [])
        .slice(0, 4)
        .map(
          (i) =>
            `· ${cat.category} ${i.name}: ${i.price} / ${i.duration} (${i.description || cat.category})`
        )
        .join("\n");
      return `【${cat.category}】\n${lines}`;
    })
    .join("\n\n");
}

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
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
          resolve(fs.existsSync(dest) && fs.statSync(dest).size > 3000);
        });
      })
      .on("error", () => {
        try {
          file.close();
          fs.unlinkSync(dest);
        } catch (_) {}
        resolve(false);
      });
  });
}

const ANGLES = {
  seoul_instapretty_001: {
    title: "20대 인스타이쁜이 스웨디시 출장 — 수도권 감성힐링 홈타이",
    angle:
      "수도권 24시간 홈타이에서 '감성힐링 스웨디시'와 한국인 스웨디시 라인을 분리 운영하는 점이 특징입니다.",
    goodFor:
      "퇴근 후 집·호텔에서 부드러운 스웨디시를 받고 싶은 분, 90~120분 코스로 충분한 이완을 원하는 분",
    tip: "믹스 코스(스포츠+힐링)는 근육 결림과 이완을 동시에 잡고 싶을 때 실속 있습니다.",
  },
  seoul_korean_pretty_001: {
    title: "한국 20대 이쁜이 — 한국인 관리사 스웨디시 출장 후기 가이드",
    angle: "한국인 20대 관리사 중심의 출장샵으로, 스웨디시·오일·VVIP 라인이 체계적으로 나뉩니다.",
    goodFor: "한국어 소통이 편하고, 관리사 연령대를 중시하는 수도권 직장인",
    tip: "한국인 스웨디시 VVIP 라인은 일반 감성힐링보다 압과 코스 구성이 한 단계 업그레이드됩니다.",
  },
  seoul_24hour_korean_japanese_001: {
    title: "24시 한국일본혼혈 — 새벽에도 가능한 스웨디시 출장",
    angle: "24시간 운영과 한·일 혼혈 관리사 라인이 강점. 야근·심야 숙소에서 마사지가 필요할 때 선택지가 넓습니다.",
    goodFor: "야간 근무자, 공항·호텔 체류객, 일정이 불규칙한 분",
    tip: "심야 예약 전 폰 응대 여부를 확인하세요. '폰 OFF' 시간대는 랜덤 휴무일 수 있습니다.",
  },
  seoul_vvip_goddess_korean_001: {
    title: "VVIP 20대 여신 한국인홈케어 — 프리미엄 VIP 스웨디시만 집중",
    angle: "다른 종목 없이 VIP 스웨디시만 운영하는 '스웨디시 전문' 출장샵입니다. 선택 피로가 적습니다.",
    goodFor: "군더더기 없이 스웨디시 60·90분만 받고 싶은 분, 전원 한국인 20대 관리사 선호",
    tip: "60분 13만·90분 17만 원대 — 가격 대비 '스웨디시만' 받는 명확함이 장점입니다.",
  },
  seoul_tpanty_callgirl_001: {
    title: "T팬티 콜걸 센슈얼 스웨디시 — 입문용 출장 가격대",
    angle: "센슈얼 스웨디시 60분 8만 원대부터 시작. 출장 스웨디시를 처음 경험해 보기에 부담이 적은 편입니다.",
    goodFor: "가성비 중시, 센슈얼·감성 테라피를 선호하는 20~30대",
    tip: "예선전(건식)과 본선전(센슈얼 스웨디시) 중 목적에 맞게 고르세요. 건식은 뭉친 근육, 스웨디시는 이완에 맞습니다.",
  },
  seoul_ukraine_001: {
    title: "우크라이나출장 스웨디시 — 수도권 유럽 라인 홈타이",
    angle: "우크라이나 출장 라인으로 차별화된 수도권 홈타이. 감성힐링·한국인 스웨디시·믹스 코스까지 폭넓습니다.",
    goodFor: "기존 한국인 샵과 다른 스타일을 경험하고 싶은 분",
    tip: "한국인 스웨디시 코스는 소통과 기법 스타일이 유럽 라인과 다르니 상담 시 명확히 요청하세요.",
  },
  seoul_tokyo_hot_001: {
    title: "도쿄핫 짜릿 스웨디시 — 동남아 혼혈 관리사 출장",
    angle: "'짜릿 스웨디시' 네이밍처럼 자극과 이완을 동시에 노린 프로그램. 동남아 혼혈 20대 관리사가 특징입니다.",
    goodFor: "개성 있는 테마 코스를 선호하는 분, 365일 연중무휴 이용",
    tip: "짜릿 스웨디시 60분 8만·90분 10만 원 — 도쿄핫 VIP·VVIP로 단계별 업그레이드 가능합니다.",
  },
  seoul_wonjeong_001: {
    title: "원정녀 출장마사지 — 힙업·오일·스웨디시 믹스 코스",
    angle: "원정녀 컨셉의 홈타이로 끈적 오일·힙업 힐링 등 바디 라인 케어가 강점입니다.",
    goodFor: "오일 마사지와 스웨디시 성격의 이완을 함께 원하는 분",
    tip: "VVIP 원정 풀 코스는 150분 장시간 — 하루 종일 피로가 심한 날 추천합니다.",
  },
  seoul_japan_mixed_001: {
    title: "재팬혼혈출장 힐링&스웨디시 — 5만 원대부터 입문",
    angle: "수도권 출장샵 중 가성비 라인. 힐링&스웨디시 60분 8만·90분 11만 원으로 스웨디시 입문에 적합합니다.",
    goodFor: "첫 출장마사지, 재팬 혼혈 관리사 스타일을 경험하고 싶은 분",
    tip: "타이 40분 5만 원 코스는 짧은 틈새 시간용, 스웨디시는 최소 60분 이상 권장합니다.",
  },
  daegu_top_homethai_001: {
    title: "대구 TOP홈타이 — 지방 출장 타이·아로마·스웨디시 성격",
    angle: "대구·경북권 홈타이. 태국식 타이와 아로마가 주력이며, 오일 테크닉은 스웨디시와 유사한 이완을 줍니다.",
    goodFor: "대구 전지역·경산 등 인근, 저녁~새벽 시간대 이용",
    tip: "대구 외 지역은 출장비가 추가될 수 있으니 예약 시 반드시 확인하세요.",
  },
  pohang_homethai_001: {
    title: "포항홈타이 스웨디시 출장 — 경북 포항 전지역",
    angle: "포항에서 명시적으로 '스웨디시' 카테고리를 운영. 60분 10만·90분 12만 원.",
    goodFor: "포항 출장·거주자, 자격증 보유 관리사 20~30대 라인 선호",
    tip: "타이·아로마보다 부드러운 이완을 원하면 스웨디시 카테고리를 직접 지정하세요.",
  },
  daegu_female_student_korean_visit_001: {
    title: "20대 여대생 한국출장 — 대구·수도권 VIP 힐링·스웨디시",
    angle: "20대 여대생 컨셉의 한국 출장 라인. VIP 힐링 서비스가 스웨디시 성격의 프리미엄 코스입니다.",
    goodFor: "한국인 20대 관리사, 프라이빗한 호텔·자택 이용",
    tip: "VIP 힐링+림프 코스는 순환·부종 케어까지 원할 때 선택합니다.",
  },
  pohang_oneshop_homethai_001: {
    title: "1인샵홈타이 포항 — 소규모 출장 스웨디시·아로마",
    angle: "1인샵 형태의 포항 홈타이. 소수 정예 관리로 예약 대기가 있을 수 있으나 만족도가 높은 편입니다.",
    goodFor: "포항 북구·남구 등 전지역, 아늑한 1:1 케어 선호",
    tip: "리뷰에 언급된 관리사 지명 예약이 가능한지 문의해 보세요.",
  },
  gyeongju_duson_homethai_001: {
    title: "경주 두손 홈타이 — 관광객·출장객 스웨디시·타이",
    angle: "경주 지역 홈타이. 관광 피로 회복용 타이·아로마·출장 마사지를 제공합니다.",
    goodFor: "경주 여행·출장 후 숙소에서 피로 회복",
    tip: "경주 전역 출장이 가능한지, 관광 성수기 예약 대기를 미리 확인하세요.",
  },
  gyeongnam_chokchok_homethai_001: {
    title: "촉촉홈타이 경남 — 창원·진주 권 스웨디시 출장",
    angle: "경남 지역 '촉촉' 컨셉 홈타이. 오일·힐링 중심으로 스웨디시와 유사한 촉촉한 테크닉이 특징입니다.",
    goodFor: "경남 서부·중부 거주자, 피부·이완 동시 케어",
    tip: "지역별 출장 가능 범위와 야간 운영 시간을 예약 전 확인하세요.",
  },
  daegu_visit_blanc_homethai_001: {
    title: "블랑홈타이 대구 — 태국 관리사 감성 타이·아로마 출장",
    angle: "대구 출장 전문, 전원 태국 관리사. 타이+아로마 조합은 스웨디시만큼 깊은 이완을 주는 경우가 많습니다.",
    goodFor: "대구 심야~새벽 이용, 태국식 정통 마사지 선호",
    tip: "365일 연중무휴이나 오후 6시~새벽 5시 운영 — 낮 시간 예약은 불가할 수 있습니다.",
  },
};

function buildShopPost(shop, index) {
  const swCourses = getSwedishCourses(shop);
  const hasSwedish = (shop.courses || []).some((c) => /스웨디시/i.test(c.category));
  const meta = ANGLES[shop.id] || {
    title: `${shop.name} ${shop.region} 스웨디시 출장마사지`,
    angle: shop.description?.slice(0, 100) || "",
    goodFor: `${shop.region} ${shop.district} 거주·출장자`,
    tip: "예약 시 코스·시간·출장비를 문자로 확인하세요.",
  };

  const slug = `outcall-${shop.id.replace(/_/g, "-")}`;
  const courseText = formatCourseBlock(swCourses);
  const features = (shop.features || []).slice(0, 4).join(", ") || "출장마사지, 홈타이";
  const lowest = shop.price || "상담";
  const hours = shop.operatingHours || "문의";

  const content = `${meta.angle}

【${shop.name} 한눈에 보기】
· 지역: ${shop.region} ${shop.district}
· 유형: ${shop.type} (홈타이·출장)
· 가격: ${lowest}부터
· 운영: ${hours}
· 평점: ${shop.rating || "-"} (${shop.reviewCount || 0}건)
${hasSwedish ? "· 스웨디시 전용 코스 운영 ✓" : "· 오일·힐링 코스 (스웨디시 성격 테라피)"}

【스웨디시·힐링 코스】
${courseText}

【이런 분께 좋습니다】
${meta.goodFor}

【예약·이용 팁】
${meta.tip}
· 장소: ${shop.detailAddress || shop.address}
· 전화 예약 후 희망 코스(스웨디시/오일/타이)와 시간을 명확히 말씀하세요.
· 출장비 무료 여부, 현금 할인 여부를 미리 확인하세요.
· 시술 2시간 전 가벼운 식사, 술·카페인은 줄이면 이완 효과가 좋습니다.

【다른 출장샵과 비교할 때】
스웨디시 출장은 '압의 세기', '오일 사용', '관리사 스타일' 차이가 큽니다. ${shop.name}은 ${features} 등을 내세웁니다. 본인에게 중요한 항목—24시간, 한국인 관리사, 가격, 코스 다양성—을 기준으로 2~3곳 상담 후 결정하는 것을 권장합니다.

※ 본 글은 공개된 코스·가격 정보를 바탕으로 한 안내이며, 실제 운영은 업체 정책에 따라 달라질 수 있습니다.`;

  const day = 17 - Math.floor(index / 2);
  const month = index % 2 === 0 ? "2026-05" : "2026-04";
  const date = `${month}-${String(Math.max(1, day)).padStart(2, "0")}`;

  return {
    id: `out-${shop.id}`,
    slug,
    shopId: shop.id,
    title: meta.title,
    excerpt: `${shop.region} ${shop.name} — ${hasSwedish ? "스웨디시" : "오일·힐링"} 출장마사지 코스·가격·이용 팁을 정리했습니다. ${lowest}부터.`,
    content,
    image: `images/shops/${shop.id}.jpg`,
    image2: `images/shops/${shop.id}-2.jpg`,
    date,
    author: "A1 Swedish",
    views: 80 + index * 7,
  };
}

function buildGuidePost() {
  return {
    id: "out-guide",
    slug: "swedish-outcall-massage-guide-2026",
    shopId: null,
    title: "스웨디시 출장마사지 고르는 법 — 수도권·지방 홈타이 2026",
    excerpt:
      "집·호텔에서 받는 스웨디시 출장. 코스 종류, 가격대, 24시간·한국인 관리사 체크리스트까지 한 번에 정리합니다.",
    content: `스웨디시 출장마사지(홈타이)는 관리사가 고객이 지정한 장소—자택, 호텔, 오피스텔—로 방문해 시술하는 형태입니다. 샵에 직접 가지 않아 이동 피로가 없고, 시술 후 바로 휴식할 수 있다는 장점이 있습니다.

【스웨디시 출장이란】
클래식 스웨디시 테크닉(에플뢰라주·페트리사주 등)을 오일과 함께 시행하는 전신 마사지입니다. 출장 환경에서는 접이식 베드·매트를 사용하며, 조용하고 어두운 조명에서 이완 효과가 극대화됩니다.

【좋은 출장 스웨디시를 고르는 5가지】
1. 코스명 확인: '감성힐링 스웨디시', 'VIP 스웨디시', '센슈얼 스웨디시' 등 네이밍이 다릅니다. 오일만 바르는 아로마와 구분하세요.
2. 시간·가격: 60분 7~10만 원, 90분 10~13만 원이 수도권 일반대입니다. 150분 이상은 깊은 이완에 유리합니다.
3. 관리사: 한국인·혼혈·태국인 등 스타일이 다릅니다. 소통과 압 선호를 예약 시 말하세요.
4. 운영시간: 24시간 vs 저녁~새벽 only. 야근족은 24시간 샵을, 주간은 운영 시간 확인이 필수입니다.
5. 출장비·할인: 출장비 무료, 현금 할인, 회원 할인 여부를 반드시 확인하세요.

【지역별 특징】
· 수도권: 선택지가 많고 스웨디시 전문·믹스·VVIP 라인까지 다양
· 대구·경북: 타이·아로마 중심, 일부 포항 등에서 스웨디시 명시 코스
· 경남·경주: 관광·출장 피로 회복용 홈타이, 사전 예약 권장

【주의사항】
· 불법·성매매 연계 업체는 피하고, 정식 출장마사지 업체만 이용하세요.
· 건강 이상·임신·급성 통증 시에는 시술 전 반드시 상담하세요.
· 과도한 주류·공복 상태에서는 시술을 피하는 것이 좋습니다.

A1 Swedish 블로그에서는 수도권·지방 주요 출장샵의 스웨디시·힐링 코스를 업체별로 정리해 두었습니다. 아래 글에서 지역·가격대별로 비교해 보세요.`,
    image: "images/shops/outcall-guide.jpg",
    image2: "images/shops/outcall-guide-2.jpg",
    date: "2026-05-18",
    author: "A1 Swedish",
    views: 320,
  };
}

async function main() {
  fs.mkdirSync(imgDir, { recursive: true });
  const shops = loadShops();
  const existing = JSON.parse(fs.readFileSync(blogPath, "utf8"));
  const outPosts = [buildGuidePost(), ...shops.map((s, i) => buildShopPost(s, i))];

  console.log(`Downloading ${outPosts.length * 2} images...`);
  for (const post of outPosts) {
    const id = post.shopId || "outcall-guide";
    const seed1 = encodeURIComponent(id);
    const seed2 = encodeURIComponent(id + "-b");
    const url1 = `https://picsum.photos/seed/${seed1}/1200/800.jpg`;
    const url2 = `https://picsum.photos/seed/${seed2}/1200/800.jpg`;
    const p1 = path.join(root, post.image);
    const p2 = path.join(root, post.image2);
    fs.mkdirSync(path.dirname(p1), { recursive: true });
    const ok1 = await download(url1, p1);
    const ok2 = await download(url2, p2);
    console.log(post.id, ok1 ? "img1 OK" : "img1 FAIL", ok2 ? "img2 OK" : "img2 FAIL");
  }

  const merged = [...outPosts, ...existing];
  fs.writeFileSync(blogPath, JSON.stringify(merged, null, 2), "utf8");

  const js =
    "/** 블로그 글 + 로컬 이미지 (file:// 에서도 표시) */\nconst BLOG_POSTS = " +
    JSON.stringify(merged, null, 2) +
    "\n";
  fs.writeFileSync(path.join(root, "js", "blog-data.js"), js, "utf8");
  console.log(`Done: ${merged.length} total posts (${outPosts.length} new outcall posts)`);
}

main().catch(console.error);
