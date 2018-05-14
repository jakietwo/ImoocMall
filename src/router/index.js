import Vue from 'vue'
import Router from 'vue-router'
import GoodList from './../views/GoodList'
import Cart from './../views/Cart'
import Address from './../views/Address'
import orderComfirm from './../views/orderConfirm'
import orderSuccess from './../views/orderSuccess'

Vue.use(Router);

export default new Router({

  routes: [
    {
      path: '/',
      name: 'GoodList',
      component: GoodList,
      },
    {
      path:'/cart',
      name:'cart',
      component:Cart
    },
    {
      path:'/address',
      name:'address',
      component:Address
    },
    {
      path:'/orderConfirm',
      name:'orderConfirm',
      component:orderComfirm
    },
    {
      path:'/orderSuccess',
      name:'orderSuccess',
      component:orderSuccess
    }


  ]
})
