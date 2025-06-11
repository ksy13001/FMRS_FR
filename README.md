# Soccer Player Profile - React Migration

Thymeleaf에서 React로 마이그레이션된 축구 선수 프로필 시스템입니다.

## 개발 환경 설정

### 1. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_DEV_MODE=true
\`\`\`

### 2. 개발 서버 실행

#### Frontend (Next.js) - 포트 3000
\`\`\`bash
npm install
npm run dev
\`\`\`

#### Backend (Spring Boot) - 포트 8080
백엔드 서버가 `http://localhost:8080`에서 실행되고 있는지 확인하세요.

### 3. API 엔드포인트

백엔드에서 다음 API들이 제공되어야 합니다:

- `GET /api/search/simple-player/{name}` - 간단한 플레이어 검색
- `POST /api/search/detail-player` - 상세 검색  
- `GET /players/{id}` - 플레이어 상세 정보

### 4. 페이지 구조

- `/` - 홈페이지 (플레이어 검색)
- `/players/detail-search` - 상세 검색 페이지
- `/players/[id]` - 플레이어 상세 페이지

## 주요 기능

### 홈페이지
- 실시간 플레이어 검색 (debounced)
- 검색 결과 드롭다운
- 무한 스크롤 지원

### 상세 검색
- 나이, 국적 필터
- 기술/정신/신체 속성 필터
- 포지션 맵 인터랙션
- 페이지네이션 및 정렬

### 플레이어 상세
- 선수 기본 정보
- 시즌 통계
- 포지션 맵 시각화
- 속성 바 차트

## 프로젝트 구조

\`\`\`
app/
├── api/                    # API 라우트
│   ├── players/[id]/      # 플레이어 상세 API
│   └── search/            # 검색 API
├── players/               # 플레이어 관련 페이지
│   ├── detail-search/     # 상세 검색 페이지
│   └── [id]/             # 플레이어 상세 페이지
├── globals.css           # 전역 스타일
├── layout.tsx           # 루트 레이아웃
└── page.tsx            # 홈페이지

components/
├── layout/             # 레이아웃 컴포넌트
│   ├── header.tsx
│   └── footer.tsx
└── position-map.tsx   # 포지션 맵 컴포넌트
\`\`\`

## 트러블슈팅

### 백엔드 연결 실패
- 백엔드 서버가 `http://localhost:8080`에서 실행 중인지 확인
- `.env.local`의 `BACKEND_URL` 설정 확인

### 검색 결과가 나오지 않음
- 브라우저 개발자 도구에서 네트워크 탭 확인
- API 응답 형식과 프론트엔드 인터페이스 일치 여부 확인

### 이미지가 표시되지 않음
- 이미지 URL 경로 확인
- Next.js 이미지 도메인 설정 확인
