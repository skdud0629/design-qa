# design-qa

Design QA Assistant — Figma에서 정의된 UI 규칙과 실제 구현 화면(스크린샷)을 비교해 UI 오류를 탐지하는 도구입니다.

## 목표

사용자가 구현 화면 스크린샷을 업로드하면 다음을 수행합니다:

1. Screenshot → OCR → 텍스트/데이터 추출
2. 추출 데이터와 Figma 규칙(표시 형식, 고정 문구 등)을 Rule-based로 비교
3. PASS / WARNING / ERROR 판정
4. 오류 위치 하이라이트
5. AI를 통한 오류 설명 및 수정 제안(보조 역할)

> 중요한 원칙: 명확히 판별 가능한 항목은 Rule-based 검사로 처리하며, AI는 설명/제안 보조 역할만 수행합니다.

## 현재 개발 단계 (초기 스캐폴드)

- React + Vite(JavaScript) 기본 프로젝트 생성
- Git 초기화 및 첫 커밋
- 프로젝트 구조 문서화

다음 작업은 사용자의 추가 지시에 따라 하나씩 진행합니다.

## 초보자용 프로젝트 구조 설명

- `index.html` — 앱 진입점 HTML
- `src/main.jsx` — React 진입 스크립트
- `src/App.jsx` — 루트 React 컴포넌트(현재는 placeholder)
- `src/styles.css` — 간단한 전역 스타일
- `vite.config.js` — Vite 설정
- `package.json` — npm 스크립트 및 (dev)dependencies
- `.gitignore` — Git 무시 목록

## QA 대상 항목 (향후 구현 계획 요약)

1. Fixed Copy: 버튼, Toast, Tab, Error message, Empty state, Page title 등
2. Dynamic Data: 가격, 숫자, 퍼센트, 날짜/시간 등 — 디자인에서 정한 표시 형식 준수 여부 검사
3. Component: 초기 버전에서는 필요한 범위로 제한

## 로컬 실행 (다음 단계)

터미널에서 의존성 설치 후 개발 서버 실행:

```bash
cd design-qa
npm install
npm run dev
```

> 현재 환경에서 의존성 설치는 사용자의 네트워크/환경에 따라 수행해 주세요. 제가 원하시면 지금 설치를 시도해 드릴 수 있습니다.

---

만든 사람: (초기 스캐폴드)
