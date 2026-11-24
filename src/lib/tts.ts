/**
 * Text-to-speech helper.
 *
 * Playback chain (mirrors the old project's flow):
 * 1. `/api/tts` same-origin TTS service (Express in dev, bundled server in
 *    production, HU07 - Yunior), which proxies Google Translate TTS with a
 *    backup provider and returns 503 when every provider fails.
 * 2. Google Translate TTS played directly by an <audio> element, for when the
 *    app is served without the Express layer. index.html declares
 *    <meta name="referrer" content="no-referrer"> because Google rejects
 *    requests that carry a Referer header; media playback does not need CORS.
 * 3. Browser SpeechSynthesis as a last resort (voice quality depends on the
 *    voices installed on the device).
 */

let currentAudio: HTMLAudioElement | null = null;

function googleTtsUrl(text: string): string {
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(
    text,
  )}`;
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio();
    // index.html sets <meta name="referrer" content="no-referrer">: Google TTS
    // answers 404 when the request carries a Referer header.
    audio.preload = "auto";
    audio.src = url;
    currentAudio = audio;

    audio.play().then(resolve).catch(reject);
  });
}

export async function speakWord(text: string): Promise<void> {
  const clean = text.trim();
  if (!clean) return;

  try {
    await playUrl(`/api/tts?text=${encodeURIComponent(clean)}`);
    return;
  } catch {
    // TTS service unavailable (Vite-only dev, static deploy or 503): use the
    // direct Google stream before falling back to the system voice.
  }

  try {
    await playUrl(googleTtsUrl(clean));
    return;
  } catch {
    console.warn("[tts] TTS unavailable, falling back to SpeechSynthesis.");
  }

  speakWithBrowser(clean);
}

function speakWithBrowser(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("[tts] SpeechSynthesis is not supported in this browser.");
    return;
  }

  const synth = window.speechSynthesis;
  // Cancel any pending utterance so rapid taps do not queue stale audio.
  synth.cancel();

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;

    const voice = pickEnglishVoice(synth.getVoices());
    if (voice) {
      utterance.voice = voice;
    }

    synth.speak(utterance);
  };

  // Some browsers populate the voice list asynchronously after page load.
  if (synth.getVoices().length === 0) {
    let spoken = false;
    const speakOnce = () => {
      if (spoken) return;
      spoken = true;
      speak();
    };

    synth.addEventListener("voiceschanged", speakOnce, { once: true });
    // Safety net: do not leave the click silent if the event never fires.
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", speakOnce);
      speakOnce();
    }, 1000);
    return;
  }

  speak();
}

function pickEnglishVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === "en-US" && /google/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-US" && /natural/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en-"))
  );
}
