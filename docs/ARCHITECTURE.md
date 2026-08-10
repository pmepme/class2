# Architecture

## 현재 구현

```text
Browser
  ├─ Vite + React UI
  ├─ memory-only auth state
  └─ /api/auth/* (credentials: include)
        └─ Vercel Serverless Functions
              └─ Supabase Auth + PostgreSQL profiles

교육·수강 MVP 데이터
  └─ browser localStorage (인증 토큰은 저장하지 않음)
```

현재 프로젝트는 Vite + React SPA를 유지한다. 기존 교육 탐색·수강·관리자 UI는 유지하고, 이름·학번/사번 Apps Script 인증을 Supabase 이메일 OTP 인증으로 교체했다. 브라우저는 Supabase access token을 직접 보관하지 않으며, `/api/auth/*`가 Supabase SSR client로 HttpOnly 쿠키 세션을 관리한다.

## 인증 흐름

```text
@hanyang.ac.kr 입력
  → POST /api/auth/request-otp
  → Supabase signInWithOtp
  → 이메일의 8자리 {{ .Token }} 입력
  → POST /api/auth/verify-otp
  → Supabase verifyOtp
  → profiles 조회 + 역할 계산
  → HttpOnly 쿠키 세션
```

- 프론트엔드는 입력 편의를 위해 도메인을 검사한다.
- API는 동일한 도메인을 다시 검사한다.
- Supabase Before User Created Hook은 직접 Auth API를 호출하는 우회도 차단한다.
- `belief@hanyang.ac.kr`만 관리자 역할로 계산한다.
- 관리자 메뉴와 API 모두 서버 세션의 역할을 확인한다.

## 파일 경계

- `src/lib/emailAuth.js`: 이메일 정규화, UI용 API client, 관리자 이메일 상수.
- `api/_supabase.js`: Supabase SSR client와 쿠키 serializer, safe user 변환.
- `api/auth/request-otp.js`: OTP 발송과 도메인/관리자 이메일 제한.
- `api/auth/verify-otp.js`: OTP 검증, profile 조회, 관리자 접근 제한.
- `api/auth/session.js`: 새로고침 후 쿠키 세션 복구.
- `api/auth/logout.js`: Supabase 세션 종료와 쿠키 정리.
- `supabase/migrations/202608090001_hanyang_email_auth.sql`: profiles, trigger, RLS, Before User Created Hook.
- `src/lib/storage.js`: 교육·수강 데모 데이터 adapter. 인증 세션을 저장하지 않는다.

## 데이터 모델

- `profiles`: `auth.users.id`와 연결된 email, display_name, onboarding_completed, role, active.
- `courses`: 현재는 localStorage demo data. 운영 시 DB table로 이전한다.
- `enrollments`: 현재는 localStorage demo data. 운영 시 user_id/course_id 기반 DB로 이전한다.
- `progress_events`: 운영 단계에서 실제 재생 구간을 기록하고 서버에서 progress를 계산한다.

## 보안 경계

- Publishable Key만 환경변수로 사용한다. service role key는 클라이언트·Vercel API 코드에 넣지 않는다.
- API는 Supabase 내부 오류·SQL·환경변수·스택 트레이스를 사용자에게 반환하지 않는다.
- profile의 id, email, role, active는 사용자 update trigger로 변경할 수 없게 한다.
- `profiles` RLS는 본인 행만 조회·수정하도록 제한한다.
- 현재 교육·수강 데이터는 UX 검증용 localStorage이며, 운영 데이터로 사용하기 전 서버 API·DB·RLS를 추가해야 한다.

## 유지되는 Apps Script 경계

강의자료 Google Drive 업로드는 `src/lib/appScriptData.js`의 선택적 기능으로 유지한다. 인증에는 더 이상 사용하지 않는다. 운영 전에는 자료 업로드도 백엔드 adapter 뒤로 이동하고 브라우저에 API secret을 노출하지 않아야 한다.
