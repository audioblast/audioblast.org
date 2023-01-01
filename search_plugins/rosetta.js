const rosetta = {
  name:"Rosetta",
  preParse(string, core) {
    if(string == "🦗")  {
      core.consoleLog(this.name, "Interpreted 🦗 as Orthoptera.");
      return("Orthoptera");
    }
    return(string);
  },
  canParse(string, core) {
    core.parsed(this.name, false);
  },
  searchSuggest() {
    return(["🦗"]);
  }
}
