import { useEffect, useMemo, useRef, useState } from 'react';
import {
  categories,
  initialCourses,
  initialEnrollments,
  initialStudents,
  storageKeys,
} from './lib/mockData';
import {
  ensureEnrollment,
  getCourses,
  getEnrollments,
  getSession,
  getStudents,
  resetDemoData,
  saveCourses,
  saveEnrollments,
  saveStudents,
  setSession,
} from './lib/storage';
import { isAdminSession, verifyAdminAccess, verifyStudentAccess } from './lib/appScriptAuth';

function Icon({ name, size = 18, stroke = 1.8 }) {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    arrowLeft: <><path d="m12 19-7-7 7-7"/><path d="M5 12h14"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 6h8M8 10h6"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    chevron: <><path d="m6 9 6 6 6-6"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    external: <><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    lock: <><rect width="16" height="12" x="4" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06A1.7 1.7 0 0 0 16.44 18a1.7 1.7 0 0 0-1.03 1.56V20h-2.02v-.08A1.7 1.7 0 0 0 12.36 18a1.7 1.7 0 0 0-1.88.34l-.06.06L9 16.98l.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2.02h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06A1.7 1.7 0 0 0 12.36 8a1.7 1.7 0 0 0 1.03-1.56V6h2.02v.44A1.7 1.7 0 0 0 16.44 8a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11c.19.58.74.97 1.36.97H21v2.02h-.24c-.62 0-1.17.39-1.36 1.01Z"/></>,
    trash: <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6M14 11v6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    x: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function App() {
  const [courses, setCourses] = useState(getCourses);
  const [students, setStudents] = useState(getStudents);
  const [enrollments, setEnrollments] = useState(getEnrollments);
  const [session, setSessionState] = useState(getSession);
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [authReason, setAuthReason] = useState('');
  const [notice, setNotice] = useState(null);
  const [language, setLanguage] = useState('KR');

  useEffect(() => { saveCourses(courses); }, [courses]);
  useEffect(() => { saveStudents(students); }, [students]);
  useEffect(() => { saveEnrollments(enrollments); }, [enrollments]);
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === storageKeys.courses) setCourses(getCourses());
      if (event.key === storageKeys.students) setStudents(getStudents());
      if (event.key === storageKeys.enrollments) setEnrollments(getEnrollments());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const navigateHome = () => { setView('home'); setSelectedCourse(null); };
  const openAuth = (reason = '') => { setAuthReason(reason); setView('auth'); };
  const handleSignOut = () => { setSession(null); setSessionState(null); setNotice({ type: 'info', text: '로그아웃되었습니다.' }); navigateHome(); };
  const openAdmin = () => { setView(isAdminSession(session) ? 'admin' : 'admin-auth'); };
  const handleAuth = async (credentials) => {
    const result = await verifyStudentAccess(credentials);
    if (!result.approved) return result;
    const user = {
      userId: result.userId,
      displayName: result.displayName,
      role: 'student',
      authProvider: 'apps-script',
      authenticatedAt: new Date().toISOString(),
    };
    setSession(user);
    setSessionState(user);
    setNotice({ type: 'success', text: `${user.displayName}님, 인증이 완료되었습니다.` });
    if (authReason && courses.some((course) => course.id === authReason)) {
      const course = courses.find((item) => item.id === authReason);
      setSelectedCourse(course);
      setView('home');
    } else setView('home');
    setAuthReason('');
    return { ...result, approved: true };
  };
  const handleAdminAuth = async (credentials) => {
    const result = await verifyAdminAccess(credentials);
    if (!result.approved) return result;
    const adminUser = {
      userId: result.userId,
      displayName: result.displayName,
      role: 'admin',
      authProvider: 'apps-script',
      authenticatedAt: new Date().toISOString(),
      expiresAt: Date.now() + (8 * 60 * 60 * 1000),
    };
    setSession(adminUser);
    setSessionState(adminUser);
    setNotice({ type: 'success', text: `${adminUser.displayName}님, 관리자 인증이 완료되었습니다.` });
    setView('admin');
    return { ...result, approved: true };
  };
  const askToEnroll = (course) => {
    if (!session) { openAuth(course.id); return; }
    if (enrollments[session.userId]?.[course.id]) {
      setSelectedCourse(course);
      setView('learn');
      return;
    }
    setSelectedCourse(course);
  };
  const enroll = () => {
    if (!session || !selectedCourse) return;
    const next = ensureEnrollment(enrollments, session.userId, selectedCourse.id);
    setEnrollments(next);
    setNotice({ type: 'success', text: '수강 신청이 저장되었습니다.' });
    setView('learn');
  };
  const updateProgress = (courseId, progress, lastPosition = 0) => {
    if (!session) return;
    const next = ensureEnrollment(enrollments, session.userId, courseId);
    next[session.userId][courseId] = {
      ...next[session.userId][courseId],
      progress: Math.round(Number(progress)),
      lastPosition,
      updatedAt: new Date().toISOString(),
    };
    setEnrollments(next);
  };
  const reset = () => {
    resetDemoData();
    setCourses(initialCourses);
    setStudents(initialStudents);
    setEnrollments(initialEnrollments);
    setSessionState(null);
    setView('home');
    setNotice({ type: 'info', text: '데모 데이터가 초기화되었습니다.' });
  };

  return <div className="app-shell">
    <Header session={session} view={view} language={language} setLanguage={setLanguage} onHome={navigateHome} onAuth={() => openAuth()} onMyPage={() => session ? setView('mypage') : openAuth()} onAdmin={openAdmin} onSignOut={handleSignOut} />
    {notice && <Toast notice={notice} onClose={() => setNotice(null)} />}
    <main>
      {view === 'home' && <HomePage courses={courses} session={session} enrollments={enrollments} language={language} onSelect={askToEnroll} onAuth={() => openAuth()} />}
      {view === 'auth' && <AuthPage onSubmit={handleAuth} onBack={navigateHome} reason={authReason} language={language} />}
      {view === 'admin-auth' && <AdminAuthPage onSubmit={handleAdminAuth} onBack={navigateHome} />}
      {view === 'learn' && selectedCourse && session && <LearnPage course={selectedCourse} enrollment={enrollments[session.userId]?.[selectedCourse.id]} onBack={navigateHome} onProgress={updateProgress} onDownload={(course, material) => setNotice({ type: 'success', text: `${material?.name || course.materialName || '강의자료'} 다운로드를 시작합니다.` })} />}
      {view === 'mypage' && session && <MyPage session={session} courses={courses} enrollments={enrollments[session.userId] || {}} onSelect={askToEnroll} onHome={navigateHome} />}
      {view === 'admin' && isAdminSession(session) && <AdminPage courses={courses} setCourses={setCourses} students={students} setStudents={setStudents} enrollments={enrollments} onReset={reset} onNotice={setNotice} />}
    </main>
    <Footer />
    {selectedCourse && view === 'home' && <EnrollmentModal course={selectedCourse} onConfirm={enroll} onCancel={() => setSelectedCourse(null)} />}
  </div>;
}

function Header({ session, view, language, setLanguage, onHome, onAuth, onMyPage, onAdmin, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <header className="site-header">
    <div className="header-inner">
      <button className="brand" onClick={onHome} aria-label="Library Learn 홈">
        <span className="brand-mark"><Icon name="book" size={19} /></span>
        <span><strong>LIBRARY</strong><em>LEARN</em></span>
      </button>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="주요 메뉴">
        <button className={view === 'home' ? 'active' : ''} onClick={() => { onHome(); setMobileOpen(false); }}>교육 둘러보기</button>
        <button className={view === 'mypage' ? 'active' : ''} onClick={() => { onMyPage(); setMobileOpen(false); }}>내 학습</button>
        <button className={view === 'admin' ? 'active' : ''} onClick={() => { onAdmin(); setMobileOpen(false); }}>관리자</button>
      </nav>
      <div className="header-actions">
        <button className="language-toggle" onClick={() => setLanguage(language === 'KR' ? 'EN' : 'KR')} aria-label="언어 변경">{language === 'KR' ? 'EN' : 'KR'}</button>
        {session ? <div className="user-menu"><button className="user-chip" onClick={onMyPage}><span className="avatar">{session.displayName.slice(0, 1)}</span><span>{session.displayName}</span><Icon name="chevron" size={14} /></button><button className="icon-button" onClick={onSignOut} aria-label="로그아웃" title="로그아웃"><Icon name="logout" size={17} /></button></div> : <button className="button button-dark button-small" onClick={onAuth}><Icon name="lock" size={15} /> 인증하기</button>}
      </div>
      <button className="mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="메뉴"><Icon name="menu" /></button>
    </div>
  </header>;
}

function HomePage({ courses, session, enrollments, language, onSelect, onAuth }) {
  const [category, setCategory] = useState('전체');
  const [search, setSearch] = useState('');
  const visibleCourses = useMemo(() => courses.filter((course) => course.published && (category === '전체' || course.category === category) && `${course.title} ${course.subtitle} ${course.category}`.toLowerCase().includes(search.toLowerCase())), [courses, category, search]);
  const copy = language === 'EN' ? { eyebrow: 'ACADEMIC INFORMATION CENTER', title: <>Learn a little.<br /><span>Go further.</span></>, description: 'Short, practical video lessons to help you research better, study smarter, and make the most of your library.', search: 'Search courses', browse: 'Browse all', signIn: 'Verify to start learning' } : { eyebrow: 'ACADEMIC INFORMATION CENTER', title: <>배움은 가볍게,<br /><span>성장은 깊게.</span></>, description: '학술정보관이 준비한 짧고 실용적인 영상 교육으로, 더 잘 찾고 더 깊이 공부하는 습관을 시작해보세요.', search: '교육 이름, 주제 검색', browse: '전체 교육 보기', signIn: '인증하고 학습 시작하기' };
  return <>
    <section className="hero-section">
      <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
      <div className="page-width hero-content">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> {copy.eyebrow}</p><h1>{copy.title}</h1><p className="hero-description">{copy.description}</p><div className="hero-actions"><button className="button button-primary" onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}>{copy.browse} <Icon name="arrow" size={17} /></button>{!session && <button className="text-button" onClick={onAuth}>{copy.signIn} <Icon name="arrow" size={15} /></button>}</div></div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><Icon name="book" size={37} /></div><span className="orbit-card orbit-card-a">01 <b>Find</b></span><span className="orbit-card orbit-card-b">02 <b>Learn</b></span><span className="orbit-card orbit-card-c">03 <b>Grow</b></span></div>
      </div>
    </section>
    <section className="insight-strip"><div className="page-width insight-grid"><div><span className="insight-number">04</span><span>개설된 교육</span></div><div><span className="insight-number">50%</span><span>수료 기준</span></div><div><span className="insight-number">KR·EN</span><span>자막 지원</span></div><div className="insight-note"><Icon name="check" size={17} /><span>모든 교육은 무료로 제공됩니다</span></div></div></section>
    <section className="courses-section page-width" id="courses"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOUR CAMPUS</p><h2>지금 시작할 수 있는 교육</h2></div><div className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} aria-label={copy.search} /></div></div><div className="filter-row">{categories.map((item) => <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}<span className="course-count">{visibleCourses.length} courses</span></div><div className="course-grid">{visibleCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} enrollment={session ? enrollments[session.userId]?.[course.id] : null} onSelect={onSelect} />)}</div>{visibleCourses.length === 0 && <div className="empty-state"><Icon name="search" size={24} /><h3>검색 결과가 없습니다</h3><p>다른 키워드나 카테고리로 다시 찾아보세요.</p></div>}</section>
    <section className="confidence-section page-width"><div className="confidence-card"><div><p className="eyebrow">MADE FOR REAL STUDY</p><h2>내 속도에 맞는<br />학술정보관 수업</h2></div><div className="confidence-points"><div><span>01</span><p><strong>배속과 자막</strong><br />필요한 만큼 천천히, 혹은 빠르게</p></div><div><span>02</span><p><strong>수강률 자동 저장</strong><br />마지막으로 본 곳부터 이어보기</p></div><div><span>03</span><p><strong>한눈에 보는 내 학습</strong><br />수강 중과 완료 교육을 구분</p></div></div></div></section>
  </>;
}

function CourseCard({ course, enrollment, onSelect, index }) {
  const progress = enrollment?.progress || 0;
  return <article className={`course-card accent-${course.accent}`} style={{ '--delay': `${index * 70}ms` }}><div className="course-art"><div className="art-grain" /><span className="art-label">{course.category}</span><div className="art-symbol"><Icon name={course.category === '전자자료' ? 'search' : course.category === '연구·학습' ? 'chart' : 'book'} size={32} /></div><span className="art-index">0{index + 1}</span></div><div className="course-card-body"><div className="course-meta"><span>{course.level}</span><span>{course.duration}</span></div><h3>{course.title}</h3><p>{course.subtitle}</p><div className="course-footer"><div>{enrollment ? <><span className={`status-dot ${progress >= 50 ? 'done' : 'ongoing'}`} />{progress >= 50 ? '수강 완료' : `수강 중 ${progress}%`}</> : <>{course.audience}</>}</div><button className="card-arrow" onClick={() => onSelect(course)} aria-label={`${course.title} 수강하기`}><Icon name="arrow" size={17} /></button></div>{enrollment && <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>}</div></article>;
}

function AuthPage({ onSubmit, onBack, reason, language }) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ name, identifier });
      if (!result?.approved) setError(result?.message || '입력한 정보가 올바르지 않습니다. 이름과 학번/사번을 확인해 주세요.');
    } catch (submitError) {
      setError(submitError.message || '인증 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section className="auth-page page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록으로</button><div className="auth-layout"><div className="auth-intro"><p className="eyebrow"><span className="eyebrow-dot" /> PRIVATE ACCESS</p><h1>학습을 시작하기 전,<br /><span>학생 인증</span>이 필요해요.</h1><p>이름과 학번 또는 사번으로 간편하게 인증합니다. Apps Script의 참여자 명단과 실시간으로 대조합니다.</p><div className="privacy-note"><Icon name="lock" size={17} /><span>개인정보 보호를 위해 인증 정보는 로그에 남기지 않습니다.</span></div></div><form className="auth-card" onSubmit={submit}><div className="auth-card-heading"><span className="step-pill">STEP 01 / VERIFY</span><h2>{language === 'EN' ? 'Verify your identity' : '학생 정보 입력'}</h2><p>현재 Google Sheets에 등록된 정보와 일치해야 합니다.</p></div><label>이름<input value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="홍길동 / Alex Kim" autoComplete="name" required /></label><label>학번 또는 사번<input value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(''); }} placeholder="예: 20261234" autoComplete="off" required /></label>{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}<button className="button button-dark button-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? '명단 확인 중...' : '인증하고 계속하기'} {!isSubmitting && <Icon name="arrow" size={17} />}</button><div className="demo-login"><span>LIVE DIRECTORY</span><p>참여자 명단은 Apps Script가 연결된 Google Sheets를 기준으로 확인합니다.</p></div></form></div>{reason && <p className="auth-context">선택한 교육을 계속 신청하려면 먼저 인증해 주세요.</p>}</section>;
}

function AdminAuthPage({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ name, identifier });
      if (!result?.approved) setError(result?.message || '관리자 명단과 일치하지 않습니다. 이름과 학번/사번을 확인해 주세요.');
    } catch (submitError) {
      setError(submitError.message || '관리자 인증 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <section className="auth-page admin-auth-page page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록으로</button><div className="auth-layout"><div className="auth-intro"><p className="eyebrow"><span className="eyebrow-dot" /> RESTRICTED ACCESS</p><h1>관리자 페이지는<br /><span>승인된 담당자</span>만 이용할 수 있어요.</h1><p>관리자로 등록된 이름과 학번 또는 사번을 입력하면 Apps Script의 허용 명단과 대조해 접근을 승인합니다.</p><div className="privacy-note"><Icon name="lock" size={17} /><span>입력한 정보는 관리자 인증 요청에만 사용합니다.</span></div></div><form className="auth-card" onSubmit={submit}><div className="auth-card-heading"><span className="step-pill">ADMIN ACCESS / VERIFY</span><h2>관리자 정보 입력</h2><p>승인된 담당자 정보만 관리자 화면에 접근할 수 있어요.</p></div><label>관리자 이름<input value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="홍길동" autoComplete="name" required /></label><label>학번 또는 사번<input value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(''); }} placeholder="예: 20261234 / ADMIN2026" autoComplete="off" required /></label>{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}<button className="button button-dark button-wide" type="submit" disabled={isSubmitting}>{isSubmitting ? '인증 확인 중...' : '관리자 인증하기'} {!isSubmitting && <Icon name="arrow" size={17} />}</button><div className="demo-login admin-auth-note"><span>SECURE CHECK</span><p>Apps Script가 승인한 결과가 확인될 때만 관리자 세션을 생성합니다.</p></div></form></div></section>;
}

function EnrollmentModal({ course, onConfirm, onCancel }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="enroll-title"><button className="modal-close" onClick={onCancel} aria-label="닫기"><Icon name="x" size={19} /></button><div className={`modal-icon accent-${course.accent}`}><Icon name="book" size={24} /></div><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="enroll-title">교육을 수강하시겠습니까?</h2><p className="modal-course">{course.title}</p><p className="modal-description">신청 후 바로 영상 수강 화면으로 이동합니다. 수강률은 자동으로 저장됩니다.</p><div className="modal-actions"><button className="button button-ghost" onClick={onCancel}>아니오</button><button className="button button-primary" onClick={onConfirm}>예(수강 신청) <Icon name="arrow" size={16} /></button></div></div></div>;
}

function getCourseMaterials(course) {
  if (Array.isArray(course.materials)) return course.materials;
  return course.materialName ? [{ id: `${course.id}-material-1`, name: course.materialName, url: course.materialUrl || '#' }] : [];
}

function extractYouTubeId(value) {
  const input = value.trim();
  if (!input) return '';
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || '';
    if (host.includes('youtube')) {
      const queryId = url.searchParams.get('v');
      if (queryId) return queryId;
      const segments = url.pathname.split('/').filter(Boolean);
      const markerIndex = segments.findIndex((segment) => ['embed', 'shorts', 'live', 'v'].includes(segment));
      return markerIndex >= 0 ? segments[markerIndex + 1] || '' : '';
    }
  } catch {
    // 입력값이 URL이 아닌 영상 ID인 경우 그대로 사용합니다.
  }
  return input.replace(/^.*(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?v=))/, '').split(/[?&#/]/)[0];
}

function formatAdminDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}. ${month}. ${day}`;
}

let youtubeApiPromise;

function loadYouTubeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API는 브라우저에서만 사용할 수 있습니다.'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]') || document.createElement('script');
    let timeoutId;
    const finish = () => {
      window.clearInterval(timeoutId);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube 플레이어 API를 불러오지 못했습니다.'));
    };
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      finish();
    };
    if (!script.src) {
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('YouTube 플레이어 API 연결에 실패했습니다.'));
      document.head.appendChild(script);
    }
    timeoutId = window.setInterval(() => {
      if (window.YT?.Player) finish();
    }, 100);
    window.setTimeout(() => {
      if (!window.YT?.Player) {
        window.clearInterval(timeoutId);
        reject(new Error('YouTube 플레이어 API 응답 시간이 초과되었습니다.'));
      }
    }, 10000);
  });
  return youtubeApiPromise;
}

function LearnPage({ course, enrollment, onBack, onProgress, onDownload }) {
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const onProgressRef = useRef(onProgress);
  const [progress, setProgress] = useState(Number(enrollment?.progress) || 0);
  const [speed, setSpeed] = useState('1.0');
  const [caption, setCaption] = useState('ko');
  const [savedAt, setSavedAt] = useState('');
  const [showControls, setShowControls] = useState(false);
  const [playerMode, setPlayerMode] = useState('loading');
  const [durationSeconds, setDurationSeconds] = useState((Number(course.minutes) || 0) * 60);
  const embedUrl = `https://www.youtube.com/embed/${course.videoId}?enablejsapi=1&cc_load_policy=1&cc_lang_pref=${caption}&playsinline=1&rel=0`;
  const materials = getCourseMaterials(course);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  useEffect(() => {
    let cancelled = false;
    let syncTimer;
    const syncProgress = () => {
      if (cancelled) return;
      const player = playerRef.current;
      if (!player?.getCurrentTime || !player?.getDuration) return;
      const duration = Number(player.getDuration());
      const currentTime = Number(player.getCurrentTime());
      if (!duration || !Number.isFinite(currentTime)) return;
      const nextProgress = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
      setDurationSeconds(duration);
      setProgress(nextProgress);
      onProgressRef.current(course.id, nextProgress, Math.round(currentTime));
    };
    const stopSync = () => {
      if (syncTimer) window.clearInterval(syncTimer);
      syncTimer = undefined;
    };
    const startSync = () => {
      stopSync();
      syncTimer = window.setInterval(syncProgress, 2000);
    };
    loadYouTubeApi().then((YT) => {
      if (cancelled || !playerHostRef.current) return;
      playerRef.current = new YT.Player(playerHostRef.current, {
        videoId: course.videoId,
        playerVars: { enablejsapi: 1, cc_load_policy: 1, cc_lang_pref: caption, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            const duration = Number(event.target.getDuration());
            if (duration) setDurationSeconds(duration);
            if (enrollment?.lastPosition) event.target.seekTo(Number(enrollment.lastPosition), true);
            setPlayerMode('ready');
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) startSync();
            else {
              syncProgress();
              stopSync();
            }
          },
          onError: () => {
            playerRef.current?.destroy?.();
            playerRef.current = null;
            setPlayerMode('fallback');
          },
        },
      });
    }).catch(() => {
      if (!cancelled) setPlayerMode('fallback');
    });
    return () => {
      cancelled = true;
      stopSync();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [course.id, course.videoId]);

  const sendPlayerCommand = (func, args = []) => {
    const player = playerRef.current;
    if (player?.[func]) player[func](...args);
    else playerHostRef.current?.querySelector('iframe')?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  };
  const save = () => {
    const playerTime = Number(playerRef.current?.getCurrentTime?.());
    const fallbackTime = durationSeconds ? (durationSeconds * progress) / 100 : 0;
    onProgress(course.id, Number(progress), Math.round(Number.isFinite(playerTime) ? playerTime : fallbackTime));
    setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    setShowControls(false);
  };
  const seekToProgress = (value) => {
    const nextProgress = Number(value);
    setProgress(nextProgress);
    setShowControls(true);
    if (playerRef.current?.seekTo && durationSeconds) playerRef.current.seekTo((durationSeconds * nextProgress) / 100, true);
  };
  useEffect(() => { setProgress(Number(enrollment?.progress) || 0); }, [enrollment?.progress]);
  useEffect(() => {
    if (playerMode === 'ready' && playerRef.current?.setOption) {
      playerRef.current.setOption('captions', 'track', { language: caption });
    }
  }, [caption, playerMode]);
  return <section className="learn-page"><div className="learn-topbar page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록</button><span className="learn-label">NOW LEARNING</span><span className="learn-course-number">{course.category} / {course.level}</span></div><div className="learn-layout page-width"><div className="video-column"><div className="video-frame">{playerMode === 'fallback' ? <iframe title={course.title} src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div ref={playerHostRef} className="youtube-player-host" />}{playerMode === 'loading' && <div className="video-loading">YouTube 플레이어 연결 중...</div>}</div><div className="video-underbar"><div><span className="player-overline">YOUR PROGRESS</span><strong>{progress}% <small>{progress >= 50 ? '수강 완료' : '수강 중'}</small></strong></div><button className="button button-small button-dark" onClick={save}><Icon name="check" size={15} /> 진행률 저장</button></div><div className="range-wrap"><input type="range" min="0" max="100" value={progress} onChange={(event) => seekToProgress(event.target.value)} aria-label="수강률" /><div className="range-labels"><span>시작</span><span>{course.duration} · 50% 이상 수료</span><span>완료</span></div></div>{showControls && <p className="save-hint">영상 재생 위치를 변경했습니다. 현재 위치와 수강률을 저장하려면 <button onClick={save}>지금 저장</button>하세요.</p>}{savedAt && <p className="saved-time"><Icon name="check" size={14} /> {savedAt}에 진행률을 저장했습니다.</p>}<div className="player-tools"><div><span className="tool-label">배속</span>{['1.0', '1.25', '1.5', '2.0'].map((item) => <button key={item} className={speed === item ? 'selected' : ''} onClick={() => { setSpeed(item); sendPlayerCommand('setPlaybackRate', [Number(item)]); }}>{item}x</button>)}</div><div><span className="tool-label">자막</span><button className={caption === 'ko' ? 'selected' : ''} onClick={() => setCaption('ko')}>한국어</button><button className={caption === 'en' ? 'selected' : ''} onClick={() => setCaption('en')}>English</button></div></div></div><aside className="lesson-sidebar"><p className="eyebrow">LESSON 01</p><h1>{course.title}</h1><p className="lesson-subtitle">{course.subtitle}</p><div className="sidebar-divider" /><div className="lesson-facts"><div><span>교육 시간</span><strong>{course.duration}</strong></div><div><span>난이도</span><strong>{course.level}</strong></div><div><span>업데이트</span><strong>{course.updatedAt}</strong></div></div><div className="material-list">{materials.length ? materials.map((material) => <div className="material-card" key={material.id}><div className="material-icon"><Icon name="download" size={20} /></div><div><strong>강의자료</strong><span>{material.name}</span></div>{material.url && material.url !== '#' ? <a href={material.url} target="_blank" rel="noreferrer" aria-label={`${material.name} 다운로드`}><Icon name="external" size={16} /></a> : <button onClick={() => onDownload(course, material)} aria-label="강의자료 다운로드"><Icon name="download" size={17} /></button>}</div>) : <div className="material-card material-empty"><div className="material-icon"><Icon name="book" size={18} /></div><div><strong>강의자료</strong><span>등록된 자료가 없습니다.</span></div></div>}</div><div className="lesson-tip"><span>TIP</span><p>자막은 영상 플레이어의 CC 버튼에서도 언어를 바꿀 수 있어요.</p></div></aside></div></section>;
}

function MyPage({ session, courses, enrollments, onSelect, onHome }) {
  const entries = courses.filter((course) => enrollments[course.id]);
  const ongoing = entries.filter((course) => enrollments[course.id].progress < 50);
  const completed = entries.filter((course) => enrollments[course.id].progress >= 50);
  return <section className="mypage page-width"><div className="mypage-head"><div><p className="eyebrow">MY LEARNING</p><h1>안녕하세요, {session.displayName}님.</h1><p>오늘도 한 걸음씩, 내 속도로 학습해보세요.</p></div><div className="profile-badge"><span className="avatar avatar-large">{session.displayName.slice(0, 1)}</span><div><strong>{session.displayName}</strong><span>학생 인증 완료</span></div></div></div><div className="learning-summary"><div><span>신청한 교육</span><strong>{entries.length}<small>개</small></strong></div><div><span>수강 중</span><strong>{ongoing.length}<small>개</small></strong></div><div><span>수강 완료</span><strong>{completed.length}<small>개</small></strong></div></div><LearningGroup title="수강 중인 교육" courses={ongoing} enrollments={enrollments} onSelect={onSelect} emptyText="아직 수강 중인 교육이 없어요." /><LearningGroup title="수강 완료된 교육" courses={completed} enrollments={enrollments} onSelect={onSelect} emptyText="50% 이상 수강하면 이곳에서 확인할 수 있어요." /><button className="back-link mypage-home" onClick={onHome}><Icon name="arrowLeft" size={16} /> 교육 더 둘러보기</button></section>;
}

function LearningGroup({ title, courses, enrollments, onSelect, emptyText }) {
  return <section className="learning-group"><div className="group-heading"><h2>{title}</h2><span>{courses.length}</span></div>{courses.length ? <div className="learning-list">{courses.map((course) => <button className="learning-row" key={course.id} onClick={() => onSelect(course)}><div className={`learning-thumb accent-${course.accent}`}><Icon name="play" size={18} /></div><div className="learning-info"><strong>{course.title}</strong><span>{course.category} · {course.duration}</span><div className="row-progress"><i style={{ width: `${enrollments[course.id].progress}%` }} /></div></div><div className="learning-status"><strong>{enrollments[course.id].progress}%</strong><span>{enrollments[course.id].progress >= 50 ? '수강 완료' : '수강 중'}</span></div><Icon name="arrow" size={17} /></button>)}</div> : <div className="group-empty"><Icon name="book" size={22} /><p>{emptyText}</p></div>}</section>;
}

function AdminPage({ courses, setCourses, students, setStudents, enrollments, onReset, onNotice }) {
  const [tab, setTab] = useState('overview');
  const allEnrollments = Object.entries(enrollments).flatMap(([userId, items]) => Object.entries(items).map(([courseId, data]) => ({ userId, courseId, ...data })));
  const exportCsv = () => { const rows = [['student_id', 'student_name', 'course_title', 'progress', 'status', 'enrolled_at'], ...allEnrollments.map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return [student?.identifier || '', student?.name || '', course?.title || '', `${item.progress}%`, item.progress >= 50 ? '수강 완료' : '수강 중', item.enrolledAt || '']; })]; const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'library-learn-enrollments.csv'; link.click(); URL.revokeObjectURL(url); onNotice({ type: 'success', text: '수강 데이터 CSV를 내보냈습니다.' }); };
  const toggleStudent = (userId) => setStudents(students.map((student) => student.userId === userId ? { ...student, active: !student.active } : student));
  const toggleCourse = (courseId) => setCourses(courses.map((course) => course.id === courseId ? { ...course, published: !course.published } : course));
  const saveCourse = (nextCourse) => {
    setCourses(courses.some((course) => course.id === nextCourse.id)
      ? courses.map((course) => course.id === nextCourse.id ? nextCourse : course)
      : [...courses, nextCourse]);
    onNotice({ type: 'success', text: '교육 정보가 저장되었습니다.' });
  };
  const createCourse = () => ({
    id: `course-${Date.now()}`,
    title: '',
    subtitle: '',
    description: '',
    category: '도서관 이용',
    level: '입문',
    duration: '10분',
    minutes: 10,
    language: 'KR 자막',
    audience: '전체 학생',
    videoId: '',
    accent: 'violet',
    published: false,
    updatedAt: formatAdminDate(),
    materials: [],
  });
  return <section className="admin-page page-width"><div className="admin-head"><div><p className="eyebrow">OPERATIONS CONSOLE <span className="demo-pill">PROTECTED</span></p><h1>교육 운영 대시보드</h1><p>학생 인증 명단과 교육 콘텐츠, 수강 현황을 한 곳에서 관리합니다.</p></div><div className="admin-actions"><button className="button button-ghost button-small" onClick={onReset}>데모 초기화</button><button className="button button-dark button-small" onClick={exportCsv}><Icon name="download" size={15} /> 수강 데이터 CSV</button></div></div><div className="admin-tabs">{[['overview','개요'],['students','학생 명단'],['courses','교육 관리'],['enrollments','수강 현황']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'overview' && <><div className="admin-kpis"><Kpi label="등록 학생" value={students.filter((student) => student.role === 'student').length} suffix="명" icon="user" tone="violet" /><Kpi label="공개 교육" value={courses.filter((course) => course.published).length} suffix="개" icon="book" tone="cyan" /><Kpi label="전체 신청" value={allEnrollments.length} suffix="건" icon="chart" tone="orange" /><Kpi label="평균 수강률" value={allEnrollments.length ? Math.round(allEnrollments.reduce((sum, item) => sum + item.progress, 0) / allEnrollments.length) : 0} suffix="%" icon="check" tone="blue" /></div><div className="admin-panels"><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>최근 수강 신청</h2></div><button onClick={() => setTab('enrollments')}>전체 보기 <Icon name="arrow" size={14} /></button></div>{allEnrollments.slice(-4).reverse().map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="activity-row" key={`${item.userId}-${item.courseId}`}><span className="avatar avatar-small">{student?.name.slice(0,1)}</span><div><strong>{student?.name}</strong><span>{course?.title}</span></div><em>{item.progress}%</em></div>; })}</div><div className="admin-panel admin-notice"><span className="notice-icon"><Icon name="settings" size={20} /></span><p className="eyebrow">NEXT STEP</p><h2>실제 운영 전 확인할 것</h2><p>관리자 인증은 연결되었지만, 데이터는 아직 브라우저의 데모 저장소를 사용합니다. 실제 운영 전 백엔드 권한 검증을 추가하세요.</p><button onClick={() => setTab('students')}>명단 관리 열기 <Icon name="arrow" size={14} /></button></div></div></>}{tab === 'students' && <StudentsPanel students={students} onToggle={toggleStudent} />}{tab === 'courses' && <CoursesPanel courses={courses} onToggle={toggleCourse} onSave={saveCourse} onCreate={createCourse} />}{tab === 'enrollments' && <EnrollmentsPanel students={students} courses={courses} items={allEnrollments} />}</section>;
}

function Kpi({ label, value, suffix, icon, tone }) { return <div className={`kpi-card tone-${tone}`}><span className="kpi-icon"><Icon name={icon} size={18} /></span><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>; }

function StudentsPanel({ students, onToggle }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('name-asc');
  const visibleStudents = useMemo(() => students
    .filter((student) => status === 'all' || (status === 'active' ? student.active : !student.active))
    .filter((student) => `${student.name} ${student.identifier} ${student.role}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name-desc') return b.name.localeCompare(a.name, 'ko');
      if (sort === 'role') return a.role.localeCompare(b.role);
      if (sort === 'status') return Number(b.active) - Number(a.active);
      return a.name.localeCompare(b.name, 'ko');
    }), [students, search, status, sort]);
  return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">ACCESS LIST</p><h2>학생 명단</h2></div><span className="table-count">{visibleStudents.length} / {students.length} students</span></div><div className="admin-data-toolbar"><label className="admin-search"><Icon name="search" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이름·학번 검색" aria-label="학생 데이터 검색" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="학생 상태 필터"><option value="all">상태 전체</option><option value="active">활성만</option><option value="inactive">비활성만</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="학생 데이터 정렬"><option value="name-asc">이름 오름차순</option><option value="name-desc">이름 내림차순</option><option value="role">권한순</option><option value="status">활성 상태순</option></select></div><div className="data-table">{visibleStudents.length ? <><div className="table-row table-header"><span>이름</span><span>학번 / 사번</span><span>권한</span><span>상태</span><span /></div>{visibleStudents.map((student) => <div className="table-row" key={student.userId}><span className="name-cell"><span className="avatar avatar-small">{student.name.slice(0,1)}</span><strong>{student.name}</strong></span><span className="mono">{student.identifier}</span><span>{student.role === 'admin' ? '담당자' : '학생'}</span><span><span className={`active-status ${student.active ? 'on' : 'off'}`}><i />{student.active ? '활성' : '비활성'}</span></span><button className="table-action" onClick={() => onToggle(student.userId)}>{student.active ? '비활성화' : '활성화'}</button></div>)}</> : <div className="admin-empty">조건에 맞는 학생이 없습니다.</div>}</div></div>;
}

function CoursesPanel({ courses, onToggle, onSave, onCreate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('title-asc');
  const [editingCourse, setEditingCourse] = useState(null);
  const visibleCourses = useMemo(() => courses
    .filter((course) => category === 'all' || course.category === category)
    .filter((course) => status === 'all' || (status === 'published' ? course.published : !course.published))
    .filter((course) => `${course.title} ${course.subtitle} ${course.category} ${course.videoId}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === 'title-desc') return b.title.localeCompare(a.title, 'ko');
      if (sort === 'category') return a.category.localeCompare(b.category, 'ko');
      if (sort === 'status') return Number(b.published) - Number(a.published);
      return a.title.localeCompare(b.title, 'ko');
    }), [courses, search, category, status, sort]);
  return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>교육 관리</h2></div><button className="button button-dark button-small" onClick={() => setEditingCourse(onCreate())}><Icon name="plus" size={15} /> 교육 등록</button></div><div className="admin-data-toolbar"><label className="admin-search"><Icon name="search" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="교육명·영상 ID 검색" aria-label="교육 데이터 검색" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="교육 카테고리 필터"><option value="all">카테고리 전체</option>{categories.slice(1).map((item) => <option value={item} key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="교육 공개 상태 필터"><option value="all">공개 상태 전체</option><option value="published">공개만</option><option value="draft">비공개만</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="교육 데이터 정렬"><option value="title-asc">교육명 오름차순</option><option value="title-desc">교육명 내림차순</option><option value="category">카테고리순</option><option value="status">공개 상태순</option></select></div><div className="data-table course-table">{visibleCourses.length ? <><div className="course-table-row course-table-header"><span>교육명</span><span>카테고리</span><span>영상 ID</span><span>자료</span><span>상태</span><span>관리</span></div>{visibleCourses.map((course) => <div className="course-table-row" key={course.id}><span className="name-cell"><span className={`course-dot accent-${course.accent}`} /><strong title={course.title}>{course.title || '제목 없음'}</strong></span><span>{course.category}</span><span className="mono">{course.videoId || '미등록'}</span><span>{getCourseMaterials(course).length}개</span><span><span className={`active-status ${course.published ? 'on' : 'off'}`}><i />{course.published ? '공개' : '비공개'}</span></span><span className="table-actions"><button className="table-action" onClick={() => setEditingCourse(course)}><Icon name="edit" size={13} /> 편집</button><button className="table-action" onClick={() => onToggle(course.id)}>{course.published ? '비공개' : '공개'}</button></span></div>)}</> : <div className="admin-empty">조건에 맞는 교육이 없습니다.</div>}</div>{editingCourse && <CourseEditor key={editingCourse.id} course={editingCourse} onClose={() => setEditingCourse(null)} onSave={(nextCourse) => { onSave(nextCourse); setEditingCourse(null); }} />}</div>;
}

function CourseEditor({ course, onClose, onSave }) {
  const [draft, setDraft] = useState({ ...course, materials: getCourseMaterials(course).map((material) => ({ ...material })) });
  const [videoLink, setVideoLink] = useState(course.videoId ? `https://www.youtube.com/watch?v=${course.videoId}` : '');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [error, setError] = useState('');
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const addMaterial = () => {
    if (!newMaterialName.trim()) return;
    setDraft((current) => ({ ...current, materials: [...current.materials, { id: `${current.id}-material-${Date.now()}`, name: newMaterialName.trim(), url: newMaterialUrl.trim() || '#' }] }));
    setNewMaterialName('');
    setNewMaterialUrl('');
  };
  const removeMaterial = (materialId) => setDraft((current) => ({ ...current, materials: current.materials.filter((material) => material.id !== materialId) }));
  const save = (event) => {
    event.preventDefault();
    const videoId = extractYouTubeId(videoLink);
    if (!draft.title.trim()) { setError('교육명을 입력해 주세요.'); return; }
    if (!videoId) { setError('YouTube 영상 링크 또는 영상 ID를 입력해 주세요.'); return; }
    const minutes = Number.parseInt(String(draft.duration).replace(/[^0-9]/g, ''), 10) || Number(draft.minutes) || 0;
    onSave({ ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), description: draft.description.trim(), videoId, minutes, materialName: draft.materials[0]?.name || '', updatedAt: formatAdminDate() });
  };
  return <div className="modal-backdrop editor-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal admin-editor" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="course-editor-title"><button type="button" className="modal-close" onClick={onClose} aria-label="편집 닫기"><Icon name="x" size={19} /></button><div className="editor-heading"><p className="eyebrow">CONTENT EDITOR</p><h2 id="course-editor-title">{course.title ? '교육 정보 편집' : '새 교육 등록'}</h2><p>영상 링크, 교육 메타데이터와 강의 자료를 함께 관리합니다.</p></div><div className="editor-grid"><label>교육명<input value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="교육명을 입력하세요" required /></label><label>짧은 소개<input value={draft.subtitle} onChange={(event) => update('subtitle', event.target.value)} placeholder="교육 카드에 표시할 소개" /></label><label className="editor-wide">상세 설명<textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows="3" placeholder="교육 상세 설명" /></label><label>YouTube 영상 링크<input value={videoLink} onChange={(event) => { setVideoLink(event.target.value); setError(''); }} placeholder="https://www.youtube.com/watch?v=..." required /></label><label>카테고리<select value={draft.category} onChange={(event) => update('category', event.target.value)}>{categories.slice(1).map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>난이도<select value={draft.level} onChange={(event) => update('level', event.target.value)}><option>입문</option><option>기초</option><option>중급</option><option>고급</option></select></label><label>교육 시간<input value={draft.duration} onChange={(event) => update('duration', event.target.value)} placeholder="예: 18분" /></label><label>자막/언어<input value={draft.language} onChange={(event) => update('language', event.target.value)} placeholder="KR · EN 자막" /></label><label>추천 대상<input value={draft.audience} onChange={(event) => update('audience', event.target.value)} placeholder="신입생 추천" /></label><label>강조 색상<select value={draft.accent} onChange={(event) => update('accent', event.target.value)}><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="orange">Orange</option><option value="blue">Blue</option></select></label></div><section className="materials-editor"><div className="materials-heading"><div><p className="eyebrow">LECTURE MATERIALS</p><h3>강의 자료</h3></div><span>{draft.materials.length}개</span></div>{draft.materials.length ? <div className="materials-list">{draft.materials.map((material) => <div className="material-editor-row" key={material.id}><div className="material-icon"><Icon name="download" size={16} /></div><div><strong>{material.name}</strong><span>{material.url === '#' ? '다운로드 링크 미등록' : material.url}</span></div><button type="button" className="icon-button material-delete" onClick={() => removeMaterial(material.id)} aria-label={`${material.name} 삭제`}><Icon name="trash" size={15} /></button></div>)}</div> : <div className="admin-empty material-editor-empty">등록된 강의 자료가 없습니다.</div>}<div className="material-add-row"><input value={newMaterialName} onChange={(event) => setNewMaterialName(event.target.value)} placeholder="자료명 (예: 검색 치트시트.pdf)" aria-label="추가할 자료명" /><input value={newMaterialUrl} onChange={(event) => setNewMaterialUrl(event.target.value)} placeholder="자료 URL (선택)" aria-label="추가할 자료 URL" /><button type="button" className="button button-ghost button-small" onClick={addMaterial}><Icon name="plus" size={14} /> 자료 추가</button></div></section>{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}<div className="editor-footer"><label className="publish-toggle"><input type="checkbox" checked={draft.published} onChange={(event) => update('published', event.target.checked)} /><span>교육 공개</span></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>취소</button><button type="submit" className="button button-primary"><Icon name="check" size={16} /> 저장하기</button></div></div></form></div>;
}

function EnrollmentsPanel({ students, courses, items }) {
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const studentById = useMemo(() => Object.fromEntries(students.map((student) => [student.userId, student])), [students]);
  const courseById = useMemo(() => Object.fromEntries(courses.map((course) => [course.id, course])), [courses]);
  const filteredItems = useMemo(() => items
    .filter((item) => courseId === 'all' || item.courseId === courseId)
    .filter((item) => status === 'all' || (status === 'completed' ? item.progress >= 50 : item.progress < 50))
    .filter((item) => {
      const student = studentById[item.userId];
      const course = courseById[item.courseId];
      return `${student?.name || ''} ${student?.identifier || ''} ${course?.title || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    })
    .slice()
    .sort((a, b) => {
      const studentA = studentById[a.userId]?.name || '';
      const studentB = studentById[b.userId]?.name || '';
      if (sort === 'student-asc') return studentA.localeCompare(studentB, 'ko');
      if (sort === 'student-desc') return studentB.localeCompare(studentA, 'ko');
      if (sort === 'progress-asc') return a.progress - b.progress;
      if (sort === 'progress-desc') return b.progress - a.progress;
      if (sort === 'date-asc') return String(a.enrolledAt).localeCompare(String(b.enrolledAt));
      return String(b.enrolledAt).localeCompare(String(a.enrolledAt));
    }), [items, courseId, status, search, sort, studentById, courseById]);
  const grouped = courses.map((course) => ({ course, items: filteredItems.filter((item) => item.courseId === course.id) })).filter((group) => group.items.length);
  const courseCounts = Object.fromEntries(items.map((item) => [item.courseId, (items.filter((entry) => entry.courseId === item.courseId).length)]));
  const renderGroup = (group) => <section className="enrollment-course-group" key={group.course.id}><div className="enrollment-group-heading"><div><span className={`course-dot accent-${group.course.accent}`} /><div><p className="eyebrow">COURSE GROUP</p><h3>{group.course.title}</h3></div></div><span>{group.items.length}명</span></div><EnrollmentTable students={students} courses={courses} items={group.items} /></section>;
  return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">LEARNING DATA</p><h2>교육별 수강생 현황</h2></div><span className="table-count">{filteredItems.length} / {items.length} records</span></div><div className="enrollment-course-tabs"><button className={courseId === 'all' ? 'selected' : ''} onClick={() => setCourseId('all')}>전체 교육 <span>{items.length}</span></button>{courses.map((course) => <button key={course.id} className={courseId === course.id ? 'selected' : ''} onClick={() => setCourseId(course.id)}>{course.title}<span>{courseCounts[course.id] || 0}</span></button>)}</div><div className="admin-data-toolbar"><label className="admin-search"><Icon name="search" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="학생명·학번·교육명 검색" aria-label="수강 데이터 검색" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="수강 상태 필터"><option value="all">수강 상태 전체</option><option value="progressing">수강 중만</option><option value="completed">수강 완료만</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="수강 데이터 정렬"><option value="date-desc">신청일 최신순</option><option value="date-asc">신청일 오래된순</option><option value="student-asc">학생명 오름차순</option><option value="student-desc">학생명 내림차순</option><option value="progress-desc">수강률 높은순</option><option value="progress-asc">수강률 낮은순</option></select></div>{filteredItems.length ? courseId === 'all' ? grouped.map(renderGroup) : renderGroup({ course: courseById[courseId], items: filteredItems }) : <div className="admin-empty">조건에 맞는 수강 데이터가 없습니다.</div>}</div>;
}

function EnrollmentTable({ students, courses, items }) {
  return <div className="data-table"><div className="table-row table-header"><span>학생</span><span>교육</span><span>신청일</span><span>수강률</span><span>상태</span></div>{items.map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="table-row" key={`${item.userId}-${item.courseId}`}><span className="name-cell"><span className="avatar avatar-small">{student?.name.slice(0,1)}</span><strong>{student?.name || '알 수 없는 학생'}</strong></span><span>{course?.title || '삭제된 교육'}</span><span className="mono">{item.enrolledAt}</span><span className="progress-cell"><i><b style={{ width: `${item.progress}%` }} /></i>{item.progress}%</span><span><span className={`status-tag ${item.progress >= 50 ? 'complete' : 'progressing'}`}>{item.progress >= 50 ? '수강 완료' : '수강 중'}</span></span></div>; })}</div>;
}

function Toast({ notice, onClose }) { useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]); return <div className={`toast toast-${notice.type}`} role="status"><Icon name={notice.type === 'success' ? 'check' : 'book'} size={16} /><span>{notice.text}</span><button onClick={onClose} aria-label="알림 닫기"><Icon name="x" size={15} /></button></div>; }

function Footer() { return <footer className="site-footer"><div className="page-width footer-inner"><span className="footer-brand">LIBRARY <em>LEARN</em></span><span>Academic Information Center · 2026</span><span className="footer-links">Privacy · Accessibility · Help</span></div></footer>; }

export default App;
