# Security & Privacy

## 현재 MVP의 범위

현재는 실제 개인정보를 사용하지 않는 가상 데이터만 포함한다. 인증 세션과 데모 데이터는 브라우저 `localStorage`에 저장되며, 이는 개발·UX 검증용이다. 기관 운영 환경의 인증·권한·개인정보 저장소로 사용하면 안 된다.

## 반드시 지킬 원칙

- 학생 명단 전체를 프론트엔드로 전송하지 않는다.
- 브라우저가 Google Sheets 또는 Apps Script를 직접 호출하지 않는다.
- Apps Script URL, Sheet ID, API key, SSO secret은 환경변수/서버 비밀 저장소에서만 관리한다.
- 이름·학번/사번·이메일을 애플리케이션 로그에 기록하지 않는다. 필요 시 내부 `user_id`와 요청 trace id만 기록한다.
- 서버 세션은 `HttpOnly`, `Secure`, `SameSite=Lax/Strict` 쿠키를 우선 검토한다.
- 학생은 자기 enrollment만, 담당자는 허용된 운영 데이터만 조회할 수 있도록 서버에서 RBAC를 강제한다.
- CSV 다운로드는 관리자 권한·감사 로그·필요 컬럼 최소화를 적용한다.
- 자료 다운로드 URL은 만료 가능한 서명 URL을 우선 검토한다.

## Apps Script 어댑터

Apps Script 사용 시 `Students` 시트의 `user_id`, `name`, `student_or_employee_no`, `active` 열을 백엔드 어댑터가 읽고, 브라우저에는 승인 여부·내부 user_id·표시 이름만 반환한다. 외부 연동 오류는 fail-closed로 처리한다.

## 추가 확인 필요

- 학교 SSO의 OIDC/SAML 제공 여부와 claims: `[확인 필요]`
- 개인정보 보존 기간과 파기 요청 처리: `[확인 필요]`
- 수강률을 공식 성적/이수 증명으로 사용할지 여부: `[확인 필요]`
- YouTube 미등록 영상만으로 충분한 콘텐츠 보안인지: `[확인 필요]`
