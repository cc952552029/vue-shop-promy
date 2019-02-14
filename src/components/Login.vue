<template>
  <div id="login-container">
    <div id="login-box">
      <div id="logo-box">
        <img src="../assets/img/logo.png">
      </div>
      <el-form :rules="loginFormRules" ref="loginFromRef" :model="loginForm">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username">
            <i slot="prefix" class="iconfont icon-user"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password">
            <i slot="prefix" class="iconfont icon-3702mima"></i>
          </el-input>
        </el-form-item>
        <el-row>
          <el-col :offset="14">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="restFrom">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      // 给各个表单域定义规则
      loginFormRules: {
        // required非空检验   message:错误提示   trigger:触发校验机制
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 用户登录系统
    login() {
      this.$refs.loginFromRef.validate(async valid => {
        if (valid === true) {
          // 用户真实性校验检验
          const { data: res } = await this.$http.post('/login', this.loginForm)
          // 检验成功后访问的页面
          if (res.meta.status !== 200) {
            this.$message.error('登录失败，用户名或密码错误')
          }
          // 通过sessionStorage记录服务器的token信息
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    },
    restFrom() {
      this.$refs.loginFromRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
#login-container {
  background-color: #2b4b6b;
  height: 100%;
  overflow: hidden;
  #login-box {
    width: 450px;
    height: 304px;
    background-color: #fff;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .el-form {
      position: absolute;
      bottom: 0px;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }
    #logo-box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 8px;
      box-shadow: 0 0 10px #eee;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
}
</style>
