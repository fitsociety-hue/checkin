function doPost(e) {
    // Lock to prevent concurrent edit issues
    var lock = LockService.getScriptLock();
    try {
        lock.waitLock(30000); // Wait for other processes up to 30 sec
    } catch (e) {
        return ContentService.createTextOutput("Error: Could not obtain lock.").setMimeType(ContentService.MimeType.TEXT);
    }

    try {
        // 1. Data Parsing
        // e.postData can be undefined if run from editor directly, so we check.
        if (!e || !e.postData) {
            return ContentService.createTextOutput("Error: No postData. Do not run in editor directly. Send a POST request.").setMimeType(ContentService.MimeType.TEXT);
        }

        var contents = e.postData.contents;
        var json = JSON.parse(contents);
        var data = json.data;
        var sessionName = json.sessionName || "Default Session";

        // 2. Open Spreadsheet
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName('시트1'); // Check your sheet name! '시트1' or 'Sheet1'

        // If sheet doesn't exist, create it or use the first one
        if (!sheet) {
            sheet = ss.getSheets()[0];
        }

        // 3. Prepare Data
        if (data && data.length > 0) {
            // Add Header if new
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(["타임스탬프", "세션명", "이름", "소속", "전화번호", "차량번호", "교육명", "체크인여부", "체크인시간"]);
            }

            var rows = data.map(function (row) {
                return [
                    new Date(),                // Timestamp of save
                    sessionName,               // Session Name
                    row.name,
                    row.affiliation,
                    "'" + row.phone,           // Force string for phone
                    row.vehicle,
                    row.eventName || "",       // Event Name from CSV
                    row.checkedIn ? "O" : "X",
                    row.checkedInAt || ""
                ];
            });

            // 4. Batch Write (More efficient)
            sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
        }

        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);

    } catch (error) {
        return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
    } finally {
        lock.releaseLock();
    }
}

// Ensure doGet exists so you can test the URL in browser (it will just say running)
function doGet(e) {
    return ContentService.createTextOutput("Web App is active. Send POST request to sync.").setMimeType(ContentService.MimeType.TEXT);
}