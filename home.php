<p>Welcome to audioblast!.</p>
<p>Audioblast is a project to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
<p>This website uses the <a href="https://api.audioblast.org">audioBLAST API</a> which you can use to create your own projects.</p>

<h2>You can browse...</h2>
<h3><a href="/?page=recordings" id="recordings"></a></h3>
<p>Recordings underpin bioacoustic research, from species to soundscapes.</p>
<h3><a href="/?page=annomate" id="annomate"></a></h3>
<p>Made by humans and algorithms, using some of our <b><span id="analysiscount"></span></b> analyses.</p>
<h3><a href="/?page=traits" id="traits"></a></h3>
<p>From the literature, and calculated.</p>
<p></p>
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

<h2>Credits</h2>
<p>This project was conceived and developed as part of the Leverhulme Trust funded <i>Automated Acoustic Observatories</i> project at the University of York.</p>
<p>It is currently hosted by the Natural History Museum, London and developed (in part) as part of the <i>Urban Nature Project</i>.</p>
