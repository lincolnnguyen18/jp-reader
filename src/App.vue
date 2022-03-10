<script>
export default {
  data() {
    return {
      japaneseText: "",
      mode: "input",
      currentLine: 0,
      language: "ja",
      currentLineText: "",
      backupText: "",
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
        let line = this.japaneseText[this.currentLine][1]
        let test = await this.getFurigana(line);
        console.log(test)
        // this.currentLineText = test
        this.$refs.output.innerHTML = test.trim()
      } else {
        // return this.japaneseText[this.currentLine][0]
        // this.currentLineText = this.japaneseText[this.currentLine][0]
        this.$refs.output.innerHTML = this.japaneseText[this.currentLine][0].trim()
      }
    },
    async translate() {
      if (this.mode == 'input') {
        this.mode = "output"
        let textToTranslate
        if (this.backupText == "") {
          // get index of first period after 600 characters of this.japaneseText
          let index = this.japaneseText.indexOf("。", 600) + 1
          textToTranslate = this.japaneseText.trim().substring(0, index)
          // save remaining characters into this.backupText
          this.backupText = this.japaneseText.trim().substring(index)
        } else {
          let index = this.backupText.indexOf("。", 600) + 1
          textToTranslate = this.backupText.trim().substring(0, index)
          this.backupText = this.backupText.trim().substring(index)
        }
        console.log(textToTranslate)
        console.log(this.backupText)
        if (textToTranslate == "") {
          return -1
        }
        this.japaneseText = await this.translateText(textToTranslate)
        this.updateCurrentLine()
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
      // return await fetch("http://127.0.0.1:3002/get_furigana", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     text: text
      //   })
      // })
      // .then(res => res.json())
      // .then(data => {
      //   console.log(data)
      //   return data.result;
      // })
      return text
    }
  },
  mounted() {
    // listen for arrow key right
    document.addEventListener("keydown", async (e) => {
      if (e.key == "ArrowRight") {
        if (this.currentLine < this.japaneseText.length - 1) {
          this.currentLine++;
          this.updateCurrentLine()
        } else if (this.backupText != "") {
          this.mode = "input"
          let flag = await this.translate()
          if (flag != -1) {
            this.currentLine = 0
            this.updateCurrentLine()
          }
        }
      }
      if (e.key == "ArrowLeft") {
        if (this.currentLine > 0) {
          this.currentLine--;
          this.updateCurrentLine()
        }
      }
      // space
      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
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
      }
    });
  }
}
</script>

<template>
  <textarea v-if="mode == 'input'" cols="40" rows="25" v-model="japaneseText" placeholder="Enter Japanese text here"></textarea>
  <div v-else ref="output"></div>
  <button class="parse-button" ref="parse_button" @click="translate" v-if="mode == 'input'">Parse</button>
</template>

<style>
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
  gap: 7px;
  max-width: 500px;
}
textarea {
  resize: none;
  border-radius: 7px;
  padding: 7px;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
}
.parse-button {
  width: fit-content;
  align-self: flex-end;
  padding: 10px 14px;
  border: none;
  border-radius: 7px;
  background-color: #b9b9b9;
  font-size: 16px;
}
</style>
