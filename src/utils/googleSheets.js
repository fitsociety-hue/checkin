export const saveToSheet = async (data, sessionName) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwM-XrbQuv_CxMh9xv3Ttyq-qTpgxfZXC6Fme8tt2S7EWNZD7JZZnsotgdPx0oEz5KU/exec'; // Updated 2026-01-06 (2)

    try {
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

export const fetchSessionList = async () => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwM-XrbQuv_CxMh9xv3Ttyq-qTpgxfZXC6Fme8tt2S7EWNZD7JZZnsotgdPx0oEz5KU/exec';

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            // To receive data, we CANNOT use no-cors. However, GAS web app must be set to "Anyone" access 
            // and return correct CORS headers, OR we use a proxy. 
            // Standard GAS `ContentService` usually handles simple CORS if we don't send weird headers.
            // BUT, standard `fetch` from browser to GAS often has CORS issues if not `no-cors`.
            // Wait, standard limitation: `no-cors` means OPAQUE response. We can't read it.
            // To read data, we MUST use standard cors. 
            // Does the GAS script header return CORS?
            // Usually GAS returns a redirect to googleusercontent, which might complicate things.
            // Let's try standard POST. If GAS is deployed as "Me / Anyone (even anonymous)", it SHOULD work.
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'getSessions'
            })
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const fetchSessionData = async (sessionName) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwM-XrbQuv_CxMh9xv3Ttyq-qTpgxfZXC6Fme8tt2S7EWNZD7JZZnsotgdPx0oEz5KU/exec';

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                action: 'getSessionData',
                sessionName: sessionName
            })
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Error fetching session data:', error);
        throw error;
    }
};
