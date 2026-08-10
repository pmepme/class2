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
      fileId: material.fileId || '',
      storage: material.storage || (material.fileId ? 'drive' : 'link'),
      name: material.name,
      url: material.url || '#',
    }));
  return { ...course, materials, materialName: materials[0]?.name || '' };
}

export function getCourses() {
  return read(storageKeys.courses, initialCourses).map(normalizeCourse);
}

export function saveCourses(courses) {
  write(storageKeys.courses, courses.map(normalizeCourse));
}

export function getStudents() {
  return read(storageKeys.students, initialStudents).filter((student) => student && student.email);
}

export function saveStudents(students) {
  write(storageKeys.students, students);
}

export function getEnrollments() {
  return Object.fromEntries(Object.entries(read(storageKeys.enrollments, initialEnrollments)).filter(([userId]) => {
    return getStudents().some((student) => student.userId === userId);
  }));
}

export function saveEnrollments(enrollments) {
  write(storageKeys.enrollments, enrollments);
}

export function ensureEnrollment(enrollments, userId, courseId) {
  const next = structuredClone(enrollments);
  next[userId] ||= {};
  next[userId][courseId] ||= { enrolledAt: new Date().toISOString().slice(0, 10), progress: 0, lastPosition: 0 };
  return next;
}
