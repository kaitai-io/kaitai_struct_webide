<script setup lang="ts">
import bowser from "bowser";
import {ref} from "vue";
import TextLink from "./UtilComponents/TextLink.vue";

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
    <span>Your browser is not supported. Features may or may not working.</span>
    <TextLink link="http://outdatedbrowser.com/" text="Please use the latest Chrome or Firefox."/>
    <i @click="hideUnsupported"/>
  </div>
</template>

<style scoped>

</style>