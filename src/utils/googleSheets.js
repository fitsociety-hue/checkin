export const saveToSheet = async (data, sessionName) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpsPrZKm9oywFQ3exvzEeS03CFsME-1liIcU6sPCpF3C2B2tmD-oNV4C5dBhJy2Qk8/exec'; // Updated 2026-01-06 (2)

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
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpsPrZKm9oywFQ3exvzEeS03CFsME-1liIcU6sPCpF3C2B2tmD-oNV4C5dBhJy2Qk8/exec';

    try {
        const response = await fetch(`${GAS_URL}?action=getSessions`);
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const fetchSessionData = async (sessionName) => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzpsPrZKm9oywFQ3exvzEeS03CFsME-1liIcU6sPCpF3C2B2tmD-oNV4C5dBhJy2Qk8/exec';

    try {
        const response = await fetch(`${GAS_URL}?action=getSessionData&sessionName=${encodeURIComponent(sessionName)}`);
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Error fetching session data:', error);
        throw error;
    }
};
