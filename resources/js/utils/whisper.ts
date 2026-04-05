export async function checkWhisperHealth(): Promise<boolean> {
    try {
        const response = await fetch(route('whisper.health'), { method: 'GET' });
        const data = await response.json();
        return data.ok === true;
    } catch {
        return false;
    }
}
