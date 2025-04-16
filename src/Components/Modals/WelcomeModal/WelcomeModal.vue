<script setup lang="ts">

import KaitaiStructCompiler from "kaitai-struct-compiler";
import {useWelcomeModalStore} from "./WelcomeModalStore";
import TextLink from "../../UtilComponents/TextLink.vue";

const store = useWelcomeModalStore();

const KaitaiIdeInfo = {
  version: "0.3-SNAPSHOT",
  commitId: process.env.GIT_COMMIT,
  buildDate: process.env.BUILD_DATE
};

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
        <TextLink link="https://ide.kaitai.io" text="https://ide.kaitai.io"/>
        Below is the original welcome message, with updated links to licenses.
      </div>

      <div class="title">Hey there!</div>
      <div>
        If this is the first time you are using Kaitai WebIDE then I recommend scrolling through our
        <TextLink link="https://github.com/kaitai-io/kaitai_struct_webide/wiki/Features" text="Features page"/>
      </div>
      <div>
        You can read more about Kaitai Struct on our website (
        <TextLink link="http://kaitai.io" text="kaitai.io"/>
        ) and
        learn the basics of using it by reading
        <TextLink link="http://doc.kaitai.io" text="our documentation"/>
        .
      </div>
      <div>
        We would be pleased if you could visit us and share your thoughts about Kaitai Struct or WebIDE
        in our
        <TextLink link="https://gitter.im/kaitai_struct/Lobby" text="Gitter chatroom"/>
      </div>
      <div>
        You can view the source code or create issues on Github
        for the
        <TextLink link="https://github.com/kaitai-io/kaitai_struct_webide" text="WebIDE"/>
        or
        <TextLink link="https://github.com/kaitai-io/kaitai_struct" text="Kaitai Struct"/>
      </div>
      <div>
        Kaitai WebIDE was made possible by using
        <TextLink link="LICENSE-3RD-PARTY.txt" text="open-source libraries listed here"/>
        .
      </div>
      <div>
        Also, follow us on Twitter!
        <ul>
          <li>
            <TextLink link="https://twitter.com/koczkatamas" text="@koczkatamas"/>
            (WebIDE author)
          </li>
          <li>
            <TextLink link="https://twitter.com/kaitai_io" text="@kaitai_io"/>
            (Kaitai Project)
          </li>
        </ul>
      </div>
      <div class="licenses">
        <div>
          <span>Kaitai WebIDE version: </span>
          <span id="webIdeVersion">{{ KaitaiIdeInfo.version }}-</span>
          <TextLink :link="`https://github.com/lorthiz/kaitai_struct_webide/commit/${KaitaiIdeInfo.commitId}`"
                    :text="KaitaiIdeInfo.commitId.substring(0, 7)"/>
          (<span>{{ KaitaiIdeInfo.buildDate }}</span>,
          <TextLink link="LICENSE.txt" text="license"/>
          )
        </div>
        <div>
          Kaitai compiler version: {{ KaitaiStructCompiler.version + " (" + KaitaiStructCompiler.buildDate + ")" }}
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
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
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
  font-size: 10px;
}

.disclaimer {
  color: #BB5050
}

</style>