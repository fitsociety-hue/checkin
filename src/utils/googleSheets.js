export const saveToSheet = async (data) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzFVtUvg78k2KyRfEdCiSfVPRMs-zScqar1zzhEiXLoqjxDVLqedtjanO6aLFQJmnc/exec';

    try {
        // Google Apps Script usually requires no-cors for simple POST requests from browser
        // unless the script explicitly handles OPTIONS and CORS headers.
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save',
                timestamp: new Date().toISOString(),
                data: data
            })
        });
        return true;
    } catch (error) {
        console.error('Error saving to sheet:', error);
        throw error;
    }
};
