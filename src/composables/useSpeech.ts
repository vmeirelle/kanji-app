const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

export function useSpeech() {
  const supported = !!synth

  function speak(text: string, lang = 'ja-JP') {
    if (!synth || !text) return
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    synth.speak(utter)
  }

  return { supported, speak }
}
