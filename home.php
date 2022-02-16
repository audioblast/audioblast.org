<p>Welcome to audioblast!.</p>
<p>Audioblast is a projct to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
<p>This website uses the <a href="https://api.audioblast.org">audioBLAST API</a> which you can use to create your own projects.</p>

<h2>You can browse...</h2>
<h3><a href="/?page=recordings" id="recordings"></a></h3>
<h3><a href="/?page=annomate" id="annomate"></a></h3>
<h3><a href="/?page=traits" id="traits"></a></h3>
<h3><a href="/?page=recordingstaxa" id="taxa"></a></h3>
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
      document.getElementById("taxa").innerHTML = parseInt(data.counts["recordings-taxa"]).toLocaleString() + " taxa";
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
</script>

<h2>Credits</h2>
<p>This project was conceived and developed as part of the Leverhulme Trust funded <i>Automated Acoustic Observatories</i> project at the University of York.</p>
<p>It is currently hosted by the Natural History Museum, London and developed (in part) as part of the <i>Urban Nature Project</i>.</p>
