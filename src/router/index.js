import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home
  // },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
  {
    path: '/',
    redirect: '/store'
  },
  {
    path: '/ebook',
    component: () => import('../views/ebook/index'),
    children: [
      {
        path: ':fileName', // 动态路由,动态路径参数以冒号开头
        component: () => import('../components/ebook/EbookReader')
      }
    ]
  },
  {
    path: '/store',
    component: () => import('../views/store/index'),
    redirect: 'store/shelf', // 重定向，指定默认路径
    children: [
      {
        path: 'shelf',
        component: () => import('../views/store/StoreShelf')
      },
      {
        path: 'category',
        component: () => import('../views/store/StoreCategory')
      },
      {
        path: 'home',
        component: () => import('../views/store/StoreHome')
      },
      {
        path: 'list',
        component: () => import('../views/store/StoreList.vue')
      },
      {
        path: 'detail',
        component: () => import('../views/store/StoreDetail.vue')
      },
      {
        path: 'speaking',
        component: () => import('../views/store/StoreSpeaking.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
