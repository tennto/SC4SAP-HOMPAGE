# 다음 작업 (2026-08-10 기준)

## 어디까지 했나

섹션 하나씩 사장님과 확인하며 진행 중. **Impact 섹션까지 끝났습니다.**

| 섹션 | 상태 |
|---|---|
| Nav | 완료 (워드마크만, 호버 700ms, 언어 슬라이더, 햄버거 X 전환) |
| Hero `#top` | 완료 (서체·크기·모션·카피 전부 반복 확정) |
| Facts | 완료 (카운트업 + 순차 등장) |
| Why `#why` | 완료 (2열 대조 + 커넥터, 비율 기반 정렬) |
| Impact `#impact` | 완료. 구 See it 을 대체함 (아래 참조) |
| **Start `#start`** | **다음 차례** |
| Capabilities `#capabilities` | 미착수 (구조는 동작함, 시각 확정 안 함) |
| CTA `#install` | 완료 (라이트=앰버 13% 틴트 + 커서 도트, 다크=단색 밴드) |
| Footer `#contact` | 미착수 (워드마크만 교체함) |

`install.html` 은 완성. 언어 전환·테마 전환·모바일 메뉴 같은 공통 동작도 완료.

## Impact 섹션 (2026-08-10)

`#see-it` 을 없애고 `#impact` 로 교체했습니다. 스크린샷 대기가 풀렸습니다.

**여기까지 네 번 갈아엎었습니다.** 세로 누적 선그래프 → 가로 2계열 꺾은선
(`chart1.PNG` 형식) → 2레인 병렬 필드 → **현재: React Bits `CardSwap` 이식**.
차트 두 판을 버린 이유는 남겨둘 만합니다.

- 꺾은선 차트는 **중립적이려고 만들어진 도구**입니다. 읽는 사람이 스스로
  판단하게 두는 게 목적이라 감탄을 표현하는 기능이 없습니다
- 제일 극적인 것(100 MD 격차)이 **빈 공간**으로 표현됐습니다. 여백은 아무
  느낌도 주지 않습니다
- MD 는 아무도 체감 못 하는 단위입니다

### 지금 들어가 있는 것

좌측 카피 + 우측 카드 덱. 레퍼런스는 `example1.PNG`.

**아무것도 설치하지 않았습니다.** 이 저장소는 빌드 스텝도 npm 도 없어서
`import` 도 `gsap` 도 들어갈 수 없습니다. 스왑 타임라인(드롭 → 승격 → 뒤로
복귀)과 3D 슬롯 수식을 Web Animations API 로 다시 쓰고, GSAP 이징은 공식을
직접 계산해 CSS `linear()` 로 구웠습니다. 스크립트 태그는 이식 전후로 동일
하고(스위트가 목록을 통째로 대조합니다) 의존성은 0개입니다.

**이징은 컴포넌트의 `elastic` 이 아니라 `linear` 프리셋(`power1.inOut`)입니다.**
elastic 은 설계상 오버슛하며 정착하는 곡선이라 이 크기에서는 "뚝뚝 끊긴다"로
읽혔습니다. 그래서 durDrop/durMove/durReturn 2000 → **800**,
promoteOverlap 0.9 → **0.45**, returnDelay 0.05 → **0.2**. 전부 컴포넌트가
가진 다른 설정값이지 눈대중이 아닙니다. **elastic 으로 되돌리면 다시 끊깁니다.**

**슬롯은 원본 그대로.** `x: i*60, y: -i*85, z: -i*60*1.5, zIndex: total-i`,
skew 6deg, perspective 900. 덱은 원본처럼 우하단에 앵커되고 화면 밖으로
나갑니다 — **이 넘침은 고칠 결함이 아니라 그림 자체입니다.** 카드가 화면을
벗어나 안 보이는 것이 레퍼런스가 하는 일입니다. 다만 다음 섹션 위로 떨어지면
안 되므로 `#impact { overflow: hidden }` 이 세로만 잘라냅니다.

**크기는 픽셀이 아니라 뷰포트 비율입니다.** `--cs-w: clamp(330px, 46vw, 660px)`,
높이는 5:4 로 파생. 고정 500px 은 창 하나에서만 레퍼런스 비율이 맞습니다.

**카드 구조: 상단 타이틀 바 + 본문.** 뒤에 깔린 카드는 바만 보이고, 그 계단처럼
쌓인 이름 줄이 스택을 "네 장"으로 읽히게 만듭니다. 바를 빼면 카드 한 장에
그림자가 진 것으로 보입니다. 본문 아래쪽 `.cs-sheet` 는 그 명령이 돌려주는
산출물의 **구조**만 담습니다 — 지어낸 수치를 넣지 마세요.

**넘기는 버튼은 없습니다.** 자동 순환만. 대신 포인터를 올리거나 포커스가
들어오면 멈추고, `prefers-reduced-motion` 에서는 아예 돌지 않고, 화면 밖에서는
인터벌 자체가 멎습니다. 5.5초마다 도는 산문을 멈출 수 없으면 천천히 읽는
사람에게는 읽을 수 없는 콘텐츠입니다.

**성능.** 큰 카드 4장 × 부드러운 그림자는 프레임 예산을 그대로 씁니다.
`--lift-3` → `--lift-2`, `contain: paint` 로 각자 레이어를 잡게 했습니다.

## 시작하자마자 할 것

**jsdom 테스트 3벌을 백그라운드 잡으로 먼저 복구합니다.** 저장소에 안 넣기로
했으니 세션마다 새로 만들어야 합니다. 아래 "검증" 항목에 셋업 명령어, 공통
부트 헬퍼, 각 벌이 덮던 범위, jsdom 함정까지 다 적어놨습니다. 브리핑 읽는
동안 백그라운드로 돌려두면 섹션 작업 시작할 때쯤 준비됩니다.

## 바로 다음에 할 것

**Start 섹션.** 이미지 대기가 없으니 바로 들어가면 됩니다.

Impact 가 2열 필드라 Start 의 3분할 가로 플로우가 바로 뒤에 오면 Why(2열) →
Impact(2열) → Start(3열) → Capabilities(행) 로 가로가 네 번 연속입니다.
Start 나 Capabilities 중 하나는 방향을 바꾸는 게 좋습니다.

**남은 확인 사항 하나.** Impact 숫자는 사장님이 주신 상한(고난이도 1본 6.5 MD)과
8주 기준에서 역산한 모델입니다. 실측이 생기면 `SW_RATIO` 와 두 푸터 문구를 같이
고치면 됩니다.

## 작업 방식

섹션마다 **먼저 질문하고** 진행합니다. 선택지를 프리뷰와 함께 제시하고,
각 안의 약한 점도 같이 적습니다.

두 가지는 반드시 지킵니다.

1. **위치는 절대 고정 픽셀로 잡지 않습니다.** 브라우저 폭을 바꾸면 바로
   드러납니다. 커넥터의 `translateX(-34px)` 와 오른쪽 열 인셋 둘 다
   비율(`--link-bias`, `--after-inset`)로 다시 짰습니다.
2. **모션·호버는 처음부터 넉넉하게.** 매번 더 느리게 요청받았습니다
   (네비 호버 140 → 420 → 700ms).

조절 가능한 값은 CSS 커스텀 프로퍼티로 빼둡니다.

## 검증 — 세션 시작 시 먼저 할 것

### 1. 정적 검출기 (그대로 돌아감)

프로젝트 루트에서:

```
node .claude/skills/impeccable/scripts/detect.mjs --json \
  sc4_redesign/index.html sc4_redesign/install.html \
  sc4_redesign/css/*.css sc4_redesign/js/*.js
```

`[]` 가 나와야 합니다.

### 2. jsdom 테스트 — 세션마다 새로 만들어야 함

테스트 173건은 백그라운드 작업 임시 폴더에 있었고 **세션이 끝나면
사라집니다.** 저장소에 넣지 않기로 했으니, 다음 세션에서 **작업을 시작하기
전에 백그라운드 잡으로 다시 만들어 놓고** 변경할 때마다 돌리면 됩니다.

셋업은 한 줄입니다.

```
cd "$CLAUDE_JOB_DIR/tmp" && npm init -y && npm i jsdom
```

공통 부트 헬퍼 (세 파일이 전부 이걸 씁니다):

```js
function boot(page, scripts, mq = () => false) {
  const dom = new JSDOM(fs.readFileSync(ROOT + '/' + page, 'utf8'), {
    url: 'https://sc4sap.dev/' + page,
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  });
  const { window } = dom;
  // 즉시 발화하는 스텁. jsdom 에는 둘 다 없습니다.
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {} disconnect() {}
  };
  window.ResizeObserver = class { observe() {} disconnect() {} };
  window.fetch = () => Promise.reject(new Error('offline'));
  window.matchMedia = q => ({ matches: mq(q), media: q,
    addEventListener() {}, removeEventListener() {} });
  for (const f of scripts) window.eval(fs.readFileSync(ROOT + '/' + f, 'utf8'));
  return { window, d: window.document };
}
```

스크립트 로드 순서:

```
index.html    strings.js → panels.ko.js → i18n.en.js → i18n.ja.js → app.js
install.html  strings.js → strings.install.js → app.js
```

### 세 벌이 덮던 것

| 파일 | 건수 | 범위 |
|---|---|---|
| `impact.mjs` | 118 | Impact 섹션 전용. 차트 잔재 0건(마크업·CSS·JS), 인벤토리(40본·두 레인이 같은 배열 같은 순서·이름 형식·중복 0건·모듈 5종 이상), **비율이 곧 주장인지**(오른쪽 40/40 일 때 왼쪽 정확히 10, 미도달 타일은 스케줄 자체가 없음, 첫 웨이브가 정확히 25, 왼쪽은 등간격), 카운터가 같은 스케줄 함수에서 나오는지, 3개 언어(레인 문구·타일명 비번역·aria 라벨·em-dash 0건·리드가 전제와 실측 아님 고지를 지는지·푸터가 8주/2주를 말하는지), CSS 계약(카드 아님·앰버 원색·기존은 앰버 금지·스케줄된 타일만 애니메이션), reduced-motion, 카운터 실제 구동 |
| `regress.mjs` | 19 | 교체 후 나머지 페이지 무사 확인. 12행·팩트 4개·히어로 분할·Why 스태거·섹션 순서, 3개 언어 키 누락 0건 **및 고아 문자열 0건**, `install.html` 부팅 |
| `smoke.mjs` | 28 | 인덱스 12행 렌더, 아코디언 개폐, 3개 언어 전환, 패널 언어 동기화, 테마 토글·영속, 모바일 네비, 복사, 스타 API 실패 폴백, 3개 언어 패널 전체 em-dash 0건 |
| `hero.mjs` | 31 | 헤드라인 줄 분할, 앰비언트 레이어, 순차 등장 지연값, 대시 경계 7곳, 디스플레이 서체 배선, 타이핑 완주, 언어 전환 후 재분할, reduced-motion 게이팅 |
| `pass3.mjs` | 114 | 팩트 스트립 카운터, Why 좌우 스태거, 언어 썸 기하, 네비 호버, 설치 가이드 페이지(명령어 원문 일치 8종), 커넥터 구조·주기·모바일, 테마 스왑, 모바일 메뉴, CTA 밴드·도트 |

### jsdom 함정 (전부 한 번씩 당한 것)

- **레이아웃 엔진이 없습니다.** `offsetWidth`/`offsetLeft` 는 항상 0입니다.
  언어 썸처럼 측정값을 쓰는 로직은 `Object.defineProperty` 로 지오메트리를
  주입해야 실제 계산을 검증할 수 있습니다.
- **타이밍을 기다려야 합니다.** 언어 전환은 크로스페이드 때문에 클릭 후
  420ms, 타이핑 완주는 2600ms, 테마 스왑 해제는 460ms.
- **CSS 정규식은 `[^}]*` 로 블록 안에 묶으세요.** `[\s\S]*?` 는 닫는 중괄호를
  지나쳐 다음 규칙까지 훑습니다. 이것 때문에 네 번 헛발질했습니다
  (`.nav-links` 의 `display: none` 검사가 `.nav-sep` 를 잡는 식).
- **`.cd-fill` 은 공용 셀렉터에도 나옵니다.** 검사하려는 속성이 들어 있는
  블록을 `matchAll` 로 골라야 합니다.
- `scrollTo` 미구현 에러는 무시해도 됩니다.

### 3. 사람이 봐야 하는 것

**이 PC 에는 브라우저 자동화 도구가 없습니다** (Playwright·Puppeteer 없음).
정적 분석 + DOM 시뮬레이션이 한계라 렌더링 육안 확인은 사장님 몫입니다.
특히 다크 모드는 계산으로만 검증됩니다. 봤다고 말하지 말 것.
