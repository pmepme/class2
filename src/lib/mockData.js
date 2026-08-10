export const initialCourses = [
  {
    id: 'course-library-guide',
    title: '새내기를 위한 학술정보관 이용 가이드',
    subtitle: '도서관 서비스를 가장 빠르게 시작하는 법',
    description: '자료 검색부터 전자자료 원문 이용까지, 학술정보관을 100% 활용하는 방법을 한 번에 익혀보세요.',
    category: '도서관 이용',
    level: '입문',
    duration: '18분',
    minutes: 18,
    language: 'KR · EN 자막',
    audience: '신입생 추천',
    videoId: 'M7lc1UVf-VE',
    accent: 'violet',
    published: true,
    updatedAt: '2026. 03. 02',
    materialName: '학술정보관_이용_가이드.pdf',
    materials: [{ id: 'material-library-guide', name: '학술정보관_이용_가이드.pdf', url: '#' }],
  },
  {
    id: 'course-search',
    title: '논문 검색의 기술: 키워드에서 원문까지',
    subtitle: '리서치 시간을 줄이는 검색 전략',
    description: '검색어 설계, 필터 활용, 인용 정보 확인까지 과제와 연구에 바로 쓰는 검색 루틴을 배웁니다.',
    category: '연구·학습',
    level: '기초',
    duration: '24분',
    minutes: 24,
    language: 'KR · EN 자막',
    audience: '과제 전 필수',
    videoId: 'M7lc1UVf-VE',
    accent: 'cyan',
    published: true,
    updatedAt: '2026. 03. 10',
    materialName: '논문_검색_치트시트.pdf',
    materials: [{ id: 'material-search', name: '논문_검색_치트시트.pdf', url: '#' }],
  },
  {
    id: 'course-citation',
    title: '표절 없이 쓰는 인용·참고문헌',
    subtitle: '신뢰할 수 있는 글쓰기의 기본',
    description: '직접 인용과 간접 인용의 차이부터 참고문헌 정리까지, 학술 글쓰기의 기본 규칙을 정리합니다.',
    category: '연구·학습',
    level: '기초',
    duration: '21분',
    minutes: 21,
    language: 'KR 자막',
    audience: '리포트 작성 전',
    videoId: 'M7lc1UVf-VE',
    accent: 'orange',
    published: true,
    updatedAt: '2026. 03. 15',
    materialName: '인용_참고문헌_템플릿.docx',
    materials: [{ id: 'material-citation', name: '인용_참고문헌_템플릿.docx', url: '#' }],
  },
  {
    id: 'course-database',
    title: '전공별 학술 데이터베이스 길잡이',
    subtitle: '내 전공에 맞는 자료원을 찾는 법',
    description: '경영·인문·공학 전공별 추천 DB와 원격접속 방법을 알아보고, 좋은 자료를 빠르게 선별합니다.',
    category: '전자자료',
    level: '중급',
    duration: '32분',
    minutes: 32,
    language: 'EN · KR 자막',
    audience: '전공 심화',
    videoId: 'M7lc1UVf-VE',
    accent: 'blue',
    published: true,
    updatedAt: '2026. 03. 21',
    materialName: '전공별_DB_가이드.pdf',
    materials: [{ id: 'material-database', name: '전공별_DB_가이드.pdf', url: '#' }],
  },
];

export const initialStudents = [
  { userId: 'u-minseo', name: '김민서', identifier: '20261234', role: 'student', active: true },
  { userId: 'u-aisha', name: 'Aisha Rahman', identifier: '20250117', role: 'student', active: true },
  { userId: 'u-junho', name: '이준호', identifier: '20241108', role: 'student', active: true },
  { userId: 'u-admin', name: '교육 담당자', identifier: 'ADMIN2026', role: 'admin', active: true },
];

export const initialEnrollments = {
  'u-minseo': {
    'course-library-guide': { enrolledAt: '2026-03-12', progress: 68, lastPosition: 734 },
    'course-search': { enrolledAt: '2026-03-18', progress: 34, lastPosition: 490 },
    'course-citation': { enrolledAt: '2026-03-22', progress: 100, lastPosition: 1260 },
  },
  'u-aisha': {
    'course-library-guide': { enrolledAt: '2026-03-11', progress: 52, lastPosition: 565 },
  },
  'u-junho': {
    'course-search': { enrolledAt: '2026-03-17', progress: 12, lastPosition: 170 },
    'course-database': { enrolledAt: '2026-03-20', progress: 100, lastPosition: 1920 },
  },
};

export const categories = ['전체', '도서관 이용', '연구·학습', '전자자료'];

export const storageKeys = {
  courses: 'library-learn-courses',
  students: 'library-learn-students',
  enrollments: 'library-learn-enrollments',
};
