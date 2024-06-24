<script setup lang="ts">
const languages = [
  {kslang: "cpp_stl", acelang: "c_cpp", isDebug: false, text: "CPP-STL"},
  {kslang: "csharp", acelang: "csharp", isDebug: false, text: "C#"},
  {kslang: "go", acelang: "golang", isDebug: false, text: "Go"},
  {kslang: "graphviz", acelang: "dot", isDebug: false, text: "Graphviz"},
  {kslang: "java", acelang: "java", isDebug: false, text: "Java"},
  {kslang: "java", acelang: "java", isDebug: true, text: "Java (debug)"},
  {kslang: "javascript", acelang: "javascript", isDebug: false, text: "JavaScript"},
  {kslang: "javascript", acelang: "javascript", isDebug: true, text: "JavaScript (debug)"},
  {kslang: "lua", acelang: "lua", isDebug: false, text: "Lua"},
  {kslang: "nim", acelang: "nim", isDebug: false, text: "Nim"},
  {kslang: "perl", acelang: "perl", isDebug: false, text: "Perl"},
  {kslang: "php", acelang: "php", isDebug: false, text: "PHP"},
  {kslang: "python", acelang: "python", isDebug: false, text: "Python"},
  {kslang: "ruby", acelang: "ruby", isDebug: false, text: "Ruby"},
  {kslang: "ruby", acelang: "ruby", isDebug: true, text: "Ruby (debug)"},
  {kslang: "json", acelang: "json", isDebug: false, text: "JSON"},
];
</script>

<template>
  <ul class="dropdown-menu">
    <li v-for="lang in languages" :key="lang.text">
      <a tabindex="-1"
         href="#"
         :data-kslang="lang.kslang"
         :data-ksdebug="lang.isDebug"
         :data-acelang="lang.acelang">
        {{ lang.text }}
      </a>
    </li>
  </ul>
</template>

<style scoped>

</style>