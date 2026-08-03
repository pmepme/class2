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

export function getSession() {
  return read(storageKeys.session, null);
}

export function setSession(user) {
  if (user) write(storageKeys.session, user);
  else window.localStorage.removeItem(storageKeys.session);
}

export function getCourses() {
  return read(storageKeys.courses, initialCourses);
}

export function saveCourses(courses) {
  write(storageKeys.courses, courses);
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
