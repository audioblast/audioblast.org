/*
Carson plugin for searchAB

The Carson plugin tidies the user's query so the rest can work on it: it turns the way a question
is asked into the trait it is asking about, so "how far can you hear" becomes the trait
"Sound propagation distance (m)", and a word such as "tremulating" becomes the trait value
"Tremulation" that the data is written with.

The plugin is named after Mr Carson, the butler in Downton Abbey, who is known for his tidiness
and attention to detail.
*/
const carson = {
  name: "Carson",

  //How a question might be asked, and the trait it asks about
  questions: [
    {asked: "how far", trait: "Sound propagation distance (m)"},
    {asked: "what distance", trait: "Sound propagation distance (m)"},
    {asked: "what frequency", trait: "Peak Frequency (kHz)"}
  ],

  //How a word might be written, and the trait value the data writes it as
  words: [
    {start: "tremulat", value: "Tremulation"},
    {start: "crepitat", value: "Crepitation"}
  ],

  recognise(search) {
    const text = search.remaining().toLowerCase();
    const found = [];
    this.questions.forEach(question => {
      if (text.includes(question.asked)) {
        found.push({type: "trait", trait: question.trait, text: question.asked});
      }
    });
    text.split(/\s+/).forEach(word => {
      this.words.forEach(known => {
        if (word.startsWith(known.start)) {
          found.push({type: "traitValue", value: known.value, text: word});
        }
      });
    });
    return(found);
  },

  searchSuggest() {
    return([
      "How far away can you hear bullacris membracioides?",
      "What frequency is Gryllotalpa vineae?"
    ]);
  }
}
