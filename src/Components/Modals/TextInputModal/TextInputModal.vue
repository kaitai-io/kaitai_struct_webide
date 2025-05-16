<script setup lang="ts">


import {useTextModalInputStore} from "./TextInputModalStore";
import {computed} from "vue";

const store = useTextModalInputStore();

const inputValue = computed({
  get() {
    return store.inputValue;
  },
  set(val) {
    store.inputValue = val;
  }
});


const onClose = (e: Event) => {
  e.stopPropagation();
  store.close();
  store.onClose && store.onClose();
};

const onSubmit = (e: Event) => {
  e.stopPropagation();
  store.close();
  store.onAccept(inputValue.value);
};

</script>

<template>
  <div class="backdrop-welcome" tabindex="-1" v-if="store.isOpen" @click="onClose">
    <div class="modal-wrapper-background" @click.stop>
      <div class="title">{{ store.title }}</div>
      <input class="input" type="text" v-model="inputValue" autofocus/>
      <div class="buttons">
        <button class="modal-button submit" @click="onSubmit">OK</button>
        <button class="modal-button" @click="onClose">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-welcome {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: center;
}

@keyframes slideInFromTop {
  0% {
    transform: translateY(-60%);
  }
  100% {
    transform: translateY(-50%);
  }
}

.modal-wrapper-background {
  width: 600px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  background-color: #333;
  border-radius: 6px;
  gap: 10px;

  transform: translateY(-50%);
  animation: 100ms ease-out 0s 1 slideInFromTop;
}

.modal-button {
  color: #57A6A1;
  border-radius: 4px;
  border: none;
  background-color: #222222;
  padding: 8px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 1px solid #666;
}

.input {
  outline: none;
  padding: 2px;
  border-radius: 4px;
}

.submit {
  background-color: #2c5552
}

.modal-button:hover {
  color: #57A6A1;
  background-color: #344C64;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: end;
  padding-top: 5px;
  border-top: 1px solid #666;
}

</style>