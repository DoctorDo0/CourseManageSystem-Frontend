<template>
  <div class="student-login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <el-form :model="loginForm" label-width="0px" class="login-form">
        <el-form-item>
          <el-input
              v-model="loginForm.username"
              placeholder="请输入学号"
              prefix-icon="el-icon-user"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              class="login-btn"
              @click="handleLogin"
              :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {studentMemberLogin} from "@/api/student/StudentMemberApi.js";
import {setJwt} from "@/api/JwtApi.js";

const router = useRouter();
const loading = ref(false);
// 登录表单
const loginForm = ref({
  username: "",
  password: ""
});

// StudentLogin.vue 的 handleLogin 函数修改
const handleLogin = async () => {
  if (!loginForm.value.username) {
    ElMessage.warning("请输入学号");
    return;
  }
  if (!loginForm.value.password) {
    ElMessage.warning("请输入密码");
    return;
  }

  loading.value = true;
  try {
    const resp = await studentMemberLogin(loginForm.value);
    if (resp.success) {
      if (resp.data.token) setJwt(resp.data.token);

      localStorage.setItem("studentId", resp.data.studentId || loginForm.value.username);
      localStorage.setItem("studentName", resp.data.name);
      ElMessage.success("登录成功");
      setTimeout(() => {
        router.push("/Student-course-main");
      }, 500);
    } else {
      ElMessage.error(resp.msg || "登录失败");
    }
  } catch (error) {
    ElMessage.error("网络异常，请重试");
    console.error("登录异常：", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.student-login-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #303133;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.el-input {
  margin-bottom: 15px;
}
</style>