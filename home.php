<p>Welcome to audioblast!.</p>
<p>Audioblast is a projct to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
<p>This website is using the <a href="https://api.audioblast.org">audioBLAST API</a> which you can use to create your own projects.</p>

<?php
$counts = file_get_contents("https://api.audioblast.org/standalone/data/fetch_data_counts/?output=nakedJSON");
$counts = json_decode($counts);

$hours = file_get_contents("https://api.audioblast.org/standalone/data/list_hours/?output=nakedJSON");
$hours = json_decode($hours);
?>

<h2>You can browse...</h2>
<h3><a href="/?page=recordings"><?php print(number_format($counts->counts->recordings)." recordings (".number_format($hours->hours)." hours)");?></a></h3>
<h3><a href="/?page=annomate"><?php print(number_format($counts->counts->annomate)." annotations");?></a></h3>
<h3><a href="/?page=traits"><?php print(number_format($counts->counts->traits)." acoustic traits");?></a></h3>
<h3><a href="/?page=recordingstaxa"><?php print(number_format($counts->counts->{'recordings-taxa'})." taxa");?></a></h3>

<h2>Credits</h2>
<p>This project was conceived and developed as part of the Leverhulme Trust funded <i>Automated Acoustic Observatories</i> project at the University of York.</p>
<p>It is currently hosted by the Natural History Museum, London and developed (in part) as part of the <i>Urban Nature Project</i>.</p>
