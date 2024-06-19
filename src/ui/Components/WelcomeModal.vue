<script setup lang="ts">

import {ref} from "vue";
import {KaitaiIdeInfo} from "../../KaitaiIdeInfo";
import KaitaiStructCompiler from "kaitai-struct-compiler";


const valueFromLocalStorage = localStorage.getItem("doNotShowWelcome") === "true";

const isHidden = ref(valueFromLocalStorage);
const dontShowAgain = () => {
  console.log("DONT SHOW AGAIN");
  localStorage.setItem("doNotShowWelcome", "true");
  isHidden.value = true;
};
</script>

<template>
  <div class="modal fade" id="welcomeModal" tabindex="-1" role="dialog" aria-labelledby="welcomeModalLabel">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="form-group">
            <h4 class="modal-title" id="welcomeModalLabel">Hey there!</h4>
          </div>
          <div class="form-group">
            If this is the first time you are using Kaitai WebIDE then I recommend scrolling through our
            <a href="https://github.com/kaitai-io/kaitai_struct_webide/wiki/Features" target="_blank">Features
              page</a>.
          </div>
          <div class="form-group">
            You can read more about Kaitai Struct on our website (<a href="http://kaitai.io"
                                                                     target="_blank">kaitai.io</a>) and
            learn the basics of using it by reading <a href="http://doc.kaitai.io" target="_blank">our
            documentation</a>.
          </div>
          <div class="form-group">
            We would be pleased if you could visit us and share your thoughts about Kaitai Struct or WebIDE
            in our
            <a href="https://gitter.im/kaitai_struct/Lobby" target="_blank">Gitter chatroom</a>.
          </div>
          <div class="form-group">
            You can view the source code or create issues on Github
            for the <a href="https://github.com/kaitai-io/kaitai_struct_webide" target="_blank">WebIDE</a>
            or
            <a href="https://github.com/kaitai-io/kaitai_struct" target="_blank">Kaitai Struct</a>.
          </div>
          <div class="form-group">
            Kaitai WebIDE was made possible by using
            <a href="https://github.com/kaitai-io/kaitai_struct_webide/blob/master/docs/wiki/3rd-party-libraries.md"
               target="_blank">open-source libraries listed here</a>
            (<a href="LICENSE-3RD-PARTY.txt" target="_blank">licensing information</a>).
          </div>
          <div class="form-group">
            Also, follow us on Twitter!
            <ul>
              <li style="margin-top:5px"><a href="https://twitter.com/koczkatamas" target="_blank">@koczkatamas</a>
                (WebIDE author)
              </li>
              <li style="margin-top:5px"><a href="https://twitter.com/kaitai_io"
                                            target="_blank">@kaitai_io</a>
                (Kaitai Project)
              </li>
            </ul>
          </div>
          <div class="licenses">
            <div>
              <span>Kaitai WebIDE version: </span>
              <span id="webIdeVersion">{{ KaitaiIdeInfo.version }}-SNAPSHOT</span>
              <a id="webideCommitId"
                 :href="'https://github.com/kaitai-io/kaitai_struct_webide/commit/' + KaitaiIdeInfo.commitId">{{ KaitaiIdeInfo.commitId.substr(0, 7) }}</a>
              (<span id="webideCommitDate"></span>,
              <a href="https://raw.githubusercontent.com/kaitai-io/kaitai_struct_webide/master/LICENSE"
                 target="_blank">license</a>)
            </div>
            <div>Kaitai compiler version: <span
                id="compilerVersion">{{
                KaitaiStructCompiler.version + " (" + KaitaiStructCompiler.buildDate + ")"
              }}</span>
            </div>
          </div>
          <div style="text-align:center; font-size:12px; margin-bottom:10px">
            <a @click="dontShowAgain" href="#" data-dismiss="modal">close and do not show again</a>
          </div>
          <div style="text-align:center">
            <button type="submit" class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>