# Setup

## 로컬 실행

```bash
npm install
npm run dev
```

`npm run dev`는 Vite 화면을 실행한다. 실제 이메일 OTP까지 로컬에서 테스트하려면 Vercel CLI로 Serverless API를 함께 실행한다.

```bash
npx vercel dev
```

## Supabase 환경변수

`.env.local` 또는 Vercel Environment Variables에 실제 값을 입력한다. `.env.local`은 Git에 커밋하지 않는다.

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

- Supabase Project Settings의 URL과 Publishable Key를 사용한다.
- service role key는 사용하지 않으며, 클라이언트 코드나 저장소에 기록하지 않는다.
- Vercel에서는 Preview와 Production 환경에 각각 입력한다.

## Supabase 초기 설정

1. `supabase/migrations/202608090001_hanyang_email_auth.sql`을 실행한다.
2. `supabase/migrations/202608100002_password_profile.sql`을 실행한다. 학번 저장 필드와 중복 방지 인덱스를 추가한다.
3. Authentication → Hooks → Before User Created에 `public.restrict_hanyang_email`을 등록한다.
4. Authentication → Email Templates의 Magic Link/OTP 템플릿에 8자리 토큰을 표시한다.

```html
<h2>한양대학교 이메일 인증</h2>
<p>아래 인증번호를 서비스에 입력해 주세요.</p>
<h1>{{ .Token }}</h1>
<p>본인이 요청하지 않았다면 이 이메일을 무시해 주세요.</p>
```

5. 실제 `@hanyang.ac.kr` 이메일로 OTP 발송·인증, 회원가입 정보 저장, 로그아웃 후 비밀번호 로그인을 테스트한다.

## 인증 흐름

- 최초 회원가입은 한양대학교 이메일과 8자리 OTP로 이메일 소유를 확인한다.
- 회원가입 완료 후에는 이메일 + 비밀번호로 로그인하며, 기존 OTP 가입자는 OTP 인증 후 이름·학번·비밀번호를 한 번 설정한다.
- 회원가입 정보는 `profiles.display_name`, `profiles.student_id`, `profiles.onboarding_completed`에 저장한다.
- 이메일은 `trim().toLowerCase()`로 정규화하고 도메인은 정확히 `hanyang.ac.kr`만 허용한다.
- 회원가입 이메일 확인은 Supabase `signInWithOtp` → `verifyOtp`, 비밀번호 로그인은 `signInWithPassword`로 처리한다.
- 인증 세션은 Vercel API가 Supabase SSR 쿠키로 설정하며, access token을 `localStorage`나 `sessionStorage`에 저장하지 않는다.
- 관리자 권한은 인증된 이메일이 정확히 `belief@hanyang.ac.kr`일 때만 부여한다. 클라이언트 UI가 아니라 API와 SQL profile trigger에서 함께 제한한다.
- 실제 재학 여부·캠퍼스·학번·학과를 증명하지 않고, 한양대학교 이메일 소유 여부만 확인한다.

## 보안 확인

다음 주소는 모두 거부되어야 한다.

- `user@gmail.com`
- `user@naver.com`
- `user@fakehanyang.ac.kr`
- `user@hanyang.ac.kr.attacker.com`

다음 주소는 허용되어야 한다.

- `student@hanyang.ac.kr`
- `STUDENT@HANYANG.AC.KR` → 소문자로 정규화

## 강의자료 Google Drive 업로드(선택 기능)

인증은 Supabase가 담당하고, 교육 자료 업로드는 기존 Apps Script/Google Drive adapter를 계속 사용할 수 있다.

```text
VITE_APPS_SCRIPT_DATA_URL=https://script.google.com/macros/s/배포ID/exec
VITE_APPS_SCRIPT_API_SECRET=인증용값
```

관리자는 교육 편집 화면에서 파일을 선택하면 `upload_material` 요청으로 Drive에 업로드하고 반환된 `fileId`를 교육 자료에 저장한다. 이 API secret은 Vite 빌드에 포함될 수 있으므로 기관 운영에서는 백엔드 adapter 뒤로 이동해야 한다.

## 배포 전 체크리스트

- [ ] Supabase URL/Publishable Key를 Vercel에 입력
- [ ] SQL migration 실행
- [ ] Before User Created Hook 등록
- [ ] OTP 템플릿에 `{{ .Token }}` 적용
- [ ] `belief@hanyang.ac.kr` 계정으로 관리자 OTP 테스트
- [ ] 다른 `@hanyang.ac.kr` 계정이 관리자 화면에 접근하지 못하는지 확인
- [ ] 외부 도메인과 잘못된 유사 도메인이 차단되는지 확인
- [ ] Vercel 배포 후 새로고침에도 HttpOnly 쿠키 세션이 유지되는지 확인
