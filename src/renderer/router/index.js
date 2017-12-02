import Vue from 'vue'
import Router from 'vue-router'

import Ripgrep from '@/components/Ripgrep'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Ripgrep
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
