async function test() {
  try {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=namaste&tl=hi&client=tw-ob';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Google TTS Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buf = await res.arrayBuffer();
    console.log('Audio buffer length:', buf.byteLength);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
