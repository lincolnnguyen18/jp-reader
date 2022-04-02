<script>
import Loading from './components/Loading.vue'
import _ from 'lodash'
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
    },
    progress: function () {
      return (this.currentLine + 1) / this.japaneseText.length * 100
      // return this.currentLine / (this.japaneseText.length - 1) * 100
    },
  },
  data() {
    return {
      primary1: '#000',
      primary2: '#333',
      secondary: '#fff',
      highlightText: '#000',
      highlightColor: 'yellow',
      border: '#efefef',
      restarting: false,
      speed: 1.2,
      playingAuto: false,
      japaneseText: "",
      helpOpen: false,
      noFuriganaText: "",
      mode: "input",
      currentLine: 0,
      language: "ja",
      currentLineText: "",
      backupText: "",
      backup: "",
      inputBackup: "",
      loading: false,
      langFulls: ["Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chinese", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Nyanja (Chichewa)", "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese (Portugal, Brazil)", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala (Sinhalese)", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tagalog (Filipino)", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian", "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"],
      langAbbrevs: ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh", "co", "hr", "cs", "da", "nl", "en-US", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jv", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "ny", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tl", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"],
      currentLanguage: "en-US",
      languagesOpen: false,
      sourceLanguage: null,
      darkModeOn: false,
      wasDark: false
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
    toggleDarkMode() {
      this.darkModeOn = !this.darkModeOn
      if (this.darkModeOn) {
        this.$refs.dark_mode.classList.remove("material-icons-outlined")
        this.$refs.dark_mode.classList.add("material-icons-round")
        this.primary1 = '#fff'
        this.primary2 = '#fff'
        this.secondary = '#000'
        this.highlightText = '#fff'
        this.highlightColor = 'purple'
        this.border = '#6a6a6a'
        document.body.style.background = this.secondary
        document.body.style.color = this.primary1
      } else {
        this.$refs.dark_mode.classList.remove("material-icons-round")
        this.$refs.dark_mode.classList.add("material-icons-outlined")
        this.primary1 = '#000'
        this.primary2 = '#333'
        this.secondary = '#fff'
        this.highlightText = '#000'
        this.highlightColor = 'yellow'
        this.border = '#efefef'
        document.body.style.background = this.secondary
        document.body.style.color = this.primary1
      }
    },
    changeSpeed() {
      // round this.speed to nearest tenth
      this.speed = Math.round(this.speed * 10) / 10
      console.log(speechSynthesis.speaking)
      if (speechSynthesis.speaking) {
        this.restarting = true
        this.playingAuto = false
        speechSynthesis.cancel()
        this.playAuto()
        this.restarting = false
      }
    },
    restart: _.debounce(function () {
      if (speechSynthesis.speaking) {
        this.restarting = true
        this.playingAuto = false
        speechSynthesis.cancel()
        this.playAuto()
        this.restarting = false
      }
    }, 500),
    playAuto() {
      if (!this.playingAuto) {
        this.playingAuto = true;
        this.playSentence();
        this.$refs.play_auto.innerHTML = "stop_circle";
      } else {
        this.playingAuto = false;
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel()
          this.$refs.play_auto.innerHTML = "play_circle";
        }
        this.$refs.output.innerHTML = this.backup;
      }
    },
    nextLine: async function () {
      if (this.mode != "output") return;
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        this.$refs.play_auto.innerHTML = "play_circle";
        return
      }
      if (this.currentLine < this.japaneseText.length - 1) {
        this.currentLine++;
        this.updateCurrentLine()
        if (this.playingAuto) {
          this.playSentence();
        }
      } else if (this.backupText != "" && !this.playingAuto) {
        // this.$refs.loading_icon.classList.remove("hidden")
        this.mode = "input"
        let flag = await this.translate()
        if (flag != -1) {
          this.currentLine = 0
          // this.updateCurrentLine()
        }
        if (this.playingAuto) {
          setTimeout(() => {
            this.playSentence();
          }, 700);
        }
      } else {
        if (this.playingAuto) {
          this.playingAuto = false;
          this.$refs.output.innerHTML = this.backup;
          this.$refs.play_auto.innerHTML = "play_circle";
        }
      }
    },
    openHelp() {
      this.helpOpen = !this.helpOpen
      setTimeout(() => {
        if (this.darkModeOn)
          document.querySelector('.shortcuts').classList.add("dark")
        else
          document.querySelector('.shortcuts').classList.remove("dark")
      }, 1)
    },
    closeHelp() {
      this.helpOpen = false
    },
    // openHelp: _.debounce(function () {
    //   this.helpOpen = true
    // }, 300),
    toggleVisibility() {
      if (this.mode == "input") {
        return
      }
      this.$refs.output.style.visibility = this.$refs.output.style.visibility == "hidden" ? "visible" : "hidden";
      this.$refs.show.innerHTML = this.$refs.show.innerHTML == 'visibility' ? 'visibility_off' : 'visibility';
    },
    playSentence() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        this.$refs.play_auto.innerHTML = "play_circle";
        return;
      }
      // this.$refs.play.innerHTML = 'volume_up';
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
      sentence = sentence.trim();
      // console.log(sentence)
      // console.log(this.currentLanguage, this.sourceLanguage)
      // console.log(sourceLang)

      if (sourceLang == 'en')
        sourceLang = 'en-US'

      if (!this.restarting)
        this.backup = this.$refs.output.innerHTML;
      // if (this.sourceLang == "ja") {
        this.$refs.output.innerHTML = sentence;
        // console.log(this.$refs.output.innerHTML)
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
      // u.rate = 0.5;
      // u.rate = 3.6;
      u.rate = this.speed;
      let spans = document.querySelector("#app > div span")
      u.onboundary = (e) => {
        // console.log(e)
        // print text from the start of the word to the end of the word
        // console.log(u.text.substring(e.charIndex, e.charIndex + e.charLength));
        // this.$refs.output.innerText = u.text.substring(e.charIndex, e.charIndex + e.charLength);
        let textBeforeWord = u.text.substring(0, e.charIndex);
        let word = u.text.substring(e.charIndex, e.charIndex + e.charLength);
        let textAfterWord = u.text.substring(e.charIndex + e.charLength);
        this.$refs.output.innerHTML = `<span class="highlight">${textBeforeWord}${word}</span>${textAfterWord}`;
        // console.log(`${textBeforeWord}<span class="highlight">${word}</span>${textAfterWord}`)
      }
      u.onend = (e) => {
        // console.log("Finished in " + e.elapsedTime + " seconds.");
          // console.log(this.$refs.output)
        if (!this.playingAuto) {
          this.$refs.output.innerHTML = this.backup;
        }
        // this.$refs.play.innerHTML = 'volume_mute';
        setTimeout(() => {
          // if (this.playingAuto && this.currentLine < this.japaneseText.length - 1) {
          if (this.playingAuto) {
            this.nextLine();
          }
        }, 100)
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
      this.wasDark = this.darkModeOn
      if (this.darkModeOn) {
        this.toggleDarkMode()
      }
      // this.japaneseText = "";
      this.mode = "input";
      this.currentLine = 0;
      this.backupText = "";
      document.getElementById('app').style.justifyContent = "center"
      setTimeout(() => {
      //   this.$refs.textarea.value = this.inputBackup;
        this.$refs.textarea.select();
      }, 1)
      if (this.helpOpen) {
        this.helpOpen = false;
      }
    },
    openLanguages() {
      if (this.languagesOpen) {
        this.languagesOpen = false;
        return;
      }
      this.languagesOpen = true;
      console.log(this.currentLanguageFull)
      setTimeout(() => {
        let el = document.getElementById(this.currentLanguageFull);
        el.scrollIntoView({
          behavior: "auto",
          block: "center"
        });
      }, 1)
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
    loadText() {
      // this.inputBackup = this.$refs.textarea.value;
      this.japaneseText = this.$refs.textarea.value;
      this.translate();
    },
    async translate() {
      document.getElementById('app').style.justifyContent = "center"
      if (this.mode == 'input' && this.japaneseText) {
        if (this.wasDark) {
          this.darkModeOn = false
          setTimeout(() => {
            this.toggleDarkMode()
          }, 1)
        }
        this.loading = true
        this.mode = "output"
        let textToTranslate
        if (this.backupText == "") {
          let period = "。"
          if (this.japaneseText.indexOf(period) == -1)
            period = "."
          if (this.japaneseText.indexOf(period) == -1)
            period = "\n"
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
          if (this.japaneseText.indexOf(period) == -1)
            period = "\n"
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
        // filter out empty lines
        // console.log(this.japaneseText)
        this.japaneseText = this.japaneseText.filter(line => line[0].trim() != "" && line[1].trim() != "");
        // console.log(this.japaneseText)
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
                  // setTimeout(() => {
                  //   if (this.playingAuto) {
                  //     this.playSentence();
                  //   }
                  // }, 500)
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
                this.noFuriganaText = this.japaneseText
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
      // text = text.replace('#', '')
      // text = text.replace('&', '')
      console.log(text)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${this.currentLanguage}&dt=t&q=` + encodeURIComponent(text);
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
      if (!this.mode == "output") return;
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
      if ((e.key == "ArrowRight" || e.key == "l") && !this.loading) {
        this.nextLine()
      }
      if ((e.key == "ArrowLeft" || e.key == "j") && !this.loading) {
        if (this.mode != "output") return;
        // console.log(this.currentLine / this.japaneseText.length)
        if (speechSynthesis.speaking) {
          this.playingAuto = false
          speechSynthesis.cancel();
          this.$refs.play_auto.innerHTML = "play_circle";
          return
        }
        if (this.currentLine > 0) {
            this.currentLine--;
            this.updateCurrentLine()
        }
      }
      // space
      if ((e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == 'i') && !this.loading) {
        if (this.mode != "output") return;
        if (speechSynthesis.speaking) {
          this.playingAuto = false
          speechSynthesis.cancel();
          this.$refs.play_auto.innerHTML = "play_circle";
          return
        }
        if (this.language == "ja") {
          this.language = "en";
          this.updateCurrentLine();
        } else {
          this.language = "ja";
          this.updateCurrentLine();
        }
      }
      if (e.key == "d" && this.mode == "output") {
        this.toggleDarkMode();
      }
      // escape
      if (e.key == "Escape") {
        if (this.mode != "output" && this.languagesOpen) {
          this.languagesOpen = false;
          return;
        }
        if (this.mode != "output") return;
        if (this.helpOpen) {
          this.closeHelp();
          return;
        }
        if (speechSynthesis.speaking) {
          this.playingAuto = false
          speechSynthesis.cancel();
          this.$refs.play_auto.innerHTML = "play_circle";
          return
        }
        // this.closeOutput();
      }
      if ((e.key == " " || e.key == "k") && !this.loading) {
        if (this.mode != "output") return;
        this.playAuto();
        // this.playSentence();
      }
      // listen for v
      if (e.key == "v" || e.key == "o") {
        if (this.mode != "output") return;
        this.toggleVisibility();
      }
      if (e.key == "[" && this.speed > 0.5 ) {
        this.speed -= 0.1;
        this.changeSpeed();
      }
      if (e.key == "]" && this.speed < 3.6 ) {
        this.speed += 0.1;
        this.changeSpeed();
      }
    });
    // print window url
    // console.log(window.location.href)
    // get query argument 'text' form url
    let text = params.text
    // console.log(text)
    if (text) {
      // this.$refs.textarea.value = text
      this.japaneseText = text
    }
  },
  components: { Loading }
}
</script>

<template>
  <div class="progress" :style="{width: progress + '%'}" v-if="this.mode != 'input'"></div>
  <Loading ref="loading_icon" v-if="loading"></Loading>
  <textarea v-show="mode == 'input'" cols="40" rows="25" placeholder="Enter text to translate here" ref="textarea" autofocus></textarea>
  <div v-show="mode != 'input'" ref="output" class="output" :class="{'hidden': loading}"></div>
  <div class="bottom" v-if="mode == 'input'">
    <div class="languages-wrapper">
      <div class="languages-label">Translate to:</div>
      <div class="languages">
        <div class="toggle" @click="openLanguages" v-clickOutside="closeLanguages">
          <span class="current-lang">{{ currentLanguageFull }}</span>
          <span class="material-icons-outlined">expand_more</span>
        </div>
        <div class="popup" v-if="languagesOpen">
          <div v-for="language in langFulls" class="language" :key="language" @click="changeLanguage(language)" :id="language">{{ language }}</div>
        </div>
      </div>
    </div>
    <button class="parse-button" ref="parse_button" @click="loadText" >Parse</button>
  </div>
  <span class="material-icons-outlined play_auto" v-if="mode != 'input'" @click="playAuto" ref="play_auto">play_circle</span>
  <span class="material-icons-outlined show" @click="toggleVisibility" v-if="mode != 'input'" ref="show">visibility</span>
  <!-- <span class="material-icons-outlined play" @click="playSentence" v-if="mode != 'input'" ref="play">volume_mute</span> -->
  <span class="material-icons-outlined close" @click="closeOutput" v-if="mode != 'input'">close</span>
  <div class="slidecontainer" v-if="mode != 'input'">
    <span class="material-icons-outlined speed">speed</span>
    <input type="range" min="0.5" max="3.6" class="slider" v-model="speed" @change="changeSpeed" step="0.1" ref="slider">
  </div>
  <div class="help-stuff" v-clickOutside="closeHelp">
    <span class="material-icons-outlined question" @click="openHelp" v-if="mode != 'input'">help_outline</span>
    <span class="material-icons-outlined dark_mode" ref="dark_mode" @click="toggleDarkMode" v-if="mode != 'input'">dark_mode</span>
    <div class="shortcuts" v-if="helpOpen">
      <div class="shortcut">
        <span class="key">Left arrow or J</span>
        <span class="description">Navigate to previous sentence</span>
      </div>
      <div class="shortcut">
        <span class="key">Right arrow or L</span>
        <span class="description">Navigate to next sentence</span>
      </div>
      <div class="shortcut">
        <span class="key">Up/down arrow or I</span>
        <span class="description">Switch sentence language</span>
      </div>
      <div class="shortcut">
        <span class="key">Space or K</span>
        <span class="description">Start/stop text to speech if available for language</span>
      </div>
      <div class="shortcut">
        <span class="key">V or O</span>
        <span class="description">Show/hide sentence</span>
      </div>
      <div class="shortcut">
        <span class="key">Left bracket</span>
        <span class="description">Decrease text to speech speed</span>
      </div>
      <div class="shortcut">
        <span class="key">Right bracket</span>
        <span class="description">Increase text to speech speed</span>
      </div>
      <!-- <div class="shortcut">
        <span class="key">Escape</span>
        <span class="description">Close sentences</span>
      </div> -->
      <div class="shortcut">
        <span class="key">D</span>
        <span class="description">Toggle dark mode on/off</span>
      </div>
    </div>
  </div>
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
  /* gap: 14px; */
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
  border: 1px solid #808080;
  margin-bottom: 14px;
}
.output {
  line-height: 2;
  padding: 60px 0;
  margin: auto 0;
  word-break: break-word;
  font-size: 22px;
}
.output span {
  border-bottom: 1px solid v-bind('primary1');
  margin-right: 10px;
}
.output .highlight {
  border-bottom: none;
  margin-right: 0;
  background-color: v-bind('highlightColor');
  color: v-bind('highlightText');
}
/* .dark {
  background: #000!important;
  color: #fff!important;
}
.dark2 {
  background: #fff!important;
}
.dark2::-webkit-slider-thumb {
  background: #fff!important;
} */
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
.close:hover, .play:hover, .show:hover, .question:hover, .play_auto:hover, .dark_mode:hover {
  color: #aaa;
}
.close, .play, .show, .question, .play_auto, .speed, .dark_mode {
  color: v-bind('primary2');
  z-index: 2;
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
.show {
  position: fixed;
  top: 20px;
  right: 160px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.play_auto {
  position: fixed;
  top: 20px;
  right: 90px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.close {
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.question {
  position: fixed;
  top: 20px;
  left: 20px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.dark_mode {
  position: fixed;
  top: 20px;
  left: 90px;
  font-size: 30px;
  user-select: none;
  cursor: pointer;
}
.shortcuts {
  position: absolute;
  top: 60px;
  left: 20px;
  padding: 5px 10px;
  background: v-bind('secondary');
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 4px rgb(0 0 0 / 25%);
  border: 1px solid #767676;
  border-radius: 7px;
}
.shortcut {
  display: grid;
  grid-template-columns: 170px auto;
  padding: 5px 0;
  border-bottom: 1px solid v-bind('border');
}
.shortcut:last-child {
  border-bottom: none;
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
.slidecontainer {
  position: absolute;
  width: 100%;
  left: -22px;
  top: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  z-index: 0;
}
.slidecontainer span {
  font-size: 30px;
  user-select: none;
}
.slidecontainer input {
  width: 300px;
  appearance: none;
  height: 5px;
  background: v-bind('primary2');
  /* box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25); */
  border-radius: 16px;
  outline: none;
}
.slidecontainer input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background: v-bind('primary2');
  /* border: 1px solid #E0E0E0; */
  box-sizing: border-box;
  /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
  border-radius: 60px;
}
/* .slidecontainer input {
  width: 300px;
  appearance: none;
  height: 7px;
  background: #bbb;
  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  outline: none;
}
.slidecontainer input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 23px;
  height: 23px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #E0E0E0;
  box-sizing: border-box;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 60px;
} */
.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: v-bind('primary2');
  /* opacity: 0.5; */
  z-index: 1;
}
</style>
