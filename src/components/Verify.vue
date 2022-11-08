<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useInfo, ChallengeType } from "@/store";
import { ElLoading } from "element-plus";
import { getkeyPem } from "@/util/getVaildInfo";
import { useRouter } from "vue-router";
import { btoa } from "@/util/str-util";
const emit = defineEmits(["changeActive"]);

const router = useRouter();

const store = useInfo();
let { info, acme } = store;
const activeName = ref("http-01");
const httpChallenges: Array<ChallengeType> = info.challenges["http-01"];
const dnsChallenges: Array<ChallengeType> = info.challenges["dns-01"];

const verify = () => {
  const loadingInstance = ElLoading.service();
  const challengePriority = [activeName.value];

  console.log(challengePriority);

  getkeyPem(
    acme,
    info,
    challengePriority,
    (fullChainText: string, keyPem: string) => {
      store.$patch({ fullChainText: fullChainText, keyPem: keyPem });
      loadingInstance.close();
      router.push("/Success");
      emit("changeActive", 2);
    }
  );
};
</script>

<template>
  <div>
    <el-tabs stretch v-model="activeName">
      <el-tab-pane label="上传文件" name="http-01">
        <el-alert title="上传每个文件" type="success" :closable="false" />
        <div
          v-for="item in httpChallenges"
          :key="item.token"
          class="verify-card"
        >
          <div class="http-verification-info file-preview">
            <div class="paper-fold"></div>
            <div>
              <div class="file-ver-info-header">文件名</div>
              <pre class="js-acme-ver-file-location">{{ item.token }}</pre>
            </div>
            <hr />
            <div>
              <div class="file-ver-info-header">内容</div>
              <pre class="js-acme-ver-content">{{ item.httpAuth }}</pre>
            </div>
            <div class="download-file">
              <a
                class="js-download-verify-link"
                :href="btoa(item.httpAuth)"
                :download="item.token"
                target="_blank"
              >
                下载
              </a>
            </div>
            <hr />
            <div>
              <div class="file-ver-info-header">位置</div>
              <pre class="js-acme-ver-uri">{{ item.httpPath }}</pre>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="DNS记录" name="dns-01">
        <el-alert title="设置每个DNS记录" type="success" :closable="false" />
        <el-alert
          class="verify-card"
          title="设置DNS记录后最好等待30秒以上再验证"
          type="warning"
          :closable="false"
        />
        <el-alert
          class="verify-card"
          title="Google DNS用户可能需要等待5分钟"
          type="warning"
          :closable="false"
        />
        <div
          v-for="item in dnsChallenges"
          :key="item.dnsHost"
          class="verify-card"
        >
          <div class="http-verification-info file-preview">
            <div class="paper-fold"></div>
            <div>
              <div class="file-ver-info-header">TXT Host</div>
              <pre class="js-acme-ver-file-location">{{ item.dnsHost }}</pre>
            </div>
            <hr />
            <div>
              <div class="file-ver-info-header">TXT Value</div>
              <pre class="js-acme-ver-content">{{ item.dnsAnswer }}</pre>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-button type="primary" class="fill" @click="verify">验证</el-button>
  </div>
</template>

<style lang="scss" scoped>
.fill {
  width: -webkit-fill-available;
  width: 100%;
}
</style>
