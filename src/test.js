window.u = new SpeechSynthesisUtterance();
let voices = speechSynthesis.getVoices()

u.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.lang.split('-')[0] === 'de' && voice.voiceURI.includes('Google') })[0];
u.text = "話す内容"
u.onboundary = function (e) {
  console.log(e)
}
speechSynthesis.speak(u);



u.lang = "es-MX";
u.text = "hola amigo!"
u.onboundary = function (e) {
  console.log(e)
}
speechSynthesis.speak(u);


u.lang = "ja-JP";
u.text = "話す内容"
u.onboundary = function (e) {
  console.log(e)
}
speechSynthesis.speak(u);