/**
 * 기존 인증용 Apps Script에 추가하는 강의자료 업로드 핸들러입니다.
 * 기존 doPost(e)에서 JSON payload를 만든 뒤 아래처럼 연결하세요.
 *
 *   var dataResult = handleLibraryLearnDataAction_(payload);
 *   if (dataResult) return jsonOutput_(dataResult);
 *
 * jsonOutput_은 기존 프로젝트의 JSON 응답 함수명을 사용하면 됩니다.
 */
function handleLibraryLearnDataAction_(payload) {
  if (!payload || payload.action !== 'upload_material') return null;
  assertLibraryLearnApiKey_(payload.apiKey);
  return uploadLibraryLearnMaterial_(payload);
}

function assertLibraryLearnApiKey_(apiKey) {
  var expected = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!expected || apiKey !== expected) throw new Error('Unauthorized');
}

function uploadLibraryLearnMaterial_(payload) {
  var fileData = payload.file || {};
  var folderId = PropertiesService.getScriptProperties().getProperty('DRIVE_MATERIALS_FOLDER_ID');
  if (!folderId) throw new Error('DRIVE_MATERIALS_FOLDER_ID가 설정되지 않았습니다.');
  if (!fileData.name || !fileData.base64) throw new Error('파일명 또는 파일 데이터가 없습니다.');
  if (Number(fileData.size || 0) > 10 * 1024 * 1024) throw new Error('파일은 10MB 이하만 업로드할 수 있습니다.');

  var bytes = Utilities.base64Decode(fileData.base64);
  var blob = Utilities.newBlob(bytes, fileData.mimeType || 'application/octet-stream', fileData.name);
  var file = DriveApp.getFolderById(folderId).createFile(blob);

  // 공개 자료만 true로 설정하세요. 기본값은 파일 소유자만 접근하는 비공개입니다.
  var isPublic = PropertiesService.getScriptProperties().getProperty('DRIVE_MATERIALS_PUBLIC') === 'true';
  if (isPublic) file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  appendLibraryLearnMaterialRow_(payload.courseId, file);

  return {
    success: true,
    file: {
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      url: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
    },
  };
}

function appendLibraryLearnMaterialRow_(courseId, file) {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) return;
  var sheetName = properties.getProperty('MATERIALS_SHEET_NAME') || 'Materials';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  if (!sheet) throw new Error(`${sheetName} 시트를 찾을 수 없습니다.`);
  sheet.appendRow([
    `drive-${file.getId()}`,
    courseId || '',
    file.getName(),
    file.getId(),
    file.getUrl(),
    new Date().toISOString(),
  ]);
}
