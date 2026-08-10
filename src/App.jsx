import { useEffect, useMemo, useRef, useState } from 'react';
import {
  categories,
  initialCourses,
  storageKeys,
} from './lib/mockData';
import {
  ensureEnrollment,
  getCourses,
  getEnrollments,
  getStudents,
  saveCourses,
  saveEnrollments,
  saveStudents,
} from './lib/storage';
import {
  HANYANG_DOMAIN,
  completeProfile,
  getAuthSession,
  isAdminSession,
  loginWithPassword,
  OTP_LENGTH,
  requestEmailOtp,
  signOut,
  verifyEmailOtp,
} from './lib/emailAuth';
import { uploadMaterialToDrive } from './lib/appScriptData';

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
  const [session, setSessionState] = useState(null);
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
  useEffect(() => {
    let active = true;
    getAuthSession().then((currentSession) => {
      if (active) setSessionState(currentSession);
    }).catch(() => {
      if (active) setSessionState(null);
    });
    return () => { active = false; };
  }, []);

  const navigateHome = () => { setView('home'); setSelectedCourse(null); };
  const openAuth = (reason = '') => { setAuthReason(reason); setView('auth'); };
  const handleSignOut = async () => {
    try { await signOut(); } finally {
      setSessionState(null);
      setNotice({ type: 'info', text: '로그아웃되었습니다.' });
      navigateHome();
    }
  };
  const openAdmin = () => { if (isAdminSession(session)) setView('admin'); };
  const applyAuthenticatedUser = (resultUser, authProvider = 'supabase-password') => {
    const user = {
      userId: resultUser.userId,
      displayName: resultUser.displayName || resultUser.email,
      studentId: resultUser.studentId || '',
      email: resultUser.email,
      role: resultUser.role,
      onboardingCompleted: Boolean(resultUser.onboardingCompleted),
      authProvider,
      authenticatedAt: new Date().toISOString(),
    };
    setStudents((currentStudents) => {
      const nextStudent = {
        userId: user.userId,
        email: user.email,
        name: user.displayName,
        identifier: user.studentId || user.email,
        studentId: user.studentId,
        role: user.role,
        active: true,
      };
      return currentStudents.some((student) => student.userId === nextStudent.userId)
        ? currentStudents.map((student) => student.userId === nextStudent.userId ? { ...student, ...nextStudent } : student)
        : [...currentStudents, nextStudent];
    });
    setSessionState(user);
    setNotice({ type: 'success', text: `${user.displayName}님, 로그인이 완료되었습니다.` });
    if (authReason && courses.some((course) => course.id === authReason)) {
      const course = courses.find((item) => item.id === authReason);
      setSelectedCourse(course);
      setView('home');
    } else setView('home');
    setAuthReason('');
    return user;
  };
  const handleOtpVerification = async ({ email, token }) => {
    const result = await verifyEmailOtp({ email, token });
    if (!result.approved) return result;
    if (result.user?.onboardingCompleted || result.user?.role === 'admin') {
      applyAuthenticatedUser(result.user, 'supabase-email-otp');
    }
    return result;
  };
  const handlePasswordLogin = async ({ email, password }) => {
    const result = await loginWithPassword({ email, password });
    if (result.authenticated && result.user) applyAuthenticatedUser(result.user);
    return result;
  };
  const handleCompleteProfile = async ({ password, displayName, studentId }) => {
    const result = await completeProfile({ password, displayName, studentId });
    if (result.approved && result.user) applyAuthenticatedUser(result.user, 'supabase-password');
    return result;
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
  const updateProgress = (courseId, progress, lastPosition = 0, watchedSeconds = 0, watchedRanges = []) => {
    if (!session) return;
    const next = ensureEnrollment(enrollments, session.userId, courseId);
    const currentEnrollment = next[session.userId][courseId];
    next[session.userId][courseId] = {
      ...currentEnrollment,
      progress: Math.round(Number(progress)),
      lastPosition: Math.max(0, Math.round(Number(lastPosition) || 0)),
      watchedSeconds: Math.max(0, Number(watchedSeconds) || 0),
      watchedRanges: Array.isArray(watchedRanges) ? watchedRanges : (currentEnrollment.watchedRanges || []),
      updatedAt: new Date().toISOString(),
    };
    setEnrollments(next);
  };
  return <div className="app-shell">
    <Header session={session} view={view} language={language} setLanguage={setLanguage} onHome={navigateHome} onAuth={() => openAuth()} onMyPage={() => session ? setView('mypage') : openAuth()} onAdmin={openAdmin} onSignOut={handleSignOut} />
    {notice && <Toast notice={notice} onClose={() => setNotice(null)} />}
    <main>
      {view === 'home' && <HomePage courses={courses} session={session} enrollments={enrollments} language={language} onSelect={askToEnroll} onAuth={() => openAuth()} />}
      {view === 'auth' && <AuthPage onRequestOtp={requestEmailOtp} onVerifyEmail={handleOtpVerification} onLogin={handlePasswordLogin} onCompleteProfile={handleCompleteProfile} onBack={navigateHome} reason={authReason} language={language} />}
      {view === 'learn' && selectedCourse && session && <LearnPage course={selectedCourse} enrollment={enrollments[session.userId]?.[selectedCourse.id]} onBack={navigateHome} onProgress={updateProgress} onDownload={(course, material) => setNotice({ type: 'success', text: `${material?.name || course.materialName || '강의자료'} 다운로드를 시작합니다.` })} />}
      {view === 'mypage' && session && <MyPage session={session} courses={courses} enrollments={enrollments[session.userId] || {}} onSelect={askToEnroll} onHome={navigateHome} />}
      {view === 'admin' && isAdminSession(session) && <AdminPage courses={courses} setCourses={setCourses} students={students} setStudents={setStudents} enrollments={enrollments} onNotice={setNotice} />}
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
        {isAdminSession(session) && <button className={view === 'admin' ? 'active' : ''} onClick={() => { onAdmin(); setMobileOpen(false); }}>관리자</button>}
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

function AuthPage({ onRequestOtp, onVerifyEmail, onLogin, onCompleteProfile, onBack, reason, language }) {
  const [emailId, setEmailId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [mode, setMode] = useState(() => (reason ? 'signup' : 'login'));
  const [step, setStep] = useState(() => (reason ? 'email' : 'credentials'));
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const normalizeEmailIdInput = (value) => value.trim().toLowerCase().replace(/@hanyang\.ac\.kr$/i, '');
  const resetForm = (nextMode) => {
    setMode(nextMode);
    setStep(nextMode === 'login' ? 'credentials' : 'email');
    setToken('');
    setPassword('');
    setPasswordConfirm('');
    setDisplayName('');
    setStudentId('');
    setCooldown(0);
    setError('');
    setMessage('');
  };
  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    resetForm(nextMode);
  };
  const getNormalizedEmail = () => {
    const normalizedId = normalizeEmailIdInput(emailId);
    if (!normalizedId) {
      setError('한양대학교 이메일 아이디를 입력해 주세요.');
      return null;
    }
    if (normalizedId.includes('@') || /\s/.test(normalizedId)) {
      setError('이메일 아이디만 입력해 주세요.');
      return null;
    }
    return { normalizedId, normalizedEmail: `${normalizedId}@${HANYANG_DOMAIN}` };
  };
  const sendOtp = async (event) => {
    event?.preventDefault();
    setError('');
    setMessage('');
    const normalizedEmailData = getNormalizedEmail();
    if (!normalizedEmailData) return;
    const { normalizedId, normalizedEmail } = normalizedEmailData;
    if (cooldown > 0) return;
    setIsSubmitting(true);
    try {
      await onRequestOtp({ email: normalizedEmail });
      setEmailId(normalizedId);
      setEmail(normalizedEmail);
      setStep('otp');
      setCooldown(60);
      setMessage(`${normalizedEmail}로 ${OTP_LENGTH}자리 인증번호를 보냈습니다.`);
    } catch (submitError) {
      setError(submitError.message || '인증번호를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const verifyOtp = async (event) => {
    event.preventDefault();
    const normalizedToken = token.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setError('');
    if (normalizedToken.length !== OTP_LENGTH) { setError(`인증번호 ${OTP_LENGTH}자리를 입력해 주세요.`); return; }
    setIsSubmitting(true);
    try {
      const result = await onVerifyEmail({ email, token: normalizedToken });
      if (!result?.approved) setError(result?.message || '인증번호가 올바르지 않거나 만료되었습니다.');
      else if (!result.user?.onboardingCompleted && result.user?.role !== 'admin') {
        setStep('profile');
        setMessage('이메일 인증이 완료되었습니다. 회원 정보를 설정해 주세요.');
      }
    } catch (submitError) {
      setError(submitError.message || '인증 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const login = async (event) => {
    event.preventDefault();
    setError('');
    const normalizedEmailData = getNormalizedEmail();
    if (!normalizedEmailData) return;
    if (!password) { setError('비밀번호를 입력해 주세요.'); return; }
    setIsSubmitting(true);
    try {
      const result = await onLogin({ email: normalizedEmailData.normalizedEmail, password });
      if (!result?.authenticated) setError(result?.message || '이메일 또는 비밀번호를 확인해 주세요.');
    } catch (submitError) {
      setError(submitError.message || '로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const completeSignup = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) { setError('비밀번호는 8자 이상 입력해 주세요.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 서로 일치하지 않습니다.'); return; }
    if (!displayName.trim()) { setError('이름을 입력해 주세요.'); return; }
    if (!studentId.trim()) { setError('학번을 입력해 주세요.'); return; }
    setIsSubmitting(true);
    try {
      const result = await onCompleteProfile({ password, displayName, studentId });
      if (!result?.approved) setError(result?.message || '회원가입을 완료하지 못했습니다.');
    } catch (submitError) {
      setError(submitError.message || '회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const changeEmail = () => { setStep('email'); setToken(''); setError(''); setMessage(''); };
  const renderEmailField = () => <label>한양대학교 이메일<div className="email-input-wrap"><input type="text" value={emailId} onChange={(event) => { setEmailId(event.target.value); setError(''); }} placeholder="name" autoComplete="username" autoFocus required aria-label="한양대학교 이메일 아이디" /><span className="email-input-suffix">@{HANYANG_DOMAIN}</span></div></label>;
  const isSignupProfile = mode === 'signup' && step === 'profile';
  return <section className="auth-page page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록으로</button><div className="auth-layout"><div className="auth-intro"><p className="eyebrow"><span className="eyebrow-dot" /> HANYANG EMAIL ACCESS</p><h1>한 번 인증하고,<br /><span>편하게 학습</span>하세요.</h1><p>처음 한 번만 한양대학교 이메일을 인증하고, 비밀번호·이름·학번을 설정하면 다음부터는 이메일과 비밀번호로 바로 로그인할 수 있어요.</p><div className="privacy-note"><Icon name="lock" size={17} /><span>인증 토큰과 비밀번호는 브라우저 저장소에 보관하지 않고 보안 세션으로 처리합니다.</span></div></div><form className="auth-card" onSubmit={mode === 'login' ? login : step === 'email' ? sendOtp : step === 'otp' ? verifyOtp : completeSignup}><div className="auth-tabs" role="tablist" aria-label="인증 방식"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>로그인</button><button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>회원가입</button></div><div className="auth-card-heading"><span className="step-pill">{mode === 'login' ? 'EMAIL LOGIN' : isSignupProfile ? 'STEP 03 / PROFILE' : step === 'email' ? 'STEP 01 / EMAIL' : 'STEP 02 / OTP'}</span><h2>{mode === 'login' ? '이메일로 로그인' : isSignupProfile ? '회원 정보 설정' : step === 'email' ? '한양대학교 이메일 인증' : '인증번호 입력'}</h2><p>{mode === 'login' ? `가입한 @${HANYANG_DOMAIN} 이메일과 비밀번호를 입력해 주세요.` : isSignupProfile ? '이름과 학번을 입력하고 로그인 비밀번호를 설정해 주세요.' : step === 'email' ? `@${HANYANG_DOMAIN} 이메일을 인증하면 회원가입을 시작할 수 있어요.` : `${email}로 발송된 ${OTP_LENGTH}자리 숫자를 입력해 주세요.`}</p></div>{mode === 'login' && <>{renderEmailField()}<label>비밀번호<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="비밀번호" autoComplete="current-password" required /></label></>}{mode === 'signup' && step === 'email' && renderEmailField()}{mode === 'signup' && step === 'otp' && <><label>인증번호<input className="otp-input" value={token} onChange={(event) => { setToken(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)); setError(''); }} onPaste={(event) => { event.preventDefault(); setToken(event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)); }} inputMode="numeric" maxLength={OTP_LENGTH} autoComplete="one-time-code" autoFocus required /></label><div className="otp-actions"><button type="button" className="inline-button" onClick={changeEmail}>이메일 수정</button><button type="button" className="inline-button" onClick={sendOtp} disabled={cooldown > 0 || isSubmitting}>{cooldown > 0 ? `${cooldown}초 후 재전송` : '인증번호 재전송'}</button></div></>}{isSignupProfile && <><div className="verified-email"><span>인증된 이메일</span><strong>{email}</strong></div><div className="profile-fields"><label>이름<input type="text" value={displayName} onChange={(event) => { setDisplayName(event.target.value); setError(''); }} placeholder="홍길동" autoComplete="name" autoFocus required /></label><label>학번<input type="text" value={studentId} onChange={(event) => { setStudentId(event.target.value); setError(''); }} placeholder="2026000000" autoComplete="off" required /></label></div><label>비밀번호<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="8자 이상" autoComplete="new-password" required /></label><label>비밀번호 확인<input type="password" value={passwordConfirm} onChange={(event) => { setPasswordConfirm(event.target.value); setError(''); }} placeholder="비밀번호를 한 번 더 입력" autoComplete="new-password" required /></label></>}{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}{message && !error && <div className="form-success" role="status"><Icon name="check" size={16} />{message}</div>}<button className="button button-dark button-wide" type="submit" disabled={isSubmitting || (mode === 'signup' && step === 'email' && cooldown > 0)}>{isSubmitting ? '처리 중...' : mode === 'login' ? '로그인' : isSignupProfile ? '회원가입 완료' : step === 'email' ? '인증번호 받기' : '인증하고 계속하기'} {!isSubmitting && <Icon name="arrow" size={17} />}</button>{mode === 'login' ? <button type="button" className="text-button auth-secondary-action" onClick={() => switchMode('signup')}>처음 이용하시나요? 이메일 인증 후 회원가입</button> : step === 'otp' ? <button type="button" className="text-button auth-secondary-action" onClick={changeEmail}>다른 이메일로 시작하기</button> : step === 'profile' ? <p className="auth-form-note">인증된 이메일: {email}</p> : null}</form></div>{reason && <p className="auth-context">선택한 교육을 계속 신청하려면 먼저 회원가입 또는 로그인을 완료해 주세요.</p>}</section>;
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

function normalizeWatchedRanges(value, duration = Number.POSITIVE_INFINITY) {
  if (!Array.isArray(value)) return [];
  return value.map((range) => {
    const start = Array.isArray(range) ? range[0] : range?.start;
    const end = Array.isArray(range) ? range[1] : range?.end;
    return [Number(start), Number(end)];
  }).filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && end > start)
    .map(([start, end]) => [Math.max(0, Math.min(start, duration)), Math.max(0, Math.min(end, duration))])
    .filter(([start, end]) => end > start)
    .sort((left, right) => left[0] - right[0]);
}

function mergeWatchedRange(ranges, start, end, duration) {
  const nextRanges = normalizeWatchedRanges([...ranges, [start, end]], duration);
  return nextRanges.reduce((merged, range) => {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1] + 0.25) {
      previous[1] = Math.max(previous[1], range[1]);
      return merged;
    }
    merged.push([...range]);
    return merged;
  }, []);
}

function getWatchedSeconds(ranges) {
  return ranges.reduce((total, [start, end]) => total + Math.max(0, end - start), 0);
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
  const hasPersistedRanges = Array.isArray(enrollment?.watchedRanges);
  const persistedRanges = hasPersistedRanges
    ? normalizeWatchedRanges(enrollment.watchedRanges)
    : [];
  const legacyWatchedSeconds = Number.isFinite(Number(enrollment?.watchedSeconds)) ? Math.max(0, Number(enrollment.watchedSeconds)) : 0;
  const legacyProgress = Math.min(100, Math.max(0, Number(enrollment?.progress) || 0));
  const initialRanges = hasPersistedRanges ? persistedRanges : [];
  const watchedRangesRef = useRef(initialRanges);
  const watchedSecondsRef = useRef(getWatchedSeconds(initialRanges));
  const observationRef = useRef({ time: null, at: null });
  const playbackActiveRef = useRef(false);
  const [progress, setProgress] = useState(Number(enrollment?.progress) || 0);
  const [speed, setSpeed] = useState('1.0');
  const [caption, setCaption] = useState('ko');
  const [savedAt, setSavedAt] = useState('');
  const [playerMode, setPlayerMode] = useState('loading');
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
      const now = performance.now();

      if (!hasPersistedRanges && watchedRangesRef.current.length === 0 && (legacyWatchedSeconds > 0 || legacyProgress > 0)) {
        const legacyEnd = Math.min(duration, legacyWatchedSeconds || (duration * legacyProgress) / 100);
        watchedRangesRef.current = legacyEnd > 0 ? [[0, legacyEnd]] : [];
        watchedSecondsRef.current = legacyEnd;
      }

      const previousObservation = observationRef.current;
      if (!playbackActiveRef.current || previousObservation.time === null) {
        observationRef.current = { time: currentTime, at: now };
        return;
      }

      const elapsedSeconds = Math.max(0, (now - previousObservation.at) / 1000);
      const delta = currentTime - previousObservation.time;
      const playbackRate = Number(player.getPlaybackRate?.()) || 1;
      const expectedDelta = elapsedSeconds * playbackRate;
      const tolerance = Math.max(0.75, expectedDelta * 0.5);
      const isContinuousPlayback = delta > 0 && delta <= expectedDelta + tolerance;

      if (isContinuousPlayback) {
        const nextRanges = mergeWatchedRange(watchedRangesRef.current, previousObservation.time, currentTime, duration);
        const nextWatchedSeconds = Math.min(duration, getWatchedSeconds(nextRanges));
        watchedRangesRef.current = nextRanges;
        watchedSecondsRef.current = nextWatchedSeconds;
        const watchedProgress = Math.min(100, Math.max(0, Math.round((nextWatchedSeconds / duration) * 100)));
        setProgress(watchedProgress);
        onProgressRef.current(course.id, watchedProgress, Math.round(currentTime), Math.round(nextWatchedSeconds), nextRanges);
      }

      // A seek creates a large currentTime jump. Reset the baseline without counting it.
      observationRef.current = { time: currentTime, at: now };
    };
    const stopSync = () => {
      if (syncTimer) window.clearInterval(syncTimer);
      syncTimer = undefined;
    };
    const startSync = () => {
      stopSync();
      syncTimer = window.setInterval(syncProgress, 1000);
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
            if (duration) {
              if (!hasPersistedRanges && watchedRangesRef.current.length === 0 && (legacyWatchedSeconds > 0 || legacyProgress > 0)) {
                const legacyEnd = Math.min(duration, legacyWatchedSeconds || (duration * legacyProgress) / 100);
                watchedRangesRef.current = legacyEnd > 0 ? [[0, legacyEnd]] : [];
                watchedSecondsRef.current = legacyEnd;
              }
            }
            if (enrollment?.lastPosition) event.target.seekTo(Number(enrollment.lastPosition), true);
            setPlayerMode('ready');
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              playbackActiveRef.current = true;
              observationRef.current = { time: Number(event.target.getCurrentTime()), at: performance.now() };
              startSync();
            } else if ([YT.PlayerState.PAUSED, YT.PlayerState.ENDED, YT.PlayerState.BUFFERING].includes(event.data)) {
              syncProgress();
              playbackActiveRef.current = false;
              observationRef.current = { time: null, at: null };
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
    const fallbackTime = Number(enrollment?.lastPosition) || 0;
    onProgress(course.id, Number(progress), Math.round(Number.isFinite(playerTime) ? playerTime : fallbackTime), Math.round(watchedSecondsRef.current), watchedRangesRef.current);
    setSavedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
  };
  useEffect(() => { setProgress(Number(enrollment?.progress) || 0); }, [enrollment?.progress]);
  useEffect(() => {
    if (playerMode === 'ready' && playerRef.current?.setOption) {
      playerRef.current.setOption('captions', 'track', { language: caption });
    }
  }, [caption, playerMode]);
  return <section className="learn-page"><div className="learn-topbar page-width"><button className="back-link" onClick={onBack}><Icon name="arrowLeft" size={16} /> 교육 목록</button><span className="learn-label">NOW LEARNING</span><span className="learn-course-number">{course.category} / {course.level}</span></div><div className="learn-layout page-width"><div className="video-column"><div className="video-frame">{playerMode === 'fallback' ? <iframe title={course.title} src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div ref={playerHostRef} className="youtube-player-host" />}{playerMode === 'loading' && <div className="video-loading">YouTube 플레이어 연결 중...</div>}</div><div className="video-underbar"><div><span className="player-overline">YOUR PROGRESS</span><strong>{progress}% <small>{progress >= 50 ? '수강 완료' : '수강 중'}</small></strong></div><button className="button button-small button-dark" onClick={save}><Icon name="check" size={15} /> 진행률 저장</button></div><div className="progress-wrap"><div className="progress-track" role="progressbar" aria-label="실제 수강 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="range-labels"><span>시작</span><span>{course.duration} · 실제 시청 구간 기준</span><span>완료</span></div></div>{savedAt && <p className="saved-time"><Icon name="check" size={14} /> {savedAt}에 진행률을 저장했습니다.</p>}<div className="player-tools"><div><span className="tool-label">배속</span>{['1.0', '1.25', '1.5', '2.0'].map((item) => <button key={item} className={speed === item ? 'selected' : ''} onClick={() => { setSpeed(item); sendPlayerCommand('setPlaybackRate', [Number(item)]); }}>{item}x</button>)}</div><div><span className="tool-label">자막</span><button className={caption === 'ko' ? 'selected' : ''} onClick={() => setCaption('ko')}>한국어</button><button className={caption === 'en' ? 'selected' : ''} onClick={() => setCaption('en')}>English</button></div></div></div><aside className="lesson-sidebar"><p className="eyebrow">LESSON 01</p><h1>{course.title}</h1><p className="lesson-subtitle">{course.subtitle}</p><div className="sidebar-divider" /><div className="lesson-facts"><div><span>교육 시간</span><strong>{course.duration}</strong></div><div><span>난이도</span><strong>{course.level}</strong></div><div><span>업데이트</span><strong>{course.updatedAt}</strong></div></div><div className="material-list">{materials.length ? materials.map((material) => <div className="material-card" key={material.id}><div className="material-icon"><Icon name="download" size={20} /></div><div><strong>강의자료</strong><span>{material.name}</span></div>{material.url && material.url !== '#' ? <a href={material.url} target="_blank" rel="noreferrer" aria-label={`${material.name} 다운로드`}><Icon name="external" size={16} /></a> : <button onClick={() => onDownload(course, material)} aria-label="강의자료 다운로드"><Icon name="download" size={17} /></button>}</div>) : <div className="material-card material-empty"><div className="material-icon"><Icon name="book" size={18} /></div><div><strong>강의자료</strong><span>등록된 자료가 없습니다.</span></div></div>}</div><div className="lesson-tip"><span>TIP</span><p>자막은 영상 플레이어의 CC 버튼에서도 언어를 바꿀 수 있어요.</p></div></aside></div></section>;
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

function getStudentEmail(student) {
  return student?.email || (student?.name?.includes('@') ? student.name : '') || student?.name || student?.identifier || '';
}

function AdminPage({ courses, setCourses, students, setStudents, enrollments, onNotice }) {
  const [tab, setTab] = useState('overview');
  const allEnrollments = Object.entries(enrollments).flatMap(([userId, items]) => Object.entries(items).map(([courseId, data]) => ({ userId, courseId, ...data })));
  const exportCsv = () => { const rows = [['student_email', 'course_title', 'progress', 'status', 'enrolled_at'], ...allEnrollments.map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return [getStudentEmail(student), course?.title || '', `${item.progress}%`, item.progress >= 50 ? '수강 완료' : '수강 중', item.enrolledAt || '']; })]; const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'library-learn-enrollments.csv'; link.click(); URL.revokeObjectURL(url); onNotice({ type: 'success', text: '수강 데이터 CSV를 내보냈습니다.' }); };
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
  return <section className="admin-page page-width"><div className="admin-head"><div><p className="eyebrow">OPERATIONS CONSOLE <span className="demo-pill">PROTECTED</span></p><h1>교육 운영 대시보드</h1><p>학생 인증 명단과 교육 콘텐츠, 수강 현황을 한 곳에서 관리합니다.</p></div><div className="admin-actions"><button className="button button-dark button-small" onClick={exportCsv} disabled={!allEnrollments.length}><Icon name="download" size={15} /> 수강 데이터 CSV</button></div></div><div className="admin-tabs">{[['overview','개요'],['students','학생 명단'],['courses','교육 관리'],['enrollments','수강 현황']].map(([id,label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'overview' && <><div className="admin-kpis"><Kpi label="등록 학생" value={students.filter((student) => student.role === 'student').length} suffix="명" icon="user" tone="violet" /><Kpi label="공개 교육" value={courses.filter((course) => course.published).length} suffix="개" icon="book" tone="cyan" /><Kpi label="전체 신청" value={allEnrollments.length} suffix="건" icon="chart" tone="orange" /><Kpi label="평균 수강률" value={allEnrollments.length ? Math.round(allEnrollments.reduce((sum, item) => sum + item.progress, 0) / allEnrollments.length) : 0} suffix="%" icon="check" tone="blue" /></div>{allEnrollments.length > 0 && <div className="admin-panels"><div className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>최근 수강 신청</h2></div><button onClick={() => setTab('enrollments')}>전체 보기 <Icon name="arrow" size={14} /></button></div>{allEnrollments.slice(-4).reverse().map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="activity-row" key={`${item.userId}-${item.courseId}`}><span className="avatar avatar-small">{getStudentEmail(student).slice(0,1)}</span><div><strong>{getStudentEmail(student)}</strong><span>{course?.title}</span></div><em>{item.progress}%</em></div>; })}</div><div className="admin-panel admin-notice"><span className="notice-icon"><Icon name="settings" size={20} /></span><p className="eyebrow">NEXT STEP</p><h2>실제 운영 전 확인할 것</h2><p>학생 명단과 수강 현황은 실제 이메일 인증과 수강 활동이 발생한 경우에만 표시됩니다. 운영 전에는 백엔드 권한 검증을 추가하세요.</p><button onClick={() => setTab('students')}>명단 관리 열기 <Icon name="arrow" size={14} /></button></div></div>}</>}{tab === 'students' && <StudentsPanel students={students} onToggle={toggleStudent} />}{tab === 'courses' && <CoursesPanel courses={courses} onToggle={toggleCourse} onSave={saveCourse} onCreate={createCourse} />}{tab === 'enrollments' && <EnrollmentsPanel students={students} courses={courses} items={allEnrollments} />}</section>;
}

function Kpi({ label, value, suffix, icon, tone }) { return <div className={`kpi-card tone-${tone}`}><span className="kpi-icon"><Icon name={icon} size={18} /></span><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>; }

function StudentsPanel({ students, onToggle }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('name-asc');
  const visibleStudents = useMemo(() => students
    .filter((student) => status === 'all' || (status === 'active' ? student.active : !student.active))
    .filter((student) => `${getStudentEmail(student)} ${student.role}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name-desc') return getStudentEmail(b).localeCompare(getStudentEmail(a), 'ko');
      if (sort === 'role') return a.role.localeCompare(b.role);
      if (sort === 'status') return Number(b.active) - Number(a.active);
      return getStudentEmail(a).localeCompare(getStudentEmail(b), 'ko');
    }), [students, search, status, sort]);
  return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">ACCESS LIST</p><h2>학생 명단</h2></div><span className="table-count">{visibleStudents.length} / {students.length} students</span></div><div className="admin-data-toolbar"><label className="admin-search"><Icon name="search" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이메일 검색" aria-label="학생 이메일 검색" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="학생 상태 필터"><option value="all">상태 전체</option><option value="active">활성만</option><option value="inactive">비활성만</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="학생 데이터 정렬"><option value="name-asc">이메일 오름차순</option><option value="name-desc">이메일 내림차순</option><option value="role">권한순</option><option value="status">활성 상태순</option></select></div><div className="data-table">{visibleStudents.length ? <><div className="table-row table-header"><span>이메일</span><span>권한</span><span>상태</span><span /></div>{visibleStudents.map((student) => <div className="table-row" key={student.userId}><span className="name-cell"><span className="avatar avatar-small">{getStudentEmail(student).slice(0,1)}</span><strong>{getStudentEmail(student)}</strong></span><span>{student.role === 'admin' ? '담당자' : '학생'}</span><span><span className={`active-status ${student.active ? 'on' : 'off'}`}><i />{student.active ? '활성' : '비활성'}</span></span><button className="table-action" onClick={() => onToggle(student.userId)}>{student.active ? '비활성화' : '활성화'}</button></div>)}</> : <div className="admin-empty">조건에 맞는 학생이 없습니다.</div>}</div></div>;
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
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const addMaterial = () => {
    if (!newMaterialName.trim()) return;
    setDraft((current) => ({ ...current, materials: [...current.materials, { id: `${current.id}-material-${Date.now()}`, name: newMaterialName.trim(), url: newMaterialUrl.trim() || '#' }] }));
    setNewMaterialName('');
    setNewMaterialUrl('');
  };
  const removeMaterial = (materialId) => setDraft((current) => ({ ...current, materials: current.materials.filter((material) => material.id !== materialId) }));
  const save = async (event) => {
    event.preventDefault();
    const videoId = extractYouTubeId(videoLink);
    if (!draft.title.trim()) { setError('교육명을 입력해 주세요.'); return; }
    if (!videoId) { setError('YouTube 영상 링크 또는 영상 ID를 입력해 주세요.'); return; }
    const minutes = Number.parseInt(String(draft.duration).replace(/[^0-9]/g, ''), 10) || Number(draft.minutes) || 0;
    setIsSaving(true);
    setError('');
    try {
      const uploadedMaterials = [];
      for (const file of pendingFiles) uploadedMaterials.push(await uploadMaterialToDrive(file, draft.id));
      const materials = [...draft.materials, ...uploadedMaterials];
      onSave({ ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), description: draft.description.trim(), videoId, minutes, materials, materialName: materials[0]?.name || '', updatedAt: formatAdminDate() });
    } catch (saveError) {
      setError(saveError.message || '강의 자료 업로드 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };
  return <div className="modal-backdrop editor-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal admin-editor" onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="course-editor-title"><button type="button" className="modal-close" onClick={onClose} aria-label="편집 닫기"><Icon name="x" size={19} /></button><div className="editor-heading"><p className="eyebrow">CONTENT EDITOR</p><h2 id="course-editor-title">{course.title ? '교육 정보 편집' : '새 교육 등록'}</h2><p>영상 링크, 교육 메타데이터와 강의 자료를 함께 관리합니다.</p></div><div className="editor-grid"><label>교육명<input value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="교육명을 입력하세요" required /></label><label>짧은 소개<input value={draft.subtitle} onChange={(event) => update('subtitle', event.target.value)} placeholder="교육 카드에 표시할 소개" /></label><label className="editor-wide">상세 설명<textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows="3" placeholder="교육 상세 설명" /></label><label>YouTube 영상 링크<input value={videoLink} onChange={(event) => { setVideoLink(event.target.value); setError(''); }} placeholder="https://www.youtube.com/watch?v=..." required /></label><label>카테고리<select value={draft.category} onChange={(event) => update('category', event.target.value)}>{categories.slice(1).map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label>난이도<select value={draft.level} onChange={(event) => update('level', event.target.value)}><option>입문</option><option>기초</option><option>중급</option><option>고급</option></select></label><label>교육 시간<input value={draft.duration} onChange={(event) => update('duration', event.target.value)} placeholder="예: 18분" /></label><label>자막/언어<input value={draft.language} onChange={(event) => update('language', event.target.value)} placeholder="KR · EN 자막" /></label><label>추천 대상<input value={draft.audience} onChange={(event) => update('audience', event.target.value)} placeholder="신입생 추천" /></label><label>강조 색상<select value={draft.accent} onChange={(event) => update('accent', event.target.value)}><option value="violet">Violet</option><option value="cyan">Cyan</option><option value="orange">Orange</option><option value="blue">Blue</option></select></label></div><section className="materials-editor"><div className="materials-heading"><div><p className="eyebrow">LECTURE MATERIALS</p><h3>강의 자료</h3></div><span>{draft.materials.length + pendingFiles.length}개</span></div>{draft.materials.length ? <div className="materials-list">{draft.materials.map((material) => <div className="material-editor-row" key={material.id}><div className="material-icon"><Icon name="download" size={16} /></div><div><strong>{material.name}</strong><span>{material.fileId ? `Google Drive 파일 · ${material.fileId}` : material.url === '#' ? '다운로드 링크 미등록' : material.url}</span></div><button type="button" className="icon-button material-delete" onClick={() => removeMaterial(material.id)} aria-label={`${material.name} 삭제`}><Icon name="trash" size={15} /></button></div>)}</div> : <div className="admin-empty material-editor-empty">등록된 강의 자료가 없습니다.</div>}<div className="material-upload-row"><label className="file-upload-control"><Icon name="plus" size={15} /> 파일 선택<input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt" onChange={(event) => setPendingFiles(Array.from(event.target.files || []))} /></label><span>저장할 때 Google Drive에 업로드됩니다. 파일당 최대 10MB</span></div>{pendingFiles.length > 0 && <div className="pending-file-list">{pendingFiles.map((file) => <div className="pending-file" key={`${file.name}-${file.lastModified}`}><span>{file.name}</span><button type="button" className="icon-button" onClick={() => setPendingFiles((files) => files.filter((item) => item !== file))} aria-label={`${file.name} 업로드 취소`}><Icon name="x" size={14} /></button></div>)}</div>}<div className="material-add-row"><input value={newMaterialName} onChange={(event) => setNewMaterialName(event.target.value)} placeholder="링크 자료명 (선택)" aria-label="추가할 자료명" /><input value={newMaterialUrl} onChange={(event) => setNewMaterialUrl(event.target.value)} placeholder="자료 URL (선택)" aria-label="추가할 자료 URL" /><button type="button" className="button button-ghost button-small" onClick={addMaterial}><Icon name="plus" size={14} /> 링크 자료 추가</button></div></section>{error && <div className="form-error" role="alert"><Icon name="x" size={16} />{error}</div>}<div className="editor-footer"><label className="publish-toggle"><input type="checkbox" checked={draft.published} onChange={(event) => update('published', event.target.checked)} /><span>교육 공개</span></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose} disabled={isSaving}>취소</button><button type="submit" className="button button-primary" disabled={isSaving}>{isSaving ? '자료 업로드 중...' : <><Icon name="check" size={16} /> 저장하기</>}</button></div></div></form></div>;
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
      return `${getStudentEmail(student)} ${course?.title || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    })
    .slice()
    .sort((a, b) => {
      const studentA = getStudentEmail(studentById[a.userId]);
      const studentB = getStudentEmail(studentById[b.userId]);
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
  return <div className="table-panel"><div className="panel-heading"><div><p className="eyebrow">LEARNING DATA</p><h2>교육별 수강생 현황</h2></div><span className="table-count">{filteredItems.length} / {items.length} records</span></div><div className="enrollment-course-tabs"><button className={courseId === 'all' ? 'selected' : ''} onClick={() => setCourseId('all')}>전체 교육 <span>{items.length}</span></button>{courses.map((course) => <button key={course.id} className={courseId === course.id ? 'selected' : ''} onClick={() => setCourseId(course.id)}>{course.title}<span>{courseCounts[course.id] || 0}</span></button>)}</div><div className="admin-data-toolbar"><label className="admin-search"><Icon name="search" size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이메일·교육명 검색" aria-label="수강 데이터 검색" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="수강 상태 필터"><option value="all">수강 상태 전체</option><option value="progressing">수강 중만</option><option value="completed">수강 완료만</option></select><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="수강 데이터 정렬"><option value="date-desc">신청일 최신순</option><option value="date-asc">신청일 오래된순</option><option value="student-asc">이메일 오름차순</option><option value="student-desc">이메일 내림차순</option><option value="progress-desc">수강률 높은순</option><option value="progress-asc">수강률 낮은순</option></select></div>{filteredItems.length ? courseId === 'all' ? grouped.map(renderGroup) : renderGroup({ course: courseById[courseId], items: filteredItems }) : <div className="admin-empty">조건에 맞는 수강 데이터가 없습니다.</div>}</div>;
}

function EnrollmentTable({ students, courses, items }) {
  return <div className="data-table"><div className="table-row table-header"><span>이메일</span><span>교육</span><span>신청일</span><span>수강률</span><span>상태</span></div>{items.map((item) => { const student = students.find((person) => person.userId === item.userId); const course = courses.find((lesson) => lesson.id === item.courseId); return <div className="table-row" key={`${item.userId}-${item.courseId}`}><span className="name-cell"><span className="avatar avatar-small">{getStudentEmail(student).slice(0,1)}</span><strong>{getStudentEmail(student) || '알 수 없는 학생'}</strong></span><span>{course?.title || '삭제된 교육'}</span><span className="mono">{item.enrolledAt}</span><span className="progress-cell"><i><b style={{ width: `${item.progress}%` }} /></i>{item.progress}%</span><span><span className={`status-tag ${item.progress >= 50 ? 'complete' : 'progressing'}`}>{item.progress >= 50 ? '수강 완료' : '수강 중'}</span></span></div>; })}</div>;
}

function Toast({ notice, onClose }) { useEffect(() => { const timer = setTimeout(onClose, 3500); return () => clearTimeout(timer); }, [onClose]); return <div className={`toast toast-${notice.type}`} role="status"><Icon name={notice.type === 'success' ? 'check' : 'book'} size={16} /><span>{notice.text}</span><button onClick={onClose} aria-label="알림 닫기"><Icon name="x" size={15} /></button></div>; }

function Footer() { return <footer className="site-footer"><div className="page-width footer-inner"><span className="footer-brand">LIBRARY <em>LEARN</em></span><span>Academic Information Center · 2026</span><span className="footer-links">Privacy · Accessibility · Help</span></div></footer>; }

export default App;
