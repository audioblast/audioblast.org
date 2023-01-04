const carson = {
  name:"Carson",
  parse(mode, match, core) {
    match = match.toLowerCase();
    const parts = match.split(" ");
    parts.forEach(match => {
      if (match.toLowerCase().startsWith("tremulati")) {
        core.replaceMatch(match, "tremulation", this.name);
        return;
      }
      if (match.toLowerCase().startsWith("crepitati")) {
        core.replaceMatch(match, "crepitation", this.name);
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

  },

  searchSuggest(){
    return([
      "How far away can you hear bullacris membracioides?"
    ]);
  }
}
