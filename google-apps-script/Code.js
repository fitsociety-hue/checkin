/**
 * Google Sheets Web App for QR Check-in Data
 * 
 * 1. 이 코드를 복사하여 Google Apps Script 에디터(Code.gs)에 붙여넣으세요.
 * 2. '배포' > '새 배포' > '웹 앱'을 선택하세요.
 * 3. 엑세스 권한을 '모든 사용자 (Everyone)'로 설정해야 브라우저에서 CORS 오류 없이 전송할 수 있습니다.
 * 4. 생성된 '웹 앱 URL'을 프론트엔드 코드에 적용하세요.
 */

function doPost(e) {
    try {
        // 1. Parse Data
        var params = JSON.parse(e.postData.contents);
        var action = params.action;
        var data = params.data; // Array of objects

        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName('Participants');

        // Create sheet if not exists
        if (!sheet) {
            sheet = ss.insertSheet('Participants');
            // Set Header
            sheet.appendRow(['Timestamp', 'Name', 'Affiliation', 'Phone', 'Vehicle', 'SentStatus']);
        }

        // 2. Handle 'save' action
        if (action === 'save') {
            var timestamp = new Date().toLocaleString();

            var rows = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                rows.push([
                    timestamp,
                    item.name,
                    item.affiliation || '',
                    item.phone,
                    item.vehicle || '',
                    'READY' // Or status
                ]);
            }

            // Bulk insert
            if (rows.length > 0) {
                sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
            }

            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                count: rows.length
            })).setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService.createTextOutput("QR Check-in API is Running");
}
