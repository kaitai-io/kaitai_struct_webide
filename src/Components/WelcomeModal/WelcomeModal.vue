<script setup lang="ts">

import KaitaiStructCompiler from "kaitai-struct-compiler";
import {useWelcomeModalStore} from "./WelcomeModalStore";
import {KaitaiIdeInfo} from "../../app";

const store = useWelcomeModalStore();

const onClickBackdrop = (e) => {
  e.stopPropagation();
  store.close();
};

</script>

<template>
  <div class="backdrop-welcome" tabindex="-1" v-if="store.shouldShowModal" @click="onClickBackdrop">
    <div class="modal-wrapper-background" @click="e => e.stopPropagation()">
      <div class="disclaimer">
        Disclaimer! This is the fork project rewritten in Vue3. For the official project go to this link:
        <a href="https://ide.kaitai.io" target="_blank">https://ide.kaitai.io</a> Below is the original welcome message, with updated links to licenses.
      </div>

      <div class="title">Hey there!</div>
      <div>
        If this is the first time you are using Kaitai WebIDE then I recommend scrolling through our
        <a href="https://github.com/kaitai-io/kaitai_struct_webide/wiki/Features" target="_blank">Features
          page</a>.
      </div>
      <div>
        You can read more about Kaitai Struct on our website (<a href="http://kaitai.io"
                                                                 target="_blank">kaitai.io</a>) and
        learn the basics of using it by reading <a href="http://doc.kaitai.io" target="_blank">our
        documentation</a>.
      </div>
      <div>
        We would be pleased if you could visit us and share your thoughts about Kaitai Struct or WebIDE
        in our
        <a href="https://gitter.im/kaitai_struct/Lobby" target="_blank">Gitter chatroom</a>.
      </div>
      <div>
        You can view the source code or create issues on Github
        for the <a href="https://github.com/kaitai-io/kaitai_struct_webide" target="_blank">WebIDE</a>
        or
        <a href="https://github.com/kaitai-io/kaitai_struct" target="_blank">Kaitai Struct</a>.
      </div>
      <div>
        Kaitai WebIDE was made possible by using
        <a href="https://github.com/lorthiz/kaitai_struct_webide/blob/master/public/docs/wiki/3rd-party-libraries.md"
           target="_blank">open-source libraries listed here</a>
        (<a href="LICENSE-3RD-PARTY.txt" target="_blank">licensing information</a>).
      </div>
      <div>
        Also, follow us on Twitter!
        <ul>
          <li>
            <a href="https://twitter.com/koczkatamas" target="_blank">@koczkatamas</a>
            (WebIDE author)
          </li>
          <li>
            <a href="https://twitter.com/kaitai_io" target="_blank">@kaitai_io</a>
            (Kaitai Project)
          </li>
        </ul>
      </div>
      <div class="licenses">
        <div>
          <span>Kaitai WebIDE version: </span>
          <span id="webIdeVersion">{{ KaitaiIdeInfo.version }}-SNAPSHOT</span>
          <a id="webideCommitId"
             :href="'https://github.com/lorthiz/kaitai_struct_webide/commit/' + KaitaiIdeInfo.commitId">{{
              KaitaiIdeInfo.commitId.substring(0, 7)
            }}</a>
          (<span>{{KaitaiIdeInfo.commitDate}}</span>,
          <a href="LICENSE.txt" target="_blank">license</a>)
        </div>
        <div>Kaitai compiler version: <span>
          {{ KaitaiStructCompiler.version + " (" + KaitaiStructCompiler.buildDate + ")" }}
        </span>
        </div>
      </div>

      <button class="modal-button" @click="store.closeWithDoNotShow()">close and do not show again</button>
      <button class="modal-button" @click="store.close()">Close</button>
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
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(-30%);
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

  transform: translateY(-30%);
  animation: 500ms ease-out 0s 1 slideInFromTop;
}

.modal-button {
  color: #57A6A1;
  border-radius: 4px;
  border: none;
  background-color: #222222;
  padding: 8px;
}

.modal-button:hover {
  color: #57A6A1;
  background-color: #344C64;
}

.title {
  align-self: center;
  font-size: 2rem;
}

.licenses {
  font-size: 1rem
}

.disclaimer {
  color: #BB5050
}

</style>