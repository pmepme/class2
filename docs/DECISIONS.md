# Decisions

## 2026-08-03 · Vite React SPA로 MVP 시작

- 선택: React + Vite + CSS, localStorage adapter.
- 이유: 빈 프로젝트에서 핵심 흐름을 빠르게 검증하고, UI와 도메인 경계를 명확히 만들기 위해서다. 현재 백엔드·SSO·DB 정보가 없는 상태에서 임의의 운영 인프라를 확정하지 않는다.
- 대안: Next.js full-stack. 기관 배포·서버 API가 정해지면 검토할 수 있으나, 현재는 추가 런타임 결정을 미룬다.
- 상용화 보완: `src/lib/storage.js`를 API client로 교체하고, 서버가 인증·권한·진행률 계산을 소유해야 한다.

## 2026-08-03 · 인증은 provider interface 뒤에 격리

- 선택: 이름·학번/사번 대조는 데모용 mock provider로만 구현하고, 제품 구조는 SSO/Apps Script adapter 교체를 전제로 한다.
- 이유: 학교 SSO 가능 여부와 Apps Script 운영 정책이 아직 확인되지 않았다.
- 대안: Google Sheets를 직접 브라우저에서 읽기. 개인정보와 비밀값 노출 위험으로 배제한다.

## 2026-08-03 · YouTube는 MVP 플레이어로 사용

- 선택: YouTube iframe과 `cc_load_policy`, `cc_lang_pref` 파라미터를 사용한다.
- 이유: 원 요구사항에 맞고 교육 담당자가 영상 ID를 등록하기 쉽다.
- 제한: 미등록 영상은 링크 재공유를 막지 못한다. 콘텐츠 보안 요구가 높으면 전용 VOD·토큰 접근 방식을 별도 도입해야 한다.

## 2026-08-03 · 50% 수료 기준

- 선택: 현재 MVP에서는 저장된 진행률이 50% 이상이면 완료로 표시한다.
- 보완: 상용화 시 마지막 위치가 아니라 실제 재생 구간 누적, 되감기/건너뛰기 정책, 서버 검증을 확정해야 한다.
