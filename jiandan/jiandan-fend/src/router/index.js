import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/index'
import Welcome from '@/components/welcome'



import JingXuan from '@/components/indexchilder/jinxuan'
import Video from '@/components/indexchilder/video'
import Pirce from '@/components/indexchilder/pirce'
Vue.use(Router)


const router = new Router({
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/index',
      name: 'index',
      component: Index,
      children: [
        {
          path: 'jx',
          name: 'jx',
          component: JingXuan,
        },
        {
          path: 'video',
          name: 'video',
          component: Video,
        },
        {
          path: 'pirce',
          name: 'pirce',
          component: Pirce,
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  next()
  // if(to.name == "Me"){
  //   if(localStorage.getItem("name") == null || localStorage.getItem("email") == null){
  //     alert("需要登录")
  //     next()
  //   }else {
  //     next()
  //   }
  // }else {
  //   next()
  // }
  
})

export default router