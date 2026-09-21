/*
Fabre search plugin for searchAB

The Fabre plugin shows what the sources say in prose about the taxon the query named: how it
behaves, where and when it calls, what it looks like, how it is told from its neighbours. The
descriptions are gathered under what each one is of, so a taxon's behaviour is read in one place
however many sources wrote about it.

A description says what it is about through the links table rather than through a column of its
own, so nothing rolls up: asking about a genus gives what was written of the genus itself and not
what was written of each of its species.

The plugin is named after Jean-Henri Fabre, whose Souvenirs entomologiques described at length what
insects do rather than only what they are, and who fired a cannon past a tree of cicadas to find
out whether they could hear it.
*/
const fabre = {
  name: "Fabre",
  //A search that named a trait is answered by the traits box, not by a list of descriptions
  suppressedBy: ["trait", "traitValue", "namedTraitValue"],
  //At most this many descriptions are shown, as a well studied taxon has a great many
  maxRows: 20,
  asked: new Map(),

  //The Species Profile Model info items, in the order they are shown. What a taxon does comes
  //before what it looks like, as audioBlast is asked about sound.
  topics: [
    "Behaviour",
    "Biology",
    "Habitat",
    "Distribution",
    "GeneralDescription",
    "Description",
    "DiagnosticDescription",
    "Morphology",
    "Conservation",
    "Key"
  ],

  boxes() {
    return({content: "fabre"});
  },

  async render(search, boxes) {
    const box = boxes.content;
    const taxon = mostSpecificTaxon(search);
    if (box == null || taxon == null) {
      return;
    }
    const descriptions = await aboutTaxon(search, this, "descriptions", taxon);
    if (descriptions.length == 0) {
      return;
    }
    box.appendChild(taxonHeading("Descriptions of", taxon));
    //Built from elements rather than markup, as the prose is written by its source
    this.byTopic(descriptions).forEach(group => {
      const topic = document.createElement("h3");
      topic.textContent = group.label;
      box.appendChild(topic);
      group.descriptions.forEach(description => {
        const prose = document.createElement("p");
        prose.textContent = description["value"];
        box.appendChild(prose);
        const said = this.attribution(description);
        if (said != null) {
          box.appendChild(said);
        }
      });
    });
  },

  /**
   * The descriptions gathered under what each one is of
   * @param  {Array} descriptions the descriptions
   * @return {Array} the groups, in the order they are shown, each with its label
   */
  byTopic(descriptions) {
    const held = new Map();
    descriptions.forEach(description => {
      const topic = this.topicOf(description);
      if (!held.has(topic.label)) {
        held.set(topic.label, {label: topic.label, at: topic.at, descriptions: []});
      }
      held.get(topic.label).descriptions.push(description);
    });
    return(Array.from(held.values()).sort((a, b) => a.at - b.at));
  },

  /**
   * What a description is of: the Species Profile Model info item its topic names, and the
   * source's own word for the topic where it names none. An item the model gives no place in the
   * order, and a topic that is only its source's word, are shown after the items that have one.
   * @param  {Object} description the description
   * @return {Object} the label to show it under, and where that comes in the order
   */
  topicOf(description) {
    const item = String(description["topic_link"] || "").split("#")[1] || "";
    if (item != "") {
      const at = this.topics.indexOf(item);
      return({label: termWords(item), at: (at < 0) ? this.topics.length : at});
    }
    const topic = String(description["topic"] || "").trim();
    const label = (topic == "") ? "Other" : topic.charAt(0).toUpperCase()+topic.slice(1);
    return({label: label, at: this.topics.length});
  },

  //Where the description can be read at its source, which is also who said it
  attribution(description) {
    const url = description["info_url"];
    if (typeof url != "string" || !/^https?:\/\//i.test(url)) {
      return(null);
    }
    const line = document.createElement("p");
    line.className = "search-attribution";
    const link = document.createElement("a");
    link.href = url;
    link.textContent = description["source"];
    line.appendChild(link);
    return(line);
  },

  searchSuggest() {
    return([
      "Platycleis albopunctata"
    ]);
  }
}
