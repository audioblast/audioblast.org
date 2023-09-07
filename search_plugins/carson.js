/*
Carson plugin for searchAB

The Carson plugin for searchAB is a plugin that tidies the user's search query in
order to alow for further processing. As an example it will process the term 
"tremulating orthoptera" to "tremulation" which has a direct match in the audioBlast
vocabulary. A second example is converting the user query "how far can you hear" to the
vocabulary term "sound propagation distance" which has a direct match in the audioBlast
vocabulary.

The plugin is named after Mr Carson, the butler in Downton Abbey, who is known for his
tidiness and attention to detail.
*/

const carson = {
  name:"Carson",
  query:  Promise.resolve(),
  parse(mode, match, core) {
    this.query.then(this.doParse(mode, match, core));
  },
  
  doParse(mode, match, core) {
    match = match.toLowerCase();
    const parts = match.split(" ");
    parts.forEach(match => {
      if (match.toLowerCase().startsWith("tremulat")) {
        core.replaceMatch(match, "Tremulation", this.name);
        return;
      }
      if (match.toLowerCase().startsWith("crepitat")) {
        core.replaceMatch(match, "Crepitation", this.name);
        return;
      }
    });

    if (match.includes("how far")) {
      core.replaceMatch("how far", "Sound propagation distance (m)", this.name);
      return;
    }
    if (match.includes("what distance")) {
      core.replaceMatch("what distance", "Sound propagation distance (m)", this.name);
      return;
    }
    if (match.includes("what frequency")) {
        core.replaceMatch("what frequency", "Peak Frequency (kHz)", this.name);
        return;
      }

  },

  display() {},

  searchSuggest(){
    return([
      "How far away can you hear bullacris membracioides?"
    ]);
  }
}
