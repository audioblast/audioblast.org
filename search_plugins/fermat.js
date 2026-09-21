/*
Fermat search plugin for searchAB

The Fermat plugin shows the annotations made of the taxon the query named.

The plugin is named after Fermat, who made a significant annotation.
*/
const fermat = {
  name: "Fermat",
  //A search that named a trait is answered by the traits box, not by a list of annotations
  suppressedBy: ["trait", "traitValue", "namedTraitValue"],

  boxes() {
    return({content: "fermat"});
  },

  async render(search, boxes) {
    const box = boxes.content;
    const taxon = mostSpecificTaxon(search);
    if (box == null || taxon == null) {
      return;
    }
    //Annotations are held against the name itself rather than against a rank
    const name = taxon.classification["taxon"];
    const any = await searchFetch(search, AB_API_BASE+"/data/annomate/?taxon="+encodeURIComponent(name)+"&page_size=1&output=nakedJSON");
    if (!Array.isArray(any) || any.length == 0) {
      return;
    }
    const heading = document.createElement("h2");
    heading.textContent = "Annotations";
    const table = document.createElement("div");
    table.id = "annotations-tabulator";
    table.className = "search-table";
    box.append(heading, table);
    generateTabulator("#annotations-tabulator", "annomate", {field: "taxon", type: "=", value: name});
  }
}
