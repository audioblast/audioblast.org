<div class="home-search">
  <input id="search" placeholder="Search..." autocomplete="off">
  <div id="zoom-control" class="search-control">
    <ul class="ulhoriz">
      <li>
        <a onclick="searchAudioBlast()">
          <img class="audioblast-button" src="https://cdn.audioblast.org/audioblast_flash_white.png" title="alphaBLAST! Search"/></a>
      </li>
    </ul>
  </div>

  <script>
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
  var request = new XMLHttpRequest();
  request.open("GET", "https://api.audioblast.org/standalone/data/fetch_data_counts/?output=nakedJSON");
  request.onreadystatechange = function() {
    if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      var data = JSON.parse(request.responseText);
      document.getElementById("recordings").innerHTML = parseInt(data.counts.recordings).toLocaleString() + " recordings <span id='hours'></span>";
      document.getElementById("annomate").innerHTML = parseInt(data.counts.annomate).toLocaleString() + " annotations";
      document.getElementById("traits").innerHTML = parseInt(data.counts.traits).toLocaleString() + " traits";
      var requesth = new XMLHttpRequest();
      requesth.open("GET", "https://api.audioblast.org/standalone/data/list_hours/?output=nakedJSON");
      requesth.onreadystatechange = function() {
        if(requesth.readyState === XMLHttpRequest.DONE && requesth.status === 200) {
          var data = JSON.parse(requesth.responseText);
          document.getElementById("hours").innerHTML = "("+parseInt(data.hours).toLocaleString() + " hours: "
            +parseFloat(data.hours/(24*365.25)).toLocaleString()+ " years)";
        }
      }
      requesth.send();
    }
  }
  request.send();

  var request2 = new XMLHttpRequest();
  request2.open("GET", "https://api.audioblast.org/standalone/analysis/fetch_analysis_counts/?output=nakedJSON");
  request2.onreadystatechange = function() {
    if(request2.readyState === XMLHttpRequest.DONE && request2.status === 200) {
      var data = JSON.parse(request2.responseText);
      document.getElementById("analysiscount").innerHTML = parseInt(data.total).toLocaleString();
    }
  }
  request2.send();

</script>

<h2>Other ways to acess</h2>
<table>
  <tr>
    <td><img src="https://cdn.audioblast.org/python-logo-master-v3-TM.png" width="200px" /></td>
    <td><b><a href="https://github.com/audioblast/abPython">abPython</a></b><br>Python wrapper for audioBlast API</td>
  </tr>
  <tr>
    <td><img src = "https://cdn.audioblast.org/Rlogo.png" width="200px" /></td>
    <td>
      <b><a href="https://cran.r-project.org/package=sonicscrewdriver">SonicScrewdriveR</a></b><br>Access audioBlast via the R environment<br/><br/>
      <b><a href="https://cran.r-project.org/package=warbleR">warbleR</a></b><br>Access to ann-o-mate
    </td>
  </tr>
</table>

<h2>Credits</h2>
<p>This project was conceived and developed as part of the Leverhulme Trust funded <i>Automated Acoustic Observatories</i> project at the University of York.</p>
<p>It is currently hosted by the Natural History Museum, London and developed (in part) as part of the <i>Urban Nature Project</i>.</p>
