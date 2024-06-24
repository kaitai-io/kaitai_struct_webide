<script setup lang="ts">

import FileTreeLanguagesDropdown from "./FileTreeGenerateParserDropdown.vue";
</script>

<template>
  <div id="fileTreeCont">
    <div id="fileTree" class="fileTree">

    </div>
    <div class="footer btn-group" role="group">
      <button id="createLocalKsyFile" type="button" class="btn btn-default"><i
          class="glyphicon glyphicon-file"></i></button>
      <button id="uploadFile" type="button" class="btn btn-default"><i
          class="glyphicon glyphicon-cloud-upload"></i></button>
      <button id="downloadFile" type="button" class="btn btn-default disabled"><i
          class="glyphicon glyphicon-cloud-download"></i></button>
    </div>
  </div>

  <div id="fileTreeContextMenu" class="dropdown clearfix">
    <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"
        style="display:block;position:static;margin-bottom:5px;">
      <li class="openItem"><a tabindex="-1" href="#"><i class="glyphicon glyphicon-pencil"></i> Open</a></li>
      <li class="createFolder"><a tabindex="-1" href="#"><i class="glyphicon glyphicon-folder-open"></i> Create
        folder</a></li>
      <li class="createKsyFile"><a tabindex="-1" href="#"><i class="glyphicon glyphicon-list-alt"></i> Create .ksy
        file</a></li>
      <li class="cloneKsyFile"><a tabindex="-1" href="#"><i class="glyphicon fa fa-clone"></i> Clone</a></li>
      <li class="generateParser dropdown-submenu">
        <a tabindex="-1" href="#"><i class="glyphicon glyphicon-flash"></i> Generate parser</a>
        <FileTreeLanguagesDropdown/>
      </li>
      <li class="downloadItem"><a tabindex="-1" href="#"><i class="glyphicon glyphicon-cloud-download"></i>
        Download</a></li>
      <li class="deleteItem"><a tabindex="-1" href="#"><i class="glyphicon glyphicon-remove"></i> Delete</a></li>
    </ul>
  </div>
</template>

<style scoped>

</style>