<script setup lang="ts">
import { useInfo } from "@/store";
import { btoa } from "@/util/str-util";

const store = useInfo();
let { keyPem, fullChainText } = store;
</script>

<template>
  <div class="verify-card">
    <div class="http-verification-info file-preview">
      <div class="paper-fold"></div>
      <div>
        <div class="file-ver-info-header">privkey.pem</div>
        <pre class="js-acme-ver-file-location">{{ keyPem }}</pre>
        <div class="download-file">
          <a
            class="js-download-verify-link"
            :href="btoa(keyPem)"
            download="privkey.pem"
            target="_blank"
          >
            下载
          </a>
        </div>
      </div>
      <hr />
      <div>
        <div class="file-ver-info-header">fullchain.pem</div>
        <pre class="js-acme-ver-content">{{ fullChainText }}</pre>
        <div class="download-file">
          <a
            class="js-download-verify-link"
            :href="btoa(keyPem)"
            download="fullchain.pem"
            target="_blank"
          >
            下载
          </a>
        </div>
      </div>
    </div>
  </div>
  <div style="text-align: left; font-size: 14px">
    <h3>node.js https server example</h3>
    <pre><code>
("use strict");
var https = require("https");
var server = https
  .createServer(
    {
      key: require("fs").readFileSync("./privkey.pem"),
      cert: require("fs").readFileSync("./fullchain.pem"),
    },
    function (req, res) {
      res.end("Hello, World!");
    }
  )
  .listen(443, function () {
    console.log("Listening on", this.address());
  });        
            </code></pre>
  </div>
</template>

<style></style>
