<script setup lang="ts">
import {useInitializeIDEStore} from "./Store/InitializeIDEStore";
import {computed, onMounted} from "vue";
import {KaitaiFileSystem} from "../FileTree/FileSystems/KaitaiFileSystem";
import {initLocalStorages} from "../FileTree/FileSystems/LocalStorageFileSystemsInit";
import {useFileSystems} from "../FileTree/Store/FileSystemsStore";
import {UpdateUserLocalData} from "./Updates/UpdateUserLocalData";
import {SleepFor} from "../../Utils/SleepFor";

const initializeStore = useInitializeIDEStore();
const fileSystemsStore = useFileSystems();
const message = computed(() => {
  return initializeStore.message;
});
const init = async () => {
  await UpdateUserLocalData();
  const storages = [new KaitaiFileSystem(), ...await initLocalStorages()];
  storages.forEach(fileSystemsStore.addFileSystem);
};

const wrapFunctionWithMinimumExecutionTime = async (fn: () => Promise<void>, shouldRunForMinimumMs: number) => {
  const startTime = performance.now();
  await fn();
  const endTime = performance.now();
  const elapsed = endTime - startTime;
  if (elapsed < shouldRunForMinimumMs) {
    await SleepFor(shouldRunForMinimumMs - elapsed);
  }
};

const calculateInitMinimumTimeShowed = () => {
  if (process.env.INIT_TIMEOUT === "0") return 0;
  return typeof process.env.INIT_TIMEOUT !== "undefined"
      ? parseInt(process.env.INIT_TIMEOUT) || 1000
      : 1000;
};

onMounted(async () => {
  const shouldRunForMinimumMs = calculateInitMinimumTimeShowed();
  await wrapFunctionWithMinimumExecutionTime(init, shouldRunForMinimumMs);
  initializeStore.initialize();
});

</script>

<template>
  <div class="container">
    <div class="container-inner">
      <h1>{{ message }}</h1>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" class="icon">
        <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="1"
            repeatCount="indefinite"/>

        <path
            d="m 16.977523,0.24095147 c -9.2629169,0 -16.73280045,7.51449143 -16.73280045,16.77740253 0,9.262912 7.46988355,16.777403 16.73280045,16.777403 9.262917,0 16.777413,-7.514491 16.777413,-16.777403 0,-9.2629111 -7.514496,-16.77740253 -16.777413,-16.77740253 z m 0,4.14972823 c 6.966927,0 12.627682,5.6607523 12.627682,12.6276743 0,6.966923 -5.660755,12.583053 -12.627682,12.583053 -6.966937,0 -12.5830596,-5.61613 -12.5830596,-12.583053 0,-6.966922 5.6161226,-12.6276743 12.5830596,-12.6276743 z"
            style="color:#666;fill:#666;fill-opacity:0.5;stroke:#565656;stroke-width:0.5;stroke-opacity:0.19607843"/>
        <path d="M 31.677259,17.003529 A 14.680208,14.680199 0 0 1 20.796571,31.183505"
              style="fill:none;stroke:#3366bb;stroke-width:4;stroke-linecap:round"/>
      </svg>


    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #222;
  color: #eeeeee;
  font-family: "JetBrains Mono", monospace;
  font-size: 24px;
}


.container-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
}

.icon {
  color: #eee;
  width: 128px;
}
</style>