<div class="home-search">
  <label for="search" id="search-label">Search</label>
  <input id="search"
         placeholder="Search..."
         autocomplete="off"
         onkeydown="if (event.keyCode == 13) { searchAudioBlast(); }">
  <div id="zoom-control" class="search-control">
    <ul class="ulhoriz">
      <li>
        <a onclick="searchAudioBlast()">
          <img class="audioblast-button"
               src="https://cdn.audioblast.org/audioblast_flash_white.png"
               alt="audioBlast! Search"/>
        </a>
      </li>
    </ul>
  </div>
  <details id="search-suggests">
    <summary>Search suggestions</summary>
    <div id="search-suggests-details"></div>
  </details>

  <script>
    searchAB.searchSuggest("search-suggests-details");
    function searchAudioBlast() {
      const term = document.getElementById("search").value;
      window.open("audioblast.php/?search="+term, "_self");
    }
  </script>
</div>


<div class="feature-container">
  <div class="feature">
    <h3><a href="/?page=recordings" id="recordings"></a></h3>
    <p>Recordings underpin bioacoustic research, from species to soundscapes.</p>
  </div>
  <div class="feature">
    <h3><a href="/?page=annomate" id="annomate"></a></h3>
    <p>Made by humans and algorithms, using some of our <b><span id="analysiscount"></span></b> analyses.</p>
  </div>
  <div class="feature">
    <h3><a href="/?page=traits" id="traits"></a></h3>
    <p>From the literature, and calculated.</p>
  </div>
</div>

<script>
  fetch("https://api.audioblast.org/standalone/data/fetch_data_counts/?output=nakedJSON")
    .then(response => response.json())
    .then( data => {
      document.getElementById("recordings").innerHTML = parseInt(data.counts.recordings).toLocaleString() + " recordings <span id='hours'></span>";
      document.getElementById("annomate").innerHTML = parseInt(data.counts.annomate).toLocaleString() + " annotations";
      document.getElementById("traits").innerHTML = parseInt(data.counts.traits).toLocaleString() + " traits";
      fetch("https://api.audioblast.org/standalone/data/list_hours/?output=nakedJSON")
        .then(response => response.json())
        .then(data => {
          document.getElementById("hours").innerHTML = "("+parseInt(data.hours).toLocaleString() + " hours: "
            +parseFloat(data.hours/(24*365.25)).toLocaleString()+ " years)";
        });
    });

  fetch("https://api.audioblast.org/standalone/analysis/fetch_analysis_counts/?output=nakedJSON")
    .then(response => response.json())
    .then(data => {
      document.getElementById("analysiscount").innerHTML = parseInt(data.total).toLocaleString();
    });
</script>

<div class="feature-container">
  <div class="feature">
    <h2>Other ways to access</h2>
  </div>
  <div class="feature">
    <img src="https://cdn.audioblast.org/python-logo-master-v3-TM.png"
         class="feature-image"
         alt="Python programming language logo"/>
    <h3><a href="https://github.com/audioblast/abPython">abPython</a></h3>
      Python wrapper for audioBlast API
  </div>
  <div class="feature">
    <img src="https://cdn.audioblast.org/Rlogo.png"
         class="feature-image"
         alt="R enivronment for statistical computing logo"/>
      <h3><a href="https://cran.r-project.org/package=sonicscrewdriver">SonicScrewdriveR</a></h3>
        Access audioBlast via the R environment<br/><br/>
      <h3><a href="https://cran.r-project.org/package=warbleR">warbleR</a></h3>
        Access to ann-o-mate
  </div>
</div>

<div class="feature-container">
  <div class="feature">
    <h2>Credits</h2>
  </div>
  <div class="feature">
    <p>This project was conceived and developed by <a href="https://ebaker.me.uk">Ed Baker</a> as part of the Leverhulme Trust funded <i>Automated Acoustic Observatories</i> project at the University of York.</p>
    <p>It is currently hosted by the Natural History Museum, London and developed (in part) as part of the <i>Urban Nature Project</i>.</p>
  </div>
</div>
