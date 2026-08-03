# Architecture

## 현재 MVP

```text
React + Vite SPA
  ├─ App state / view routing
  ├─ UI components
  └─ storage adapter
       └─ browser localStorage (가상 데이터 전용)
```

현재 프로젝트는 빈 저장소에서 시작했기 때문에 백엔드 없이 핵심 UX를 검증할 수 있는 프론트엔드 MVP로 구성했다. `src/lib/storage.js`가 저장소 경계를 제공하므로 API·DB로 교체할 때 화면 컴포넌트가 직접 localStorage를 다루지 않는다.

## 상용화 목표 구조

```text
Student browser
  ↓ HTTPS
Web frontend
  ↓ session cookie / API
Backend API ── AuthProvider interface ── School SSO (OIDC/SAML)
     │                         └────── Apps Script adapter (초기 명단 대조)
     ├─ managed relational DB: users, courses, enrollments, progress_events
     ├─ object storage: lecture materials
     └─ audit / operational logs (PII 최소화)
```

## 도메인 모델 초안

- `users`: 내부 `user_id`, 외부 식별자 해시 또는 기관 식별자, 표시 이름, active, role.
- `courses`: title, description, category, youtube_video_id, material_url, published_at.
- `enrollments`: user_id, course_id, enrolled_at, status.
- `progress_events`: enrollment_id, watched_ranges 또는 검증된 position, created_at.
- `progress_summary`: 누적 시청 구간·진행률·완료 여부를 서버에서 계산.

## 교체 가능한 인증 어댑터

```ts
interface AuthProvider {
  verify(input: { name: string; identifier: string }): Promise<{
    approved: boolean;
    userId?: string;
    displayName?: string;
    role?: 'student' | 'admin';
  }>;
}
```

브라우저가 Google Sheets/Apps Script를 직접 호출하지 않도록 백엔드의 `POST /api/auth/verify` 뒤에 어댑터를 둔다. SSO를 사용할 수 있게 되면 동일 인터페이스의 OIDC/SAML provider로 교체한다.

## 영상 진행률

현재 데모는 진행률 슬라이더와 저장 버튼으로 상태를 재현한다. 실제 배포에서는 YouTube IFrame Player API의 `getCurrentTime`, `getDuration`, 상태 이벤트를 백엔드로 주기적으로 전송하고, 마지막 위치가 아닌 재생 구간 누적을 기본안으로 검토한다. 영상이 YouTube 미등록이라도 완전한 콘텐츠 접근 통제는 아니므로 보안 요구가 높으면 전용 VOD를 검토한다.
