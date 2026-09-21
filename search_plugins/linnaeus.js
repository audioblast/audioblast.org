/*
Linnaeus plugin for searchAB.

Linnaeus gives each taxon in the query its rank and its classification, and shows the most specific
one in the taxon box. The rank matters beyond the box: it names the field the recordings and the
traits are filtered by, so nothing that works from a taxon can look it up until Linnaeus has been.

The plugin is named after Carl Linnaeus, the father of modern taxonomy.
*/
const linnaeus = {
  name: "Linnaeus",
  looked: new Map(),

  boxes() {
    return({info: "linnaeus"});
  },

  async recognise(search) {
    const found = [];
    for (const taxon of search.of("taxon")) {
      if (taxon.classification != null) {
        continue;
      }
      if (!this.looked.has(taxon.value)) {
        this.looked.set(taxon.value, await searchFetch(search, AB_API_BASE+"/data/taxa/?taxon="+encodeURIComponent(taxon.value)+"&output=nakedJSON"));
      }
      const best = this.bestMatch(this.looked.get(taxon.value));
      if (best != null) {
        found.push({type: "taxon", value: taxon.value, rank: best["rank"].toLowerCase(), classification: best});
      }
    }
    return(found);
  },

  //A taxon is held by every source that knows it, and a source may hold it at more than one rank:
  //iNaturalist gives Gryllotalpa gryllotalpa both as a species and as a species complex. The most
  //completely classified of the rows at a rank we know is taken, and the first where several tie.
  bestMatch(rows) {
    if (!Array.isArray(rows)) {
      return(null);
    }
    const known = rows.filter(row => row != null && typeof row["rank"] == "string" && TAXON_RANKS.includes(row["rank"].toLowerCase()));
    if (known.length == 0) {
      return(null);
    }
    return(known.reduce((best, row) => (taxonClassified(row) > taxonClassified(best)) ? row : best));
  },

  render(search, boxes) {
    const box = boxes.info;
    const taxon = mostSpecificTaxon(search);
    if (box == null || taxon == null) {
      return;
    }
    const info = taxon.classification;
    const heading = document.createElement("h2");
    heading.textContent = info["rank"]+": "+info["taxon"];
    const italicise = ["genus", "species"];
    const content = [heading];
    TAXON_RANKS.forEach(rank => {
      if (info[rank] == null) {
        return;
      }
      if (content.length > 1) {
        content.push(" > ");
      }
      const link = document.createElement("a");
      link.href = "audioblast.php?search="+encodeURIComponent(info[rank]);
      if (italicise.includes(rank)) {
        const italic = document.createElement("i");
        italic.textContent = info[rank];
        link.appendChild(italic);
      } else {
        link.textContent = info[rank];
      }
      content.push(link);
    });
    content.push(document.createElement("br"), String.fromCharCode(160));
    box.append(...content);
  },

  searchSuggest() {
    return([
      "Gryllotalpa vineae"
    ]);
  }
}
