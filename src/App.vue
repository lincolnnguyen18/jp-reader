<script>
import Loading from './components/Loading.vue'
const getCookie = (key) => {
  let cookie = document.cookie.split('; ')
  for (let i = 0; i < cookie.length; i++) {
    let arr = cookie[i].split('=')
    if (arr[0] === key) {
      return arr[1]
    }
  }
  return ''
}
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const getRawJapanese = (node) => {
  let div =  document.createElement('div');
  div.innerHTML = node.innerHTML.replace(/<rt.*?>.*?<\/rt>/ig,'');
  return div.innerText;
}
window.u = new SpeechSynthesisUtterance();
const clickOutside = {
  mounted: (el, binding, vnode) => {
    el.clickOutsideEvent = (e) => {
      if (!el.contains(e.target)) {
        binding.value();
      }
    };
    setTimeout(() => {
      window.addEventListener('click', el.clickOutsideEvent);
    }, 1);
  },
  unmounted: (el) => {
    window.removeEventListener('click', el.clickOutsideEvent);
  }
}
export default {
  directives: {
    clickOutside
  },
  computed: {
    currentLanguageFull: function () {
      // get index of currentLanguage in langFulls
      var index = this.langAbbrevs.indexOf(this.currentLanguage)
      return this.langFulls[index]
    }
  },
  data() {
    return {
      japaneseText: "",
      noFuriganaText: "",
      mode: "input",
      currentLine: 0,
      language: "ja",
      currentLineText: "",
      backupText: "",
      loading: false,
      langFulls: ["Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chinese", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Nyanja (Chichewa)", "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese (Portugal, Brazil)", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala (Sinhalese)", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tagalog (Filipino)", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"],
      langAbbrevs: ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh", "co", "hr", "cs", "da", "nl", "en-US", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ny", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"],
      currentLanguage: "en-US",
      languagesOpen: false,
      sourceLanguage: null
    }
  },
  // computed: {
  //   currentLineText() {
  //     console.log(this.japaneseText)
  //     if (this.language == "ja") {
  //       let line = this.japaneseText[this.currentLine][1]
  //       let test = this.getFurigana(line);
  //       console.log(test)
  //       return line
  //     } else {
  //       return this.japaneseText[this.currentLine][0]
  //     }
  //   }
  // },
  methods: {
    playSentence() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        return;
      }
      this.$refs.play.innerHTML = 'volume_up';
      let sentence;
      let sourceLang;
      if (this.language == "en") {
        if (this.currentLanguage == "ja")
          sentence = this.noFuriganaText[this.currentLine][0]
        else
          sentence = this.japaneseText[this.currentLine][0]
        sourceLang = this.currentLanguage;
      } else {
        if (this.sourceLanguage == "ja")
          sentence = this.noFuriganaText[this.currentLine][1]
        else
          sentence = this.japaneseText[this.currentLine][1]
        sourceLang = this.sourceLanguage;
      }
      console.log(sentence)
      console.log(this.currentLanguage, this.sourceLanguage)
      console.log(sourceLang)

      let backup = this.$refs.output.innerHTML;
      // if (this.sourceLang == "ja") {
        this.$refs.output.innerHTML = sentence;
        console.log(this.$refs.output.innerHTML)
      // }

      // let supportedLangs = speechSynthesis.getVoices().map(function(voice) {
      //   return voice.lang.split('-')[0];
      // });
      let supportedLangs = ['en-US', 'it', 'sv', 'fr', 'de', 'he', 'id', 'es', 'nl', 'ro', 'pt', 'th', 'ja', 'sk', 'hi', 'ar', 'hu', 'zh', 'el', 'ru', 'nb', 'da', 'fi', 'tr', 'ko', 'pl', 'cs']
      if (!supportedLangs.includes(sourceLang)) {
        return
      }

      u.text = sentence;
      u.lang = sourceLang;
      u.rate = 1.2;
      let spans = document.querySelector("#app > div span")
      u.onboundary = (e) => {
        // console.log(e)
        // print text from the start of the word to the end of the word
        console.log(u.text.substring(e.charIndex, e.charIndex + e.charLength));
        // this.$refs.output.innerText = u.text.substring(e.charIndex, e.charIndex + e.charLength);
        let textBeforeWord = u.text.substring(0, e.charIndex);
        let word = u.text.substring(e.charIndex, e.charIndex + e.charLength);
        let textAfterWord = u.text.substring(e.charIndex + e.charLength);
        this.$refs.output.innerHTML = `<span class="highlight">${textBeforeWord}${word}</span>${textAfterWord}`;
        // console.log(`${textBeforeWord}<span class="highlight">${word}</span>${textAfterWord}`)
      }
      u.onend = (e) => {
        console.log("Finished in " + e.elapsedTime + " seconds.");
          // console.log(this.$refs.output)
        this.$refs.output.innerHTML = backup;
        this.$refs.play.innerHTML = 'volume_mute';
      }
      // var u = new SpeechSynthesisUtterance();
      // u.text = sentence;
      // u.lang = 'ja';
      // u.rate = 1.2;
      // u.onboundary = function(event) {
      //   console.log(event)
      // }
      speechSynthesis.speak(u);
    },
    closeOutput() {
      // this.japaneseText = "";
      this.mode = "input";
      this.currentLine = 0;
      this.backupText = "";
      document.getElementById('app').style.justifyContent = "center"
      setTimeout(() => {
        this.$refs.textarea.select();
      }, 100)
    },
    openLanguages() {
      this.languagesOpen = true;
    },
    toggleLanguages() {
      this.languagesOpen = !this.languagesOpen;
    },
    closeLanguages() {
      this.languagesOpen = false;
    },
    changeLanguage(langFull) {
      let index = this.langFulls.indexOf(langFull);
      this.currentLanguage = this.langAbbrevs[index];
      // update cookie to remember language
      document.cookie = "language=" + this.currentLanguage;
      this.closeLanguages();
    },
    async updateCurrentLine() {
      if (this.language == "ja") {
        if (this.japaneseText[this.currentLine][1]) {
          let line = this.japaneseText[this.currentLine][1].trim()
          if (line) {
            let test = line;
            // console.log(test)
            this.$refs.output.innerHTML = test.trim()
          }
        } else {
          this.$refs.output.innerHTML = "Translation unavailable"
          // console.log(this.japaneseText[this.currentLine])
        }
      } else {
        this.$refs.output.innerHTML = this.japaneseText[this.currentLine][0].trim()
      }
    },
    async translate() {
      document.getElementById('app').style.justifyContent = "center"
      if (this.mode == 'input' && this.japaneseText) {
        this.loading = true
        this.mode = "output"
        let textToTranslate
        if (this.backupText == "") {
          let period = "。"
          if (this.japaneseText.indexOf(period) == -1)
            period = "."
          if (this.japaneseText.trim().length > 600) {
            let index = this.japaneseText.trim().indexOf(period, 600) + 1
            // console.log(this.japaneseText.trim())
            // console.log(this.japaneseText.trim().indexOf(period, 600))
            if (index == 0) {
              index = this.japaneseText.trim().lastIndexOf(period) + 1
              if (index == 0) {
                index = 600
              }
            }
            textToTranslate = this.japaneseText.trim().substring(0, index)
            this.backupText = this.japaneseText.trim().substring(index)
          } else {
            textToTranslate = this.japaneseText.trim()
            this.backupText = ""
          }
        } else {
          let period = "。"
          if (this.backupText.indexOf(period) == -1)
            period = "."
          if (this.backupText.trim().length > 600) {
            let index = this.backupText.trim().indexOf(period, 600) + 1
            if (index == 0) {
              index = this.backupText.trim().lastIndexOf(period) + 1
              if (index == 0) {
                index = 600
              }
            }
            textToTranslate = this.backupText.trim().substring(0, index)
            this.backupText = this.backupText.trim().substring(index)
          } else {
            textToTranslate = this.backupText.trim()
            this.backupText = ""
          }
        }
        // console.log(textToTranslate)
        // console.log(this.backupText)
        if (textToTranslate == "") {
          return -1
        }
        this.japaneseText = await this.translateText(textToTranslate)
        if (this.sourceLanguage == "ja") {
          let newJapaneseText = [];
          for (let i = 0; i < this.japaneseText.length; i++) {
            let line = this.japaneseText[i]
            // console.log(line[0])
            // console.log(line[1])
            let newLine = []
            newLine.push(line[0].trim())
            this.getFurigana(line[1].trim()).then(result => {
              if (result)
                newLine.push(result)
              else
                newLine.push(line[1].trim())
              newJapaneseText[i] = newLine
              if (i == this.japaneseText.length - 1) {
                this.noFuriganaText = this.japaneseText
                this.japaneseText = newJapaneseText
                setTimeout(() => {
                  this.updateCurrentLine()
                  this.loading = false
                  document.getElementById('app').style.justifyContent = "flex-start"
                }, 100)
              }
            })
          }
        } else if (this.currentLanguage == "ja") {
          let newJapaneseText = [];
          for (let i = 0; i < this.japaneseText.length; i++) {
            let line = this.japaneseText[i]
            // console.log(line[0])
            // console.log(line[1])
            let newLine = []
            newLine[1] = line[1].trim()
            this.getFurigana(line[0].trim()).then(result => {
              if (result)
                newLine[0] = result
              else
                newLine[0] = line[0].trim()
              newJapaneseText[i] = newLine
              if (i == this.japaneseText.length - 1) {
                this.japaneseText = newJapaneseText
                this.updateCurrentLine()
                this.loading = false
                document.getElementById('app').style.justifyContent = "flex-start"
              }
            })
          }
        } else {
          this.updateCurrentLine()
          this.loading = false
          document.getElementById('app').style.justifyContent = "flex-start"
        }
      }
    },
    async translateText(text) {
      // remove hash tags from text
      text = text.replace('#', '')
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${this.currentLanguage}&dt=t&q=` + encodeURI(text);
      const result = await fetch(url);
      const json = await result.json();

      try {
        // console.log(json);
        // console.log(json[0]);
        this.sourceLanguage = json[2]
        return json[0];
      } catch (error) {
        return error.message;
      }
    },
    async getFurigana(text) {
      if (!text) return
      return await fetch("https://demo6.lincolnnguyen18.com/get_furigana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text
        })
      })
      .then(res => res.json())
      .then(data => {
        // console.log(data)
        return data.result;
      })
      // return text
    }
  },
  mounted() {
    // update this.currentLanguage with saved cookie if it exists
    if (getCookie("language")) {
      this.currentLanguage = getCookie("language")
    }
    // listen for arrow key right
    document.addEventListener("keydown", async (e) => {
      // check if key is alphabetic
      if (e.key.length == 1 && (e.key >= "a" && e.key <= "z" || e.key >= "A" && e.key <= "Z")) {
        // check if langauges popup is open
        if (this.languagesOpen) {
          // get first language that starts with letter in this.langFulls
          let language = this.langFulls.find(lang => lang.startsWith(e.key.toUpperCase()))
          // console.log(language)
          let el = document.getElementById(language)
          // console.log(el)
          el.scrollIntoView({
            behavior: "auto",
            block: "center"
          })
        }
      }
      if (e.key == "ArrowRight" && !this.loading) {
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        setTimeout(async () => {
          if (this.currentLine < this.japaneseText.length - 1) {
            this.currentLine++;
            this.updateCurrentLine()
          } else if (this.backupText != "") {
            // this.$refs.loading_icon.classList.remove("hidden")
            this.mode = "input"
            let flag = await this.translate()
            if (flag != -1) {
              this.currentLine = 0
              // this.updateCurrentLine()
            }
          }
        }, 100)
      }
      if (e.key == "ArrowLeft" && !this.loading) {
        if (this.currentLine > 0) {
          setTimeout(() => {
            this.currentLine--;
            this.updateCurrentLine()
          }, 100)
        }
      }
      // space
      if ((e.key == "ArrowUp" || e.key == "ArrowDown") && !this.loading) {
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        setTimeout(() => {
          if (this.language == "ja") {
            this.language = "en";
            this.updateCurrentLine();
          } else {
            this.language = "ja";
            this.updateCurrentLine();
          }
        }, 100)
      }
      // escape
      if (e.key == "Escape") {
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        this.closeOutput();
      }
      if (e.key == " ") {
        this.playSentence();
      }
    });
    // print window url
    // console.log(window.location.href)
    // get query argument 'text' form url
    let text = params.text
    // console.log(text)
    if (text) {
      this.$refs.textarea.value = text
      this.japaneseText = text
    }
  },
  components: { Loading }
}
</script>

<template>
  <Loading ref="loading_icon" v-if="loading"></Loading>
  <textarea v-if="mode == 'input'" cols="40" rows="25" v-model="japaneseText" placeholder="Enter text to translate here" ref="textarea" autofocus></textarea>
  <div v-else ref="output" class="output" :class="{'hidden': loading}"></div>
  <div class="bottom" v-if="mode == 'input'">
    <div class="languages-wrapper">
      <div class="languages-label">Translate to:</div>
      <div class="languages">
        <div class="toggle" @click="toggleLanguages" v-clickOutside="closeLanguages">
          <span class="current-lang">{{ currentLanguageFull }}</span>
          <span class="material-icons-outlined">expand_more</span>
        </div>
        <div class="popup" v-if="languagesOpen">
          <div v-for="language in langFulls" class="language" :key="language" @click="changeLanguage(language)" :id="language">{{ language }}</div>
        </div>
      </div>
    </div>
    <button class="parse-button" ref="parse_button" @click="translate" >Parse</button>
  </div>
  <span class="material-icons-outlined play" @click="playSentence" v-if="mode != 'input'" ref="play">volume_mute</span>
  <span class="material-icons-outlined close" @click="closeOutput" v-if="mode != 'input'">close</span>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp');

.hidden {
  display: none !important;
}
html, body {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
}
#app {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 500px;
  height: 100%;
  justify-content: center;
}
textarea {
  resize: none;
  border-radius: 7px;
  padding: 16px;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
}
.output {
  line-height: 2;
  padding: 60px 0;
  margin: auto 0;
  word-break: break-word;
  font-size: 22px;
}
.output span {
  border-bottom: 1px solid black;
  margin-right: 10px;
}
.output .highlight {
  border-bottom: none;
  margin-right: 0;
  background-color: #efff5b;
}
.parse-button {
  width: fit-content;
  align-self: flex-end;
  padding: 10px 14px;
  border: none;
  border-radius: 7px;
  background-color: black;
  color: white;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
}
.parse-button:hover {
  background-color: #333;
}
.close:hover, .play:hover {
  color: #aaa;
}
.bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.play {
  position: fixed;
  top: 20px;
  right: 90px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.isPlaying {
  color: #aaa;
}
.close {
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.languages {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  position: relative;
}
.current-lang {
  width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.toggle {
  display: flex;
  align-items: center;
}
.popup {
  position: absolute;
  bottom: 34px;
  background: white;
  padding: 0 3px;
  left: -10px;
  width: 130px;
  border-radius: 7px;
  height: 300px;
  overflow-y: auto;
  box-shadow: 0px 4px 4px rgb(0 0 0 / 25%);
  border: 1px solid #767676;
}
/* .languages-label {
  margin-right: 10px;
} */
.languages-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.language {
  padding: 10px;
  cursor: pointer;
  user-select: none;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e1e1e1;
}
.language:last-child {
  border-bottom: none;
}
.language:hover {
  background-color: #e1e1e1;
}
.language:focus {
  background-color: #e1e1e1;
}
</style>
