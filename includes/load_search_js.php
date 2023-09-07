<?php
  //Load Javascript for search plugins
  $plugins = array();
  $files = glob("{search_plugins/*.js}",GLOB_BRACE);
  for($i = 0; $i < count($files); $i++){
    echo '  <script type="text/javascript" src="/';
    echo $files[$i];
    $filename_parts = explode("/", str_replace(".js", "",$files[$i]));
    $plugins[] = $filename_parts[1];
    echo '"/></script>'."\n";
  }
?>
<script type="text/javascript" src="/ab-search.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function(event) {
    //Configure searchAB to match page DOM
    searchAB.setConsoleContainerId("consoleContainer");
    searchAB.setInfoContainerId("infoContainer");
    searchAB.setContentContainerId("contentContainer");
    <?php
    //Add plugins to searchAB
    foreach ($plugins as $plugin) {
      echo "searchAB.addPlugin($plugin);\n";
    }
    ?>
  });
</script>
 
