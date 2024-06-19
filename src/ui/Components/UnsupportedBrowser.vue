<script setup lang="ts">
import * as bowser from "bowser";
import {ref} from "vue";

const localStorageRecord = localStorage.getItem("hideUnsupported") === "true";
const browserCheck = bowser.check({
  chrome: "55",
  firefox: "52",
  safari: "10.1",
  opera: "50"
}, true);

let isHidden = ref(localStorageRecord || browserCheck);

const hideUnsupported = () => {
  localStorage.setItem("hideUnsupported", "true");
  isHidden.value = true;
};
</script>

<template>
  <div v-if="!isHidden" id="unsupportedBrowser">
    Your browser is not supported. Features may or may not working. <a href="http://outdatedbrowser.com/"
                                                                       target="_blank">Please use the latest Chrome
    or Firefox.</a>
    <i @click="hideUnsupported" class="closeBtn glyphicon glyphicon-remove"></i>
  </div>
</template>

<style scoped>

</style>