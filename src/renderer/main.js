import Vue from 'vue'

import VueRx from 'vue-rx'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription' // Disposable if using RxJS4
import { Subject } from 'rxjs/Subject' // required for domStreams option
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/distinct'
import 'rxjs/add/operator/map'

import App from './App'
import router from './router'

Vue.use(VueRx, { Observable, Subscription, Subject })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
