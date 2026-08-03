# Setup

## 로컬 실행

```bash
npm install
npm run dev
```

Vite가 출력하는 로컬 URL을 브라우저에서 연다.

## 인증

- 일반 참여자와 관리자는 Apps Script에 연결된 `Students` 시트에서 이름·학번/사번을 대조한다.
- 일반 참여자는 `action=verify_student`, 관리자는 `action=verify_admin`으로 구분한다.
- 관리자 화면은 상단 `관리자` 메뉴에서 이름·학번/사번을 입력해야 한다.
- 참여자·관리자 인증은 Apps Script `doPost(e)`에 JSON으로 `action`, `name`, `studentOrEmployeeNo`, `apiKey`를 전송하고, 응답에 `approved: true` 또는 `authorized: true`가 명시된 경우에만 세션을 만든다. 단순 상태 응답의 `success: true`는 승인으로 처리하지 않는다.
- 로컬 실행 시 `.env.local`에 `VITE_APPS_SCRIPT_API_SECRET=library_edcation_test_page_1`을 설정한다. Apps Script Script Properties의 키는 코드 기준 `API_SECRET`이며, 값은 동일해야 한다. `.env.local`은 저장소에 커밋하지 않는다.

## 데이터

교육·수강 데이터와 관리자 화면의 데모용 표시 데이터는 `src/lib/mockData.js` 및 브라우저 localStorage에 저장된다. 인증 명단의 기준은 Apps Script의 `Students` 시트이며, 관리자 화면의 `데모 초기화` 버튼은 인증 명단을 변경하지 않는다.

## Apps Script 연동 전 확인

1. Apps Script 웹 앱 배포 대상이 현재 사이트 사용자의 한양대 Google 로그인 환경과 맞는지 확인한다. 현재 endpoint는 새 웹 앱 배포 URL을 사용한다.
2. `doPost(e)`가 위 JSON 필드와 `action=verify_student|verify_admin`을 받고, 명단과 이름·학번/사번을 대조해 JSON으로 `{ "approved": true, "userId": "...", "displayName": "..." }` 또는 `{ "authorized": true, ... }`를 반환하도록 한다. 현재 `doGet(e)`는 상태 확인용이므로 인증에 사용하지 않는다. `{ "success": true, "service": "student-verification-api", "status": "ok" }`는 상태 확인 응답이므로 승인으로 사용할 수 없다.
3. 정식 운영에서는 Apps Script API secret을 브라우저에 넣지 말고 백엔드의 `/api/auth/verify`가 Apps Script를 호출하도록 교체한다. Vite 환경 변수도 빌드 결과에서는 노출될 수 있다.
4. 백엔드와 관리형 DB, 학교 SSO OIDC/SAML, 서버 세션·RBAC·감사 로그·개인정보 보존 정책을 확정한다.
5. YouTube ID·자료 파일 저장소·다운로드 정책을 확정한다.
