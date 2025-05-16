<script setup lang="ts">
import Bowser from "bowser";
import {ref} from "vue";
import TextLink from "./UtilComponents/TextLink.vue";
import {XMarkIcon} from "@heroicons/vue/16/solid";


const localStorageRecord = localStorage.getItem("hideUnsupported") === "true";
const browserCheck = Bowser.getParser(window.navigator.userAgent)
    .satisfies({
      chrome: ">55",
      firefox: ">52",
      safari: ">10.1",
      opera: ">50"
    });

let isHidden = ref(localStorageRecord || browserCheck);

const hideUnsupported = () => {
  localStorage.setItem("hideUnsupported", "true");
  isHidden.value = true;
};

</script>

<template>
  <div v-if="!isHidden" class="unsupportedBrowser">
    <div class="container">
      <div/>
      <div>
        <span>Your browser is not supported. Features may or may not be working. </span>
        <TextLink link="http://outdatedbrowser.com/" text="Please use the latest Chrome or Firefox." class="link"/>
      </div>
      <XMarkIcon class="btn" @click="hideUnsupported"/>
    </div>
  </div>
</template>

<style scoped>
.unsupportedBrowser {
  background: #ffee00;
  z-index: 10000;
  position: fixed;
  left: 0;
  right: 0;
  padding: 10px;
}

.container {
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  align-items: center;
}

.link {
  color: black;
  text-decoration: underline
}


.btn {
  float: right;
  margin-top: 1px;
  cursor: pointer;
  height: 24px;
  justify-self: end;
}
</style>