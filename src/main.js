import Vue from 'vue'
import App from './App'
import router from './router'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import ElementUI from 'element-ui'
import axios from 'axios'
// 配置axios
axios.defaults.baseURL = ' http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios
Vue.use(ElementUI)
Vue.config.productionTip = false
// axios 的请求拦截器在其中配置token
axios.interceptors.request.use(function(config) {
  var token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
}, function(error) {
  return Promise.reject(error)
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
