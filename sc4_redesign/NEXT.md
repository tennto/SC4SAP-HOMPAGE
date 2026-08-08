# 다음 작업 (2026-08-08 기준)

## 어디까지 했나

섹션 하나씩 사장님과 확인하며 진행 중. **Why 섹션까지 끝났습니다.**

| 섹션 | 상태 |
|---|---|
| Nav | 완료 (워드마크만, 호버 700ms, 언어 슬라이더, 햄버거 X 전환) |
| Hero `#top` | 완료 (서체·크기·모션·카피 전부 반복 확정) |
| Facts | 완료 (카운트업 + 순차 등장) |
| Why `#why` | 완료 (2열 대조 + 커넥터, 비율 기반 정렬) |
| **See it `#see-it`** | **다음 차례. 이미지 대기 중** |
| Start `#start` | 미착수 |
| Capabilities `#capabilities` | 미착수 (구조는 동작함, 시각 확정 안 함) |
| Safety `#safety` | 미착수 |
| CTA `#install` | 완료 (라이트=앰버 13% 틴트 + 커서 도트, 다크=단색 밴드) |
| Footer `#contact` | 미착수 (워드마크만 교체함) |

`install.html` 은 완성. 언어 전환·테마 전환·모바일 메뉴 같은 공통 동작도 완료.

## 시작하자마자 할 것

**jsdom 테스트 3벌을 백그라운드 잡으로 먼저 복구합니다.** 저장소에 안 넣기로
했으니 세션마다 새로 만들어야 합니다. 아래 "검증" 항목에 셋업 명령어, 공통
부트 헬퍼, 각 벌이 덮던 범위, jsdom 함정까지 다 적어놨습니다. 브리핑 읽는
동안 백그라운드로 돌려두면 섹션 작업 시작할 때쯤 준비됩니다.

## 바로 다음에 할 것

**See it 섹션.** 단, 시작 전에 이미지가 필요합니다.

```
assets/capture-program-to-spec.png     1600x1000 이상
```

Claude Code 에서 `/sc4sap:program-to-spec` 이 도는 화면. `index.html` 의
`.figure-slot` div 자리에 TODO 주석이 있고, 거기를 `<img>` 로 바꾸면 됩니다.
기존 `../assets/thumb.png` 는 구 SAP 블루라 못 씁니다.

이미지가 없으면 Start 섹션부터 먼저 진행해도 됩니다.

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
