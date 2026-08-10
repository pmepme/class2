# Decisions

## 2026-08-03 · Vite React SPA로 MVP 시작

- 선택: React + Vite + CSS, localStorage adapter.
- 이유: 빈 프로젝트에서 핵심 흐름을 빠르게 검증하고, UI와 도메인 경계를 명확히 만들기 위해서다. 현재 백엔드·SSO·DB 정보가 없는 상태에서 임의의 운영 인프라를 확정하지 않는다.
- 대안: Next.js full-stack. 기관 배포·서버 API가 정해지면 검토할 수 있으나, 현재는 추가 런타임 결정을 미룬다.
- 상용화 보완: `src/lib/storage.js`를 API client로 교체하고, 서버가 인증·권한·진행률 계산을 소유해야 한다.

## 2026-08-03 · 인증은 provider interface 뒤에 격리

- 선택: 인증을 UI 컴포넌트에서 분리하고 provider adapter 교체가 가능하도록 구성한다.
- 이유: 학교 인증 방식이 확정되기 전에도 교육 UX를 독립적으로 검증하기 위해서다.
- 대안: Google Sheets를 직접 브라우저에서 읽기. 개인정보와 비밀값 노출 위험으로 배제한다.

## 2026-08-09 · 한양대학교 이메일 OTP로 인증 교체

- 선택: Supabase Auth `signInWithOtp`/`verifyOtp`와 Vercel Serverless API.
- 이유: 비밀번호 없이 실제 `@hanyang.ac.kr` 이메일 소유를 확인하고, Supabase SSR 쿠키 세션으로 access token을 브라우저 저장소에 두지 않기 위해서다.
- 관리자 기준: 인증된 이메일이 정확히 `belief@hanyang.ac.kr`인 경우만 admin으로 계산한다. 프론트엔드 입력값이나 localStorage role을 신뢰하지 않는다.
- 제한: 현재 프로젝트는 Vite SPA이므로 로컬 OTP 테스트에는 `vercel dev`가 필요하며, Supabase 환경변수·Hook·이메일 템플릿은 사용자가 직접 설정해야 한다.

## 2026-08-10 · 최초 이메일 인증 후 비밀번호 로그인 제공

- 선택: 최초 회원가입은 OTP로 이메일 소유를 확인하고, 이후에는 이메일·비밀번호로 로그인한다.
- 이유: 매 로그인마다 OTP를 입력하는 불편을 줄이면서도 신규 계정의 이메일 소유 확인은 유지하기 위해서다.
- 프로필: 이름과 학번은 `profiles`에 저장하고, `onboarding_completed`가 true인 계정만 일반 로그인을 완료한 계정으로 취급한다.
- 보완: 기존 OTP 계정은 OTP 인증 후 프로필 설정 화면에서 비밀번호를 등록하면 된다.

## 2026-08-03 · YouTube는 MVP 플레이어로 사용

- 선택: YouTube iframe과 `cc_load_policy`, `cc_lang_pref` 파라미터를 사용한다.
- 이유: 원 요구사항에 맞고 교육 담당자가 영상 ID를 등록하기 쉽다.
- 제한: 미등록 영상은 링크 재공유를 막지 못한다. 콘텐츠 보안 요구가 높으면 전용 VOD·토큰 접근 방식을 별도 도입해야 한다.

## 2026-08-03 · 50% 수료 기준

- 선택: 현재 MVP에서는 저장된 진행률이 50% 이상이면 완료로 표시한다.
- 보완: 상용화 시 마지막 위치가 아니라 실제 재생 구간 누적, 되감기/건너뛰기 정책, 서버 검증을 확정해야 한다.
