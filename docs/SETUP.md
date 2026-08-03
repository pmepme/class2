# Setup

## 로컬 실행

```bash
npm install
npm run dev
```

Vite가 출력하는 로컬 URL을 브라우저에서 연다.

## 데모 인증

- `김민서` / `20261234`
- `Aisha Rahman` / `20250117`
- 관리자 화면은 상단 `관리자` 메뉴에서 확인할 수 있다. 현재는 운영 권한 검증이 없는 데모 화면이다.

## 데이터

가상 교육·학생·수강 데이터는 `src/lib/mockData.js`에 있으며, 브라우저 localStorage에 저장된다. 관리자 화면의 `데모 초기화` 버튼으로 원상 복구할 수 있다.

## 실제 연동 전 준비

1. 백엔드와 관리형 DB 선택 `[확인 필요]`.
2. 학교 SSO OIDC/SAML 제공 여부와 claims 확인 `[확인 필요]`.
3. SSO가 불가능하면 백엔드에서 Apps Script adapter를 호출하고, 브라우저에는 `/api/auth/verify`만 공개.
4. YouTube ID·자료 파일 저장소·다운로드 정책 확정.
5. 서버 세션, RBAC, 감사 로그, 개인정보 보존 정책 적용.
