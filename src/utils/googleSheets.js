export const saveToSheet = async (data, sessionName) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwM-XrbQuv_CxMh9xv3Ttyq-qTpgxfZXC6Fme8tt2S7EWNZD7JZZnsotgdPx0oEz5KU/exec'; // Updated 2026-01-06 (2)

    try {
        // Google Apps Script usually works best with text/plain to avoid preflight issues in CORS
        // and handles the body via e.postData.contents
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'save',
                timestamp: new Date().toISOString(),
                sessionName: sessionName || 'Default',
                data: data
            })
        });
        return true;
    } catch (error) {
        console.error('Error saving to sheet:', error);
        throw error;
    }
};
