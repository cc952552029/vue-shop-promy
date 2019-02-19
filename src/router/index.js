import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import User from '@/components/User'
Vue.use(Router)
var router = new Router({
  routes: [
    { path: '/', component: HelloWorld },
    { path: '/login', component: Login },
    { path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {path: '/welcome', component: Welcome},
        {path: '/users', component: User}
      ]}
  ]
})
// 设置路由守卫
// to:即将要进入的目标 路由对象
// from 当前导航正要离开的路由
// 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是 confirmed (确认的)
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  // 如果请求不是login,就判断token
  var token = window.sessionStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next() // 继续编写
})
export default router
