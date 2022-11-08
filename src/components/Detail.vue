<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    status-icon
    :rules="rules"
    require-asterisk-position="left"
  >
    <el-form-item label="域名" prop="domain" required>
      <el-input
        v-model="ruleForm.domain"
        type="text"
        clearable
        placeholder="www.wswd.store或*.store"
      />
    </el-form-item>
    <el-form-item label="邮箱" prop="email" required>
      <el-input
        v-model="ruleForm.email"
        type="email"
        clearable
        @keydown.enter="submitForm(ruleFormRef)"
        placeholder="jophy@gmail.com"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" class="fill" @click="submitForm(ruleFormRef)"
        >提交</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { FormInstance, ElMessage } from "element-plus";
import { getVaildInfo } from "@/util/getVaildInfo.js";
import { useInfo } from "@/store";
import { useRouter } from "vue-router";
import { ElLoading } from "element-plus";
const router = useRouter();
const store = useInfo();
const ruleFormRef = ref<FormInstance>();
const emit = defineEmits(["changeActive"]);

const validateDomain = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入域名"));
  } else {
    callback();
  }
};
const validateEmail = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入邮箱"));
  } else {
    callback();
  }
};

const ruleForm = reactive({
  domain: "",
  email: "",
});

const rules = reactive({
  domain: [{ validator: validateDomain, trigger: "blur" }],
  email: [{ validator: validateEmail, trigger: "blur" }],
});

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid, invalidFields) => {
    if (valid) {
      const loadingInstance = ElLoading.service();
      getVaildInfo(
        ruleForm.domain,
        ruleForm.email,
        (res: object, acme: object) => {
          store.$patch({ info: res, acme: acme });
          loadingInstance.close();
          router.push("/Verify");
          emit("changeActive", 1);
        }
      );
    } else {
      for (let item in invalidFields) {
        ElMessage.error(invalidFields[item][0].message);
      }
      return false;
    }
  });
};
</script>
<style scoped>
.el-form-item {
  margin-bottom: 30px;
}
.fill {
  width: -webkit-fill-available;
  width: 100%;
}
</style>
