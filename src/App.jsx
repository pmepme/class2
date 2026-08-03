import { useEffect, useMemo, useRef, useState } from 'react';
import {
  categories,
  initialCourses,
  initialEnrollments,
  initialStudents,
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

function Icon({ name, size = 18, stroke = 1.8 }) {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    arrowLeft: <><path d="m12 19-7-7 7-7"/><path d="M5 12h14"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 6h8M8 10h6"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    chevron: <><path d="m6 9 6 6 6-6"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    external: <><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    lock: <><rect width="16" height="12" x="4" y="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-6"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06A1.7 1.7 0 0 0 16.44 18a1.7 1.7 0 0 0-1.03 1.56V20h-2.02v-.08A1.7 1.7 0 0 0 12.36 18a1.7 1.7 0 0 0-1.88.34l-.06.06L9 16.98l.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2.02h.84A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06A1.7 1.7 0 0 0 12.36 8a1.7 1.7 0 0 0 1.03-1.56V6h2.02v.44A1.7 1.7 0 0 0 16.44 8a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11c.19.58.74.97 1.36.97H21v2.02h-.24c-.62 0-1.17.39-1.36 1.01Z"/></>,
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

  const navigateHome = () => { setView('home'); setSelectedCourse(null); };
  const openAuth = (reason = '') => { setAuthReason(reason); setView('auth'); };
  const handleSignOut = () => { setSession(null); setSessionState(null); setNotice({ type: 'info', text: '로그아웃되었습니다.' }); navigateHome(); };
  const handleAuth = (user) => {
    setSession(user);
    setSessionState(user);
    setNotice({ type: 'success', text: `${user.displayName}님, 인증이 완료되었습니다.` });
    if (authReason && courses.some((course) => course.id === authReason)) {
      const course = courses.find((item) => item.id === authReason);
      setSelectedCourse(course);
      setView('home');
    } else setView('home');
    setAuthReason('');
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
    <Header session={session} view={view} language={language} setLanguage={setLanguage} onHome={navigateHome} onAuth={() => openAuth()} onMyPage={() => session ? setView('mypage') : openAuth()} onAdmin={() => setView('admin')} onSignOut={handleSignOut} />
    {notice && <Toast notice={notice} onClose={() => setNotice(null)} />}
    <main>
      {view === 'home' && <HomePage courses={courses} session={session} enrollments={enrollments} language={language} onSelect={askToEnroll} onAuth={() => openAuth()} />}
      {view === 'auth' && <AuthPage students={students} onSubmit={handleAuth} onBack={navigateHome} reason={authReason} language={language} />}
      {view === 'learn' && selectedCourse && session && <LearnPage course={selectedCourse} enrollment={enrollments[session.userId]?.[selectedCourse.id]} onBack={navigateHome} onProgress={updateProgress} onDownload={(course) => setNotice({ type: 'success', text: `${course.materialName} 다운로드를 시작합니다.` })} />}
      {view === 'mypage' && session && <MyPage session={session} courses={courses} enrollments={enrollments[session.userId] || {}} onSelect={askToEnroll} onHome={navigateHome} />}
      {view === 'admin' && <AdminPage courses={courses} setCourses={setCourses} students={students} setStudents={setStudents} enrollments={enrollments} onReset={reset} onNotice={setNotice} />}
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

function AuthPage({ students, onSubmit, onBack, reason, language }) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const submit = (event) => { event.preventDefault(); const student = students.find((item) => item.name.toLowerCase() === name.trim().toLowerCase() && item.identifier.toLowerCase() === identifier.trim().toLowerCase() && item.active); if (!student) { setError('입력한 정보가 올바르지 않습니다. 이름과 학번/사번을 확인해 주세요.'); return; } onSubmit({ userId: student.userId, displayName: student.name, role: student.role }); };
  return <section className="auth-page page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록으로</button><div className="auth-layout"><div className="auth-intro"><p className="eyebrow"><span className="eyebrow-dot" /> PRIVATE ACCESS</p><h1>학습을 시작하기 전,<br /><span>학생 인증</span>이 필요해요.</h1><p>이름과 학번 또는 사번으로 간편하게 인증합니다. 비밀번호는 저장하지 않으며, 등록된 명단과 일치하는지 확인하는 용도로만 사용합니다.</p><div className="privacy-note"><Icon name="lock" size={17} /><span>개인정보 보호를 위해 인증 정보는 로그에 남기지 않습니다.</span></div></div><form className="auth-card" onSubmit={submit}><div className="auth-card-heading"><span className="step-pill">STEP 01 / VERIFY</span><h2>{language === 'EN' ? 'Verify your identity' : '학생 정보 입력'}</h2><p>등록된 정보와 일치하면 바로 학습을 시작할 수 있어요.</p></div><label>이름<input value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder="홍길동 / Alex Kim" autoComplete="name" /></label><label>학번 또는 사번<input value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(''); }} placeholder="예: 20261234" inputMode="numeric" /></label>{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}<button className="button button-dark button-wide" type="submit">인증하고 계속하기 <Icon name="arrow" size={17} /></button><div className="demo-login"><span>DEMO ACCESS</span><p>김민서 · 20261234<br />Aisha Rahman · 20250117</p><button type="button" className="inline-button" onClick={() => { setName('김민서'); setIdentifier('20261234'); setError(''); }}>샘플 정보 자동 입력</button></div></form></div>{reason && <p className="auth-context">선택한 교육을 계속 신청하려면 먼저 인증해 주세요.</p>}</section>;
}

function EnrollmentModal({ course, onConfirm, onCancel }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="enroll-title"><button className="modal-close" onClick={onCancel} aria-label="닫기"><Icon name="x" size={19} /></button><div className={`modal-icon accent-${course.accent}`}><Icon name="book" size={24} /></div><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="enroll-title">교육을 수강하시겠습니까?</h2><p className="modal-course">{course.title}</p><p className="modal-description">신청 후 바로 영상 수강 화면으로 이동합니다. 수강률은 자동으로 저장됩니다.</p><div className="modal-actions"><button className="button button-ghost" onClick={onCancel}>아니오</button><button className="button button-primary" onClick={onConfirm}>예(수강 신청) <Icon name="arrow" size={16} /></button></div></div></div>;
}

function LearnPage({ course, enrollment, onBack, onProgress, onDownload }) {
  const playerRef = useRef(null);
  const [progress, setProgress] = useState(enrollment?.progress || 0);
  const [speed, setSpeed] = useState('1.0');
  const [caption, setCaption] = useState('ko');
  const [savedAt, setSavedAt] = useState('');
  const [showControls, setShowControls] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${course.videoId}?enablejsapi=1&cc_load_policy=1&cc_lang_pref=${caption}&playsinline=1&rel=0`;
  const sendPlayerCommand = (func, args = []) => {
    playerRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
  };
  const save = () => { onProgress(course.id, progress, Math.round((course.minutes * 60 * progress) / 100)); setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })); };
  useEffect(() => { setProgress(enrollment?.progress || 0); }, [enrollment?.progress]);
  return <section className="learn-page"><div className="learn-topbar page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록</button><span className="learn-label">NOW LEARNING</span><span className="learn-course-number">{course.category} / {course.level}</span></div><div className="learn-layout page-width"><div className="video-column"><div className="video-frame"><iframe ref={playerRef} title={course.title} src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="video-underbar"><div><span className="player-overline">YOUR PROGRESS</span><strong>{progress}% <small>{progress >= 50 ? '수강 완료' : '수강 중'}</small></strong></div><button className="button button-small button-dark" onClick={save}><Icon name="check" size={15} /> 진행률 저장</button></div><div className="range-wrap"><input type="range" min="0" max="100" value={progress} onChange={(event) => { setProgress(event.target.value); setShowControls(true); }} aria-label="수강률" /><div className="range-labels"><span>시작</span><span>{course.duration} · 50% 이상 수료</span><span>완료</span></div></div>{showControls && <p className="save-hint">슬라이더로 데모 진행률을 조정했습니다. 실제 서비스에서는 플레이어 이벤트로 자동 기록합니다. <button onClick={save}>지금 저장</button></p>}{savedAt && <p className="saved-time"><Icon name="check" size={14} /> {savedAt}에 진행률을 저장했습니다.</p>}<div className="player-tools"><div><span className="tool-label">배속</span>{['1.0', '1.25', '1.5', '2.0'].map((item) => <button key={item} className={speed === item ? 'selected' : ''} onClick={() => { setSpeed(item); sendPlayerCommand('setPlaybackRate', [Number(item)]); }}>{item}x</button>)}</div><div><span className="tool-label">자막</span><button className={caption === 'ko' ? 'selected' : ''} onClick={() => setCaption('ko')}>한국어</button><button className={caption === 'en' ? 'selected' : ''} onClick={() => setCaption('en')}>English</button></div></div></div><aside className="lesson-sidebar"><p className="eyebrow">LESSON 01</p><h1>{course.title}</h1><p className="lesson-subtitle">{course.subtitle}</p><div className="sidebar-divider" /><div className="lesson-facts"><div><span>교육 시간</span><strong>{course.duration}</strong></div><div><span>난이도</span><strong>{course.level}</strong></div><div><span>업데이트</span><strong>{course.updatedAt}</strong></div></div><div className="material-card"><div className="material-icon"><Icon name="download" size={20} /></div><div><strong>강의자료</strong><span>{course.materialName}</span></div><button onClick={() => onDownload(course)} aria-label="강의자료 다운로드"><Icon name="download" size={17} /></button></div><div className="lesson-tip"><span>TIP</span><p>자막은 영상 플레이어의 CC 버튼에서도 언어를 바꿀 수 있어요.</p></div></aside></div></section>;
}

function MyPage({ session, courses, enrollments, onSelect, onHome }) {
  const entries = courses.filter((course) => enrollments[course.id]);
  const ongoing = entries.filter((course) => enrollments[course.id].progress < 50);
  const completed = entries.filter((course) => enrollments[course.id].progress >= 50);
  return <section className="mypage page-width"><div className="mypage-head"><div><p className="eyebrow">MY LEARNING</p><h1>안녕하세요, {session.displayName}님.</h1><p>오늘도 한 걸음씩, 내 속도로 학습해보세요.</p></div><div className="profile-badge"><span className="avatar avatar-large">{session.displayName.slice(0, 1)}</span><div><strong>{session.displayName}</strong><span>학생 인증 완료</span></div></div></div><div className="learning-summary"><div><span>신청한 교육</span><strong>{entries.length}<small>개</small></strong></div><div><span>수강 중</span><strong>{ongoing.length}<small>개</small></strong></div><div><span>수강 완료</span><strong>{completed.length}<small>개</small></strong></div><div className="summary-progress"><span>나의 전체 수료율</span><strong>{entries.length ? Math.round(entries.reduce((sum, course) => sum + enrollments[course.id].progress, 0) / entries.length) : 0}%</strong><div className="progress-track"><i style={{ width: `${entries.length ? Math.round(entries.reduce((sum, course) => sum + enrollments[course.id].progress, 0) / entries.length) : 0}%` }} /></div></div></div><LearningGroup title="수강 중인 교육" courses={ongoing} enrollments={enrollments} onSelect={onSelect} emptyText="아직 수강 중인 교육이 없어요." /><LearningGroup title="수강 완료된 교육" courses={completed} enrollments={enrollments} onSelect={onSelect} emptyText="50% 이상 수강하면 이곳에서 확인할 수 있어요." /><button className="back-link mypage-home" onClick={onHome}><Icon name="arrowLeft" size={16} /> 교육 더 둘러보기</button></section>;
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
  return <section className="admin-page page-width"><div className="admin-head"><div><p className="eyebrow">OPERATIONS CONSOLE <span className="demo-pill">DEMO</span></p><h1>교육 운영 대시보드</h1><p>학생 인증 명단과 교육 콘텐츠, 수강 현황을 한 곳에서 관리합니다.</p></div><div className="admin-actions"><button className="button button-ghost button-small" onClick={onReset}>데모 초기화</button><button className="button button-dark button-small" onClick={exportCsv}><Icon name="download" size={15} /> 수강 데이터 CSV</button></div></div><div className="admin-tabs">{[['overview','개요'],['students','학생 명단'],['courses','교육 관리'],['enrollments','수강 현황']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'overview' && <><div className="admin-kpis"><Kpi label="등록 학생" value={students.filter((student) => student.role === 'student').length} suffix="명" icon="user" tone="violet" /><Kpi label="공개 교육" value={courses.filter((course) => course.published).length} suffix="개" icon="book" tone="cyan" /><Kpi label="전체 신청" value={allEnrollments.length} suffix="건" icon="chart" tone="orange" /><Kpi label="평균 수강률" value={allEnrollments.length ? Math.round(allEnrollments.reduce((sum, item) => sum + item.progress, 0) / allEnrollments.length) : 0} suffix="%" icon="check" tone="blue" /></div><div className="admin-panels"><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>최근 수강 신청</h2></div><button onClick={() => setTab('enrollments')}>전체 보기 <Icon name="arrow" size={14} /></button></div>{allEnrollments.slice(-4).reverse().map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="activity-row" key={`${item.userId}-${item.courseId}`}><span className="avatar avatar-small">{student?.name.slice(0,1)}</span><div><strong>{student?.name}</strong><span>{course?.title}</span></div><em>{item.progress}%</em></div>; })}</div><div className="admin-panel admin-notice"><span className="notice-icon"><Icon name="settings" size={20} /></span><p className="eyebrow">NEXT STEP</p><h2>실제 운영 전 확인할 것</h2><p>현재 화면은 가상 데이터로 동작하는 MVP입니다. 기관 SSO 또는 백엔드 인증을 연결한 후 운영 환경으로 전환하세요.</p><button onClick={() => setTab('students')}>명단 관리 열기 <Icon name="arrow" size={14} /></button></div></div></>}{tab === 'students' && <StudentsPanel students={students} onToggle={toggleStudent} />}{tab === 'courses' && <CoursesPanel courses={courses} onToggle={toggleCourse} />}{tab === 'enrollments' && <EnrollmentsPanel students={students} courses={courses} items={allEnrollments} />}</section>;
}

function Kpi({ label, value, suffix, icon, tone }) { return <div className={`kpi-card tone-${tone}`}><span className="kpi-icon"><Icon name={icon} size={18} /></span><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>; }

function StudentsPanel({ students, onToggle }) { return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">ACCESS LIST</p><h2>학생 명단</h2></div><span className="table-count">{students.filter((student) => student.role === 'student').length} students</span></div><div className="data-table"><div className="table-row table-header"><span>이름</span><span>학번 / 사번</span><span>권한</span><span>상태</span><span /></div>{students.map((student) => <div className="table-row" key={student.userId}><span className="name-cell"><span className="avatar avatar-small">{student.name.slice(0,1)}</span><strong>{student.name}</strong></span><span className="mono">{student.identifier}</span><span>{student.role === 'admin' ? '담당자' : '학생'}</span><span><span className={`active-status ${student.active ? 'on' : 'off'}`}><i />{student.active ? '활성' : '비활성'}</span></span><button className="table-action" onClick={() => onToggle(student.userId)}>{student.active ? '비활성화' : '활성화'}</button></div>)}</div></div>; }

function CoursesPanel({ courses, onToggle }) { return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">CONTENT LIBRARY</p><h2>교육 관리</h2></div><button className="button button-dark button-small" onClick={() => alert('새 교육 등록 폼은 백엔드 연동 시 연결됩니다.')}><Icon name="book" size={15} /> 교육 등록</button></div><div className="data-table"><div className="table-row table-header"><span>교육명</span><span>카테고리</span><span>영상 ID</span><span>공개 상태</span><span /></div>{courses.map((course) => <div className="table-row" key={course.id}><span className="name-cell"><span className={`course-dot accent-${course.accent}`} /><strong>{course.title}</strong></span><span>{course.category}</span><span className="mono">{course.videoId}</span><span><span className={`active-status ${course.published ? 'on' : 'off'}`}><i />{course.published ? '공개' : '비공개'}</span></span><button className="table-action" onClick={() => onToggle(course.id)}>{course.published ? '비공개 처리' : '공개하기'}</button></div>)}</div></div>; }

function EnrollmentsPanel({ students, courses, items }) { return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">LEARNING DATA</p><h2>수강 현황</h2></div><span className="table-count">{items.length} records</span></div><div className="data-table"><div className="table-row table-header"><span>학생</span><span>교육</span><span>신청일</span><span>수강률</span><span>상태</span></div>{items.map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="table-row" key={`${item.userId}-${item.courseId}`}><span className="name-cell"><span className="avatar avatar-small">{student?.name.slice(0,1)}</span><strong>{student?.name}</strong></span><span>{course?.title}</span><span className="mono">{item.enrolledAt}</span><span className="progress-cell"><i><b style={{ width: `${item.progress}%` }} /></i>{item.progress}%</span><span><span className={`status-tag ${item.progress >= 50 ? 'complete' : 'progressing'}`}>{item.progress >= 50 ? '수강 완료' : '수강 중'}</span></span></div>; })}</div></div>; }

function Toast({ notice, onClose }) { useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]); return <div className={`toast toast-${notice.type}`} role="status"><Icon name={notice.type === 'success' ? 'check' : 'book'} size={16} /><span>{notice.text}</span><button onClick={onClose} aria-label="알림 닫기"><Icon name="x" size={15} /></button></div>; }

function Footer() { return <footer className="site-footer"><div className="page-width footer-inner"><span className="footer-brand">LIBRARY <em>LEARN</em></span><span>Academic Information Center · 2026</span><span className="footer-links">Privacy · Accessibility · Help</span></div></footer>; }

export default App;
