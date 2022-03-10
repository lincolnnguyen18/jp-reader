const { exec } = require("child_process");
const express = require("express");
const cors = require('cors')
const romajiConv = require('@koozaki/romaji-conv');
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.post("/get_furigana", (req, res) => {
  const { text } = req.body;
  console.log(text)
  const command = `echo "${text}" | cabocha -f1`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      res.send({ error: true });
      return;
    }
    console.log(stdout)
    let html = "";
    let htmlPiece = "<span>";
    let lines = stdout.split("\n");
    lines.forEach(line => {
      if (line.length === 0) {
        return;
      }
      let tokens = line.split("\t");
      console.log(tokens)
      if (tokens.length == 2) {
        let word = tokens[0];
        tokens = tokens[1].split(",");
        let furigana = tokens[7];
        try {
          furigana = romajiConv(furigana).toHiragana();
          if (word != furigana) {
            let i = furigana.length - 1;
            let j = word.length - 1;
            console.log(`furigana: ${furigana}`)
            console.log(`word: ${word}`)
            while (furigana[i] && word[j] && furigana[i] == word[j]) {
              console.log(`${furigana[i]} == ${word[j]}`)
              i--;
              j--;
            }
            furigana = furigana.substring(0, i + 1);
            console.log(`furigana!: ${furigana}`)
            let remainder = word.substring(j + 1);
            console.log(`remainder!: ${remainder}`)
            word = word.substring(0, j + 1);
            console.log(`word!: ${word}`)
            console.log('test')
            htmlPiece += `<ruby>${word}<rt>${furigana}</rt>${remainder}</ruby>`;
          } else {
            htmlPiece += word;
          }
        } catch (e) {
          htmlPiece += word;
        }
      } else if (htmlPiece != "<span>") {
        htmlPiece += "</span>";
        html += htmlPiece;
        htmlPiece = "<span>";
      }
    });
    res.send({ error: false, result: html });
  });
});

const port = 1237;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));  