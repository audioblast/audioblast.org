/*
Rosetta search plugin for searchAB

The Rosetta plugin reads any emoji in the query as the taxon it stands for, using Phymoji.

The plugin is named after the Rosetta Stone, which was used to decipher Egyptian hieroglyphics.
*/
const rosetta = {
  name: "Rosetta",
  asked: new Map(),

  async recognise(search) {
    const found = [];
    const parts = search.remaining().split(/\s+/).filter(part => part != "");
    for (const part of parts) {
      //Only what is actually pictorial is asked about, so ordinary words are never sent
      if (!/\p{Extended_Pictographic}/u.test(part)) {
        continue;
      }
      //An emoji Phymoji knows gives a name; one it doesn't gives an empty list
      const taxon = await searchCache(search, this.asked, part, () =>
        searchFetch(search, AB_API_BASE+"/standalone/phymoji/get_taxon/?emoji="+encodeURIComponent(part)+"&output=nakedJSON"));
      if (typeof taxon == "string" && taxon.trim() != "") {
        found.push({type: "taxon", value: taxon, text: part});
      }
    }
    return(found);
  },

  searchSuggest() {
    return([
      "🦗 ",
      "🐜 "
    ]);
  }
}
