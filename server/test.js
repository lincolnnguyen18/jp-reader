const fetch = require('node-fetch');

fetch("http://localhost:1237/get_furigana", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ text: "太郎はこの本を二郎を見た女性に渡した。" })
})
.then(res => res.json())
.then(json => console.log(json));