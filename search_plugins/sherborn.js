/*
Sherborn search plugin for searchAB

The Sherborn plugin shows the literature on the taxon the query named: every reference audioBlast
holds that treats it, and what each one holds for it — a description of its song, an oscillogram, a
photograph of its stridulatory file, a taxonomic treatment.

A reference says what it is about through the links table rather than through a column of its own,
and the qualifier of that link is what says which of those things the reference holds. Nothing
rolls up: asking about a genus gives the references on the genus itself and not those on each of
its species.

The plugin is named after Charles Davies Sherborn, whose Index Animalium recorded, at the British
Museum (Natural History), which publication had treated which animal name.
*/
const sherborn = {
  name: "Sherborn",
  //A search that named a trait is answered by the traits box, not by a list of references
  suppressedBy: ["trait", "traitValue", "namedTraitValue"],
  //At most this many references are shown, as a well studied taxon has a great many
  maxRows: 50,
  asked: new Map(),

  boxes() {
    return({content: "sherborn"});
  },

  async render(search, boxes) {
    const box = boxes.content;
    const taxon = mostSpecificTaxon(search);
    if (box == null || taxon == null) {
      return;
    }
    const references = await aboutTaxon(search, this, "references", taxon);
    if (references.length == 0) {
      return;
    }
    box.appendChild(taxonHeading("References for", taxon));
    //A bibliography is looked through by its authors, so it is ordered by them and then by year
    references.slice()
      .sort((a, b) => this.orderedBy(a).localeCompare(this.orderedBy(b))
        || this.text(a["year"]).localeCompare(this.text(b["year"])))
      .forEach(reference => box.appendChild(this.citation(reference)));
  },

  /**
   * A reference as a citation, its title linking to wherever it can be read, followed by what the
   * links say it holds for this taxon
   * @param  {Object} reference the reference, with the qualifiers of the links that led to it
   * @return {Node} the citation
   */
  citation(reference) {
    //Built from elements rather than markup, as every part of it is written by its source
    const line = document.createElement("p");
    line.className = "search-citation";
    const who = this.who(reference);
    if (who != "") {
      line.appendChild(document.createTextNode(who+" "));
    }
    const year = this.text(reference["year"]);
    if (year != "") {
      line.appendChild(document.createTextNode("("+year+") "));
    }
    line.appendChild(this.title(reference));
    const where = this.where(reference);
    if (where != "") {
      line.appendChild(document.createTextNode(" "+where));
    }
    const pdf = this.text(reference["attachments"]);
    if (/^https?:\/\//i.test(pdf)) {
      const link = document.createElement("a");
      link.href = pdf;
      link.textContent = "PDF";
      line.append(document.createTextNode(" "), link);
    }
    const note = this.note(reference);
    if (note != null) {
      line.appendChild(note);
    }
    return(line);
  },

  /**
   * What the links say the reference holds for this taxon, and where the reference is held. The
   * source page is given whatever the title already links to, so there is a way to the reference
   * even from a row whose source wrote its DOI or its address wrongly, as some have.
   * @param  {Object} reference the reference, with the qualifiers of the links that led to it
   * @return {Node} the line, or null if there is nothing to say on it
   */
  note(reference) {
    const note = document.createElement("span");
    note.className = "search-holds";
    const holds = reference.qualifiers.map(qualifier => termWords(qualifier));
    if (holds.length > 0) {
      note.appendChild(document.createTextNode(holds.join(", ")));
    }
    const url = this.text(reference["info_url"]);
    if (/^https?:\/\//i.test(url)) {
      if (note.hasChildNodes()) {
        note.appendChild(document.createTextNode(" · "));
      }
      const link = document.createElement("a");
      link.href = url;
      link.textContent = this.text(reference["source"]);
      note.appendChild(link);
    }
    return(note.hasChildNodes() ? note : null);
  },

  //What the bibliography is ordered by: its authors, or its title where a source gave none
  orderedBy(reference) {
    const who = this.who(reference);
    return((who == "") ? this.text(reference["title"]) : who);
  },

  //Who the reference is by: its authors, or its editors where it has no authors of its own
  who(reference) {
    const authors = this.text(reference["author"]);
    if (authors != "") {
      return(authors);
    }
    const editors = this.text(reference["editor"]);
    return((editors == "") ? "" : editors+" (ed.)");
  },

  /**
   * The title, linking to wherever the reference can be read: by its DOI first, then by whatever
   * address it carries, then the page its source holds for it
   * @param  {Object} reference the reference
   * @return {Node} the title, as a link where there is one to make
   */
  title(reference) {
    const title = this.text(reference["title"]);
    const doi = this.text(reference["doi"]);
    const url = [
      (doi == "" || /^https?:\/\//i.test(doi)) ? doi : "https://doi.org/"+doi,
      this.text(reference["url"]),
      this.text(reference["info_url"])
    ].find(one => /^https?:\/\//i.test(one));
    const shown = (title == "") ? "Untitled" : title;
    //A source may have written the title with a full stop of its own already on the end
    const stop = /[.!?]$/.test(shown) ? "" : ".";
    if (url == null) {
      return(document.createTextNode(shown+stop));
    }
    const link = document.createElement("a");
    link.href = url;
    link.textContent = shown;
    const held = document.createDocumentFragment();
    held.append(link, document.createTextNode(stop));
    return(held);
  },

  /**
   * Where the reference appeared, in whichever of the ways its kind of reference is published: a
   * paper has a journal, a chapter the book it is in, a thesis a school, a report an institution
   * @param  {Object} reference the reference
   * @return {String} where it appeared, or an empty string if it does not say
   */
  where(reference) {
    const book = this.text(reference["booktitle"]);
    const published = [
      this.text(reference["journal"]),
      (book == "") ? "" : "In: "+book,
      this.text(reference["howpublished"]),
      this.text(reference["school"]),
      this.text(reference["institution"]),
      this.text(reference["publisher"])
    ].find(one => one != "");
    const parts = (published == null) ? [] : [published];
    const volume = this.text(reference["volume"]);
    const number = this.text(reference["number"]);
    if (volume != "") {
      parts.push((number == "") ? volume : volume+"("+number+")");
    }
    const where = parts.join(" ");
    const pages = this.text(reference["pages"]);
    if (pages == "") {
      return((where == "") ? "" : where+".");
    }
    return(((where == "") ? "" : where+": ")+pages+".");
  },

  //A field as text, as a source may leave any of them empty
  text(value) {
    return((value == null) ? "" : String(value).trim());
  }
}
