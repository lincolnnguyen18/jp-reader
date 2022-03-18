const test = '<span><ruby>魔法使<rt>まほうつか</rt>い</ruby>の</span><span><ruby>女の子<rt>おんなのこ</rt></ruby>は、</span><span><ruby>腰<rt>こし</rt></ruby>を</span><span><ruby>抜<rt>ぬ</rt>かし</ruby>ている。</span>';
const pattern = /<ruby>.*?<rt>(.*?)<\/rt>(.*?)<\/ruby>/g;
let matches = test.matchAll(pattern);
for (let match of matches) {
  console.log(`${match[0]} -> ${match[1]}${match[2]}`);
}