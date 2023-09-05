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
