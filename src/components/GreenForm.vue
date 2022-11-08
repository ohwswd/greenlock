<script setup lang="ts">
import { Ref, ref } from "vue";
const active = ref(0);
const changeActive = (step: number) => {
  active.value = step;
};
</script>

<template>
  <el-container>
    <el-header>
      <el-steps :active="active" align-center finish-status="success">
        <el-step title="输入" />
        <el-step title="验证" />
        <el-step title="成功" />
      </el-steps>
    </el-header>
    <el-main class="main"
      ><router-view @changeActive="changeActive"> </router-view
    ></el-main>
  </el-container>
</template>

<style scoped></style>
