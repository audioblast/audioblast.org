/*
Ray search plugin for searchAB

Ray reads a common name in the query and finds the taxon it belongs to, so that audioBlast can be
searched in the words people actually use and not only in binomials.

A name belongs to its taxon through the links table rather than through a column of its own, so
the name is looked up, then the link that says what it denotes, then the taxon that link points at.

Named after John Ray, whose catalogues set the common names of plants and animals beside their
scientific ones.
*/
const ray = {
  name: "Ray",
  //A vernacular name denotes the taxon it is a name of
  denotes: "http://purl.obolibrary.org/obo/IAO_0000219",
  //At most this many names are followed, as a short query is a part of many of them
  maxNames: 3,
  //Shorter than this is part of too many names to be worth asking about
  minLength: 4,
  asked: new Map(),
  taxa: new Map(),

  boxes() {
    return({info: "ray"});
  },

  async recognise(search) {
    //Only what nothing else has accounted for: a query that already names its taxon outright
    //leaves nothing here
    const text = search.remaining();
    if (text.length < this.minLength) {
      return([]);
    }
    const names = await searchCache(search, this.asked, text, () =>
      searchFetch(search, AB_API_BASE+"/data/vernacularnames/?vernacularName="+encodeURIComponent(text)+"&output=nakedJSON"));
    if (!Array.isArray(names)) {
      return([]);
    }
    const found = [];
    for (const name of names.slice(0, this.maxNames)) {
      const taxon = await this.taxonOf(search, name);
      if (taxon == null || typeof taxon["taxon"] != "string") {
        continue;
      }
      found.push({
        type: "vernacular",
        value: name["vernacularName"],
        language: name["language"],
        taxon: taxon["taxon"],
        text: text
      });
      //The taxon itself, which Linnaeus then gives a rank and the other plugins work from
      found.push({type: "taxon", value: taxon["taxon"]});
    }
    return(found);
  },

  taxonOf(search, name) {
    const held = name["source"]+"/"+name["id"];
    return(searchCache(search, this.taxa, held, () => this.follow(search, name)));
  },

  async follow(search, name) {
    const links = await searchFetch(search, AB_API_BASE+"/data/links/?subject_type=vernacularnames"
      +"&subject_source="+encodeURIComponent(name["source"])
      +"&subject_id="+encodeURIComponent(name["id"])
      +"&object_type=taxa"
      +"&predicate="+encodeURIComponent(this.denotes)
      +"&output=nakedJSON");
    if (!Array.isArray(links) || links.length == 0) {
      return(null);
    }
    const taxa = await searchFetch(search, AB_API_BASE+"/data/taxa/?id="+encodeURIComponent(links[0]["object_id"])
      +"&source="+encodeURIComponent(links[0]["object_source"])
      +"&output=nakedJSON");
    return((Array.isArray(taxa) && taxa.length > 0) ? taxa[0] : null);
  },

  render(search, boxes) {
    const box = boxes.info;
    const names = search.of("vernacular");
    if (box == null || names.length == 0) {
      return;
    }
    const heading = document.createElement("h2");
    heading.textContent = "Known as";
    box.appendChild(heading);
    names.forEach(name => {
      //Built from elements rather than markup, as the name is written by its source
      const line = document.createElement("p");
      const spoken = "“"+name.value+"”"+((name.language == null || name.language == "") ? "" : " ("+name.language+")");
      line.appendChild(document.createTextNode(spoken+" is a name for "));
      const link = document.createElement("a");
      link.href = "audioblast.php?search="+encodeURIComponent(name.taxon);
      const italic = document.createElement("i");
      italic.textContent = name.taxon;
      link.appendChild(italic);
      line.appendChild(link);
      line.appendChild(document.createTextNode("."));
      box.appendChild(line);
    });
  },

  searchSuggest() {
    return([
      "Vineyard Mole-cricket"
    ]);
  }
}
