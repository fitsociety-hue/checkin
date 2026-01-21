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
        var action = json.action || 'save'; // Default to save for backward compatibility

        // 2. Open Spreadsheet
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName('시트1'); // Check your sheet name! '시트1' or 'Sheet1'

        // If sheet doesn't exist, create it or use the first one
        if (!sheet) {
            sheet = ss.getSheets()[0];
            // Ensure headers if new sheet
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(["타임스탬프", "세션명", "이름", "소속", "교육/행사명", "전화번호", "차량번호", "장애유무", "보장구", "체크인여부", "체크인시간"]);
            }
        }

        if (action === 'getSessions') {
            // Get all data and find unique session names (Column B, index 1)
            var range = sheet.getDataRange();
            var values = range.getValues();
            var sessions = {};

            // Start from row 1 (skip header)
            for (var i = 1; i < values.length; i++) {
                var sessionName = values[i][1]; // "세션명" column
                if (sessionName && sessionName !== "세션명") {
                    if (!sessions[sessionName]) {
                        sessions[sessionName] = {
                            name: sessionName,
                            count: 0,
                            lastUpdate: values[i][0] // Timestamp
                        };
                    }
                    sessions[sessionName].count++;
                    // Update to latest timestamp if available
                    if (new Date(values[i][0]) > new Date(sessions[sessionName].lastUpdate)) {
                        sessions[sessionName].lastUpdate = values[i][0];
                    }
                }
            }

            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                sessions: Object.values(sessions)
            })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === 'getSessionData') {
            var targetSession = json.sessionName;
            if (!targetSession) {
                return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No sessionName provided' })).setMimeType(ContentService.MimeType.JSON);
            }

            var range = sheet.getDataRange();
            var values = range.getValues();
            var participants = [];

            // Start from row 1 (skip header)
            for (var i = 1; i < values.length; i++) {
                if (values[i][1] === targetSession) {
                    participants.push({
                        // Mapping back to frontend structure
                        name: values[i][2],
                        affiliation: values[i][3],
                        eventName: values[i][4],
                        phone: String(values[i][5]).replace(/'/g, ''), // Remove single quote if present
                        vehicle: values[i][6],
                        disability: values[i][7],
                        assistiveDevice: values[i][8],
                        checkedIn: values[i][9] === "O",
                        checkedInAt: values[i][10]
                    });
                }
            }

            return ContentService.createTextOutput(JSON.stringify({
                status: 'success',
                data: participants
            })).setMimeType(ContentService.MimeType.JSON);

        } else {
            // Default Action: SAVE
            var data = json.data;
            var sessionName = json.sessionName || "Default Session";

            // 3. Prepare Data
            if (data && data.length > 0) {
                // Check if header exists (already done above, but safe to double check if we were just appending)
                if (sheet.getLastRow() === 0) {
                    sheet.appendRow(["타임스탬프", "세션명", "이름", "소속", "교육/행사명", "전화번호", "차량번호", "장애유무", "보장구", "체크인여부", "체크인시간"]);
                }

                var rows = data.map(function (row) {
                    return [
                        new Date(),                // Timestamp
                        sessionName,               // Session Name
                        row.name,
                        row.affiliation,
                        row.eventName || "",       // Event Name
                        "'" + row.phone,           // Phone (prevent auto-format)
                        row.vehicle,
                        row.disability || "",      // Disability
                        row.assistiveDevice || "", // Assistive Device
                        row.checkedIn ? "O" : "X", // Check-in Status
                        row.checkedInAt || ""      // Check-in Time
                    ];
                });

                // 4. Batch Write (More efficient)
                sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
            }

            return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// Ensure doGet exists so you can test the URL in browser (it will just say running)
function doGet(e) {
    return ContentService.createTextOutput("Web App is active. Send POST request to sync.").setMimeType(ContentService.MimeType.TEXT);
}