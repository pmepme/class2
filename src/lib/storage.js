import { initialCourses, initialEnrollments, initialStudents, storageKeys } from './mockData';

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCourse(course) {
  const legacyMaterials = course.materialName
    ? [{ id: `${course.id}-material-1`, name: course.materialName, url: course.materialUrl || '#' }]
    : [];
  const materials = (Array.isArray(course.materials) ? course.materials : legacyMaterials)
    .filter((material) => material && material.name)
    .map((material, index) => ({
      id: material.id || `${course.id}-material-${index + 1}`,
      name: material.name,
      url: material.url || '#',
    }));
  return { ...course, materials, materialName: materials[0]?.name || '' };
}

export function getSession() {
  const session = read(storageKeys.session, null);
  // 이전 데모에서 만들어진 localStorage 세션은 Apps Script 재인증을 거치도록 폐기합니다.
  if (session && session.authProvider !== 'apps-script') {
    window.localStorage.removeItem(storageKeys.session);
    return null;
  }
  return session;
}

export function setSession(user) {
  if (user) write(storageKeys.session, user);
  else window.localStorage.removeItem(storageKeys.session);
}

export function getCourses() {
  return read(storageKeys.courses, initialCourses).map(normalizeCourse);
}

export function saveCourses(courses) {
  write(storageKeys.courses, courses.map(normalizeCourse));
}

export function getStudents() {
  return read(storageKeys.students, initialStudents);
}

export function saveStudents(students) {
  write(storageKeys.students, students);
}

export function getEnrollments() {
  return read(storageKeys.enrollments, initialEnrollments);
}

export function saveEnrollments(enrollments) {
  write(storageKeys.enrollments, enrollments);
}

export function resetDemoData() {
  saveCourses(initialCourses);
  saveStudents(initialStudents);
  saveEnrollments(initialEnrollments);
  setSession(null);
}

export function ensureEnrollment(enrollments, userId, courseId) {
  const next = structuredClone(enrollments);
  next[userId] ||= {};
  next[userId][courseId] ||= { enrolledAt: new Date().toISOString().slice(0, 10), progress: 0, lastPosition: 0 };
  return next;
}
