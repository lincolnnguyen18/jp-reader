<script>
import Loading from './components/Loading.vue'
export default {
  data() {
    return {
      japaneseText: "",
      mode: "input",
      currentLine: 0,
      language: "ja",
      currentLineText: "",
      backupText: "",
      loading: false
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
    async updateCurrentLine() {
      if (this.language == "ja") {
        if (this.japaneseText[this.currentLine][1]) {
          let line = this.japaneseText[this.currentLine][1].trim()
          if (line) {
            let test = line;
            console.log(test)
            this.$refs.output.innerHTML = test.trim()
          }
        } else {
          this.$refs.output.innerHTML = "Translation unavailable"
        }
      } else {
        this.$refs.output.innerHTML = this.japaneseText[this.currentLine][0].trim()
      }
    },
    async translate() {
      document.getElementById('app').style.justifyContent = "center"
      if (this.mode == 'input') {
        this.loading = true
        this.mode = "output"
        let textToTranslate
        if (this.backupText == "") {
          if (this.japaneseText.trim().length > 600) {
            let index = this.japaneseText.trim().indexOf("。", 600) + 1
            textToTranslate = this.japaneseText.trim().substring(0, index)
            this.backupText = this.japaneseText.trim().substring(index)
          } else {
            textToTranslate = this.japaneseText.trim()
            this.backupText = ""
          }
        } else {
          if (this.backupText.trim().length > 600) {
            let index = this.backupText.trim().indexOf("。", 600) + 1
            textToTranslate = this.backupText.trim().substring(0, index)
            this.backupText = this.backupText.trim().substring(index)
          } else {
            textToTranslate = this.backupText.trim()
            this.backupText = ""
          }
        }
        console.log(textToTranslate)
        console.log(this.backupText)
        if (textToTranslate == "") {
          return -1
        }
        this.japaneseText = await this.translateText(textToTranslate)
        let newJapaneseText = [];
        for (let i = 0; i < this.japaneseText.length; i++) {
          let line = this.japaneseText[i]
          console.log(line[0])
          console.log(line[1])
          let newLine = [];
          newLine.push(line[0].trim())
          this.getFurigana(line[1].trim()).then(result => {
            newLine.push(result)
            newJapaneseText.push(newLine)
            if (i == this.japaneseText.length - 1) {
              this.japaneseText = newJapaneseText
              this.updateCurrentLine()
              this.loading = false
              document.getElementById('app').style.justifyContent = "flex-start"
              // setTimeout(() => {
              //   console.log('test')
              //   this.$refs.loading_icon.classList.add("hidden")
              // }, 10000)
            }
          })
        }
      }
    },
    async translateText(text) {
      const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + encodeURI(text);
      const result = await fetch(url);
      const json = await result.json();

      try {
        console.log(json[0]);
        return json[0];
      } catch (error) {
        return error.message;
      }
    },
    async getFurigana(text) {
      if (!text) return
      console.log(text)
      return await fetch("http://127.0.0.1:1237/get_furigana", {
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
        console.log(data)
        return data.result;
      })
      // return text
    }
  },
  mounted() {
    // listen for arrow key right
    document.addEventListener("keydown", async (e) => {
      if (e.key == "ArrowRight" && !this.loading) {
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
      }
      if (e.key == "ArrowLeft" && !this.loading) {
        if (this.currentLine > 0) {
          this.currentLine--;
          this.updateCurrentLine()
        }
      }
      // space
      if ((e.key == "ArrowUp" || e.key == "ArrowDown") && !this.loading) {
        if (this.language == "ja") {
          this.language = "en";
          this.updateCurrentLine();
        } else {
          this.language = "ja";
          this.updateCurrentLine();
        }
      }
      // escape
      if (e.key == "Escape") {
        this.japaneseText = "";
        this.mode = "input";
        this.currentLine = 0;
        this.backupText = "";
        document.getElementById('app').style.justifyContent = "center"
      }
    });
  },
  components: { Loading }
}
</script>

<template>
  <Loading ref="loading_icon" v-if="loading"></Loading>
  <textarea v-if="mode == 'input'" cols="40" rows="25" v-model="japaneseText" placeholder="Enter Japanese text here"></textarea>
  <div v-else ref="output" class="output" :class="{'hidden': loading}"></div>
  <button class="parse-button" ref="parse_button" @click="translate" v-if="mode == 'input'">Parse</button>
</template>

<style>
.hidden {
  display: none !important;
}
html, body {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
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
}
.output span {
  border-bottom: 1px solid black;
  margin-right: 10px;
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
</style>
