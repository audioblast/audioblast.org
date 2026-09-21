/*
Watson search plugin for searchAB

The Watson plugin shows the recordings of the taxon the query named.

The plugin is named after Chris Watson, a sound recordist who has worked on many David Attenborough
nature documentaries.
*/
const recordingSearch = {
  name: "Watson",
  //A search that named a trait is answered by the traits box, not by a list of recordings
  suppressedBy: ["trait", "traitValue", "namedTraitValue"],

  boxes() {
    return({content: "watson"});
  },

  async render(search, boxes) {
    const box = boxes.content;
    const taxon = mostSpecificTaxon(search);
    if (box == null || taxon == null) {
      return;
    }
    const rank = taxon.rank;
    const name = taxon.classification["taxon"];
    const any = await searchFetch(search, AB_API_BASE+"/data/recordingstaxa/?"+encodeURIComponent(rank)+"="+encodeURIComponent(name)+"&page_size=1&output=nakedJSON");
    if (!Array.isArray(any) || any.length == 0) {
      return;
    }
    const heading = document.createElement("h2");
    heading.textContent = "Recordings of "+rank+" "+name;
    const table = document.createElement("div");
    table.id = "recordingstaxa-tabulator";
    table.className = "search-table";
    box.append(heading, table);
    generateTabulator("#recordingstaxa-tabulator", "recordingstaxa", {field: rank, type: "=", value: name});
  }
}
