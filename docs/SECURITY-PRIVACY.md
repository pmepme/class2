# Security & Privacy

## 인증 의미

이 서비스의 인증 문구는 `한양대학교 이메일 인증`으로만 표현한다. 이는 실제 한양대학교 공식 HY-in SSO가 아니며, 실제 재학 여부·캠퍼스·학번·학과를 증명하지 않는다. 확인하는 값은 사용자가 `@hanyang.ac.kr` 이메일을 소유하고 있는지 여부다.

## 이메일 제한

- 이메일은 `trim().toLowerCase()`로 정규화한다.
- `split('@')` 후 도메인을 정확히 비교해 `hanyang.ac.kr`만 허용한다.
- `fakehanyang.ac.kr`, `hanyang.ac.kr.attacker.com`, Gmail, Naver는 거부한다.
- 프론트엔드와 Vercel API가 모두 검사한다.
- Supabase Before User Created Hook이 직접 Auth API 요청까지 차단한다.

## 세션과 토큰

- OTP 발송·검증은 Supabase Auth를 사용한다.
- 세션은 Vercel API가 Supabase SSR cookie adapter로 HttpOnly 쿠키에 설정한다.
- access token, refresh token, `isLoggedIn=true` 값을 localStorage/sessionStorage에 저장하지 않는다.
- 로그아웃은 `/api/auth/logout`에서 `supabase.auth.signOut()`을 호출한다.
- 새로고침은 `/api/auth/session`에서 쿠키 세션을 확인한다.

## 관리자 권한

- 관리자 계정은 `belief@hanyang.ac.kr` 하나로 고정한다.
- 클라이언트에서 role 값을 입력받거나 승격하지 않는다.
- 서버는 Supabase가 검증한 이메일을 정규화한 뒤 정확히 해당 주소와 비교한다.
- SQL profile trigger도 동일한 이메일만 `admin`으로 기록한다.
- 관리자 화면 접근은 클라이언트 UI와 API에서 모두 확인한다.
- 실제 교육·수강 데이터의 관리자 API/RLS는 운영 DB 이전 시 추가로 강제해야 한다.

## Supabase/RLS

- `profiles.id`는 `auth.users.id`를 참조하고 사용자가 삭제되면 함께 삭제된다.
- RLS를 활성화하고 본인 profile만 조회·수정할 수 있게 한다.
- profile의 id, email, role, active는 사용자가 변경할 수 없다.
- service role key를 사용하지 않으며 Publishable Key만 환경변수 이름으로 노출한다.
- migration의 `restrict_hanyang_email`은 Supabase Dashboard에서 Before User Created Hook으로 등록해야 한다.

## 오류 노출 원칙

사용자에게 Supabase 내부 오류, SQL 오류, 환경변수 값, API key, 스택 트레이스, 서버 파일 경로를 노출하지 않는다. OTP 불일치·만료·요청 제한·네트워크 오류는 사용자 행동이 가능한 일반 메시지로 변환한다.

## 현재 MVP의 한계

교육·수강 데모 데이터는 아직 localStorage에 있다. 인증 토큰은 저장하지 않지만, 실제 개인정보와 운영 수강 데이터는 localStorage에 저장하면 안 된다. 운영 전에는 courses/enrollments/progress를 서버 DB와 RLS/API로 이전해야 한다.
