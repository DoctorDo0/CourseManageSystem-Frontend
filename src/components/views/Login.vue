<template>
  <div class="main">
    <div class="login-body">
      <div class="pic"></div>
      <div class="form">
        <h1>UOCRMS大学公开课预约管理系统</h1>
        <el-form style="padding: 10px" :model="loginModel" :rules="rules" ref="loginFormRef">
          <el-row>
            <el-col :span="24">
              <el-form-item label="用户名:" prop="username" :label-width="80">
                <el-input v-model="loginModel.username"
                          placeholder="请输入用户名" style="height: 40px;"
                          autocomplete="off"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="密码:" :label-width="80" prop="password">
                <el-input type="password" v-model="loginModel.password"
                          show-password placeholder="请输入密码"
                          style="height: 40px" autocomplete="off"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="验证码:" :label-width="80" prop="captcha">
                <el-input v-model="loginModel.captcha" placeholder="请输入验证码" maxlength="5" minLength="4"
                          style="height: 40px;" autocomplete="off"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <img class="captcha" :src="captchaUrl" style="height: 40px;" @click="newCapt" alt="验证码">
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-button type="primary" class="login-btn" @click="submitLogin">登&nbsp;&nbsp;录</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    <div class="mask"></div>
    <div class="copyright">
      <h2>&copy;版权所有 中享思途-课程管理中心</h2>
    </div>
  </div>
</template>

<style scoped>
.main {
  height: 100%;
  /*background: url("@/assets/login_bg.jpg") no-repeat center center/cover;*/
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main {
  height: 100%;
  width: 100%;
  background-image: url("@/assets/bg.gif") !important;
  background-repeat: repeat !important;
  background-color: #0a0a0a !important
  }

.main > .mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
}

.login-body {
  width: 700px;
  height: 450px;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  z-index: 1000;
}

.login-body > .pic {
  width: 180px;
  background: url("@/assets/login_side.jpeg") no-repeat center center/cover;
}

.login-body > .form {
  flex-grow: 1;
}

.login-body > .form > h1 {
  font-size: 24px;
  color: #333;
  text-align: center
}

.copyright {
  position: fixed;
  bottom: 100px;
  color: #333;
  font-size: 12px;
}

.login-btn {
  width: 100%;
  height: 50px;
  background-color: #16b777;
  color: #fff;
  font-size: 18px;
}

.captcha {
  cursor: pointer;
}
</style>

<script setup>
import {ref, onMounted, toRaw} from "vue";
import {setJwt} from "@/api/JwtApi.js";
//用于生成随机id
import {nanoid} from "nanoid";
import {login} from "@/api/UserApi.js";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

//获取路由转发器
const router = useRouter();

//登录表单
const loginModel = ref({
  username: "admin",
  password: "123456",
  captcha: null
});

//校验规则
const rules = {
  username: [
    {
      required: true, message: "用户名不可为空", trigger: "blur"
    }, {
      min: 4, max: 12, message: "用户名长度必须介于4~12之间", trigger: "blur"
    }
  ],
  password: [
    {
      required: true, message: "密码不可为空", trigger: "blur"
    }, {
      min: 6, max: 12, message: "密码长度必须介于6~12之间", trigger: "blur"
    }
  ],
  captcha: [{
    required: true, message: "验证码不可为空", trigger: "blur"
  }, {
    min: 5, max: 5, message: "验证码长度为5位", trigger: "blur"
  }]
};

const captchaUrl = ref();
const captchaKey = ref();//验证码唯一标识

onMounted(() => {
  newCapt();
});

function newCapt() {
  captchaKey.value = nanoid(12);
  captchaUrl.value = "/api/users/captcha?key=" + captchaKey.value;
}

//表单对象
const loginFormRef = ref();

//登录
function submitLogin() {
  loginFormRef.value.validate(async valid => {
    if (valid) {
      let params = toRaw(loginModel.value);
      params.key = captchaKey.value;
      let resp = await login(params);

      if (resp.success) {
        let jwt = resp.data;
        setJwt(jwt);//保存
        //中转到/mian路由
        router.push("/main");
      } else {
        ElMessage.error(resp.message || "登录验证失败");
        newCapt();
      }
    }
  });
}
</script>