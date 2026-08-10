const dataEndpoint = import.meta.env.VITE_APPS_SCRIPT_DATA_URL;
const apiSecret = import.meta.env.VITE_APPS_SCRIPT_API_SECRET;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error(`${file.name} 파일을 읽지 못했습니다.`));
    reader.readAsDataURL(file);
  });
}

async function postData(payload) {
  if (!dataEndpoint) throw new Error('Apps Script 데이터 API URL이 설정되지 않았습니다.');
  const response = await fetch(dataEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', Accept: 'application/json' },
    body: JSON.stringify({ ...payload, apiKey: apiSecret }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false || result.error) {
    throw new Error(result.message || result.error || `자료 업로드 서버 오류 (${response.status})`);
  }
  return result;
}

export async function uploadMaterialToDrive(file, courseId) {
  if (!(file instanceof File)) throw new Error('업로드할 파일을 선택해 주세요.');
  if (file.size > MAX_UPLOAD_SIZE) throw new Error(`${file.name}은(는) 10MB 이하 파일만 업로드할 수 있습니다.`);
  const base64 = await readAsBase64(file);
  const result = await postData({
    action: 'upload_material',
    courseId,
    file: { name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size, base64 },
  });
  if (!result.file?.id) throw new Error('Drive 업로드 응답에 fileId가 없습니다. Apps Script 응답을 확인해 주세요.');
  return {
    id: `drive-${result.file.id}`,
    fileId: result.file.id,
    storage: 'drive',
    name: result.file.name || file.name,
    url: result.file.downloadUrl || result.file.url || '#',
  };
}
