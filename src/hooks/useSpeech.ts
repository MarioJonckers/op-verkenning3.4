// src/hooks/useSpeech.ts
export default function useSpeech(enabled: boolean) {
    const speak = (text: string) => {
        if (!enabled) return;
        try {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "nl-BE";
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
        } catch {
            // stil falen
        }
    };
    return speak;
}
