# Design System

## 방향

신뢰감 있는 학술 서비스에 짧은 교육 플랫폼의 리듬을 더했다. 정보 위계는 조용하게 유지하고, 보라색 진행·행동 색상과 교육별 그래픽 타일로 탐색과 완료 상태를 빠르게 구분한다.

## 토큰

| 영역 | 값 |
|---|---|
| Ink | `#171827` |
| Deep surface | `#24203D` |
| Primary | `#6D54EF` |
| Cyan accent | `#4CC9E8` |
| Orange accent | `#FF8B52` |
| Background | `#F7F8FC` |
| Surface | `#FFFFFF` |
| Border | `#E6E7EF` |
| Body font | Manrope + Noto Sans KR |
| Data font | DM Mono |
| Radius | 8 / 10 / 13 / 16px |
| Spacing | 4px 기반, 주요 간격 16 / 24 / 32 / 48 / 80px |

## 컴포넌트 규칙

- 주요 CTA는 보라색 또는 잉크색 단색 버튼으로 한 화면에 하나의 주 행동을 둔다.
- 필터는 pill이지만 선택 전에는 선을 최소화해 콘텐츠보다 앞서지 않게 한다.
- 진행률은 보라색 bar, 완료 상태는 초록색 dot/tag로 표현한다.
- 오류는 빨강 계열, 저장 성공은 초록 계열을 사용하고 텍스트를 함께 제공한다.
- 모바일에서는 교육 카드가 가로형으로 바뀌고 테이블은 최소 폭을 유지해 데이터가 잘리지 않게 한다.
- 모든 주요 아이콘은 SVG stroke 기반이며 버튼에는 텍스트 또는 aria-label을 함께 둔다.
