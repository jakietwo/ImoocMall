<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span>goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <a href="javascript:void(0)" class="price" @click="sortGoods">Price
            <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="fiterByShow" >Filter by</a>
        </div>
        <div class="accessory-result">

          <!-- filter -->
          <div class="filter stopPop" v-bind:class="{'filterby-show':filterBy}" id="filter">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a href="javascript:void(0)"
                     v-bind:class="{'cur':priceChecked== 'all'  }"  @click="findAll">All </a></dd>
              <dd v-for="(price,index) in priceFilter" >
                <a href="javascript:void(0)" v-bind:class="{'cur':priceChecked==index}" @click="setFilter(index)">{{price.startPrice}}- {{ price.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="item in goodslist">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/'+item.productImage" alt=""></a>
                  </div>
                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" @click="addCart(item.productId)" class="btn ">加入购物车</a>
                    </div>
                  </div>
                </li>

              </ul>
              <div class="loadmore" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>

   <modal v-bind:mdshow="mdshow" v-on:close="closeModal">
     <p slot="message">
       请先登录!
     </p>
     <div slot="btnGroup">
       <a href=" javascript:;" class="btn btn--m close1" @click="mdshow = false">关闭</a>
     </div>
   </modal>
    <!--//加入购物车模态框-->
    <modal v-bind:mdshow="mdshowCart" v-on:close="closeModal">
      <p slot="message">
        <span> 加入购物车成功</span>
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use></svg>
      </p>
      <div slot="btnGroup">
        <a href=" javascript:;" class="btn btn--m shopping" @click="mdshowCart = false">继续购物</a>
        <router-link to="/cart" class="btn btn--m cartlist">查看购物车</router-link>

      </div>
    </modal>
    <nav-footer></nav-footer>
  </div>

</template>
<script type="text/ecmascript-6">
  import axios from 'axios'
  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import './../assets/css/login.css'
  import NavHeader from './../components/header'
  import NavFooter from './../components/footer'
  import NavBread from './../components/bread'
  import Modal from './../components/modal'
  export  default {
    data() {
      return {
        goodslist: [],
        sortFlag: true,
        page: 1,
        pagesize: 8,
        loading:false,
        mdshow:false,
        mdshowCart:false,
        priceFilter: [
          {
            startPrice: '0.00',
            endPrice: '100.00'
          },
          {
            startPrice: '100.00',
            endPrice: '500.00'
          },
          {
            startPrice: '500.00',
            endPrice: '1000.00'
          },
          {
            startPrice: '1000.00',
            endPrice: '5000.00'
          }
        ],
        priceChecked: 'all',
        filterBy: false,
        overLayFlag: false,
        busy: false
      }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,
      Modal
    },
    mounted: function () {
      this.getGoodsList();
    },
    methods: {
      getGoodsList(flag) {
        var param = {
          page: this.page,
          pagesize: this.pagesize,
          sort: this.sortFlag ? 1 : -1,
          priceLever:this.priceChecked
        };
        axios.get("/goods/list", {
          params: param
        }).then((result) => {
          this.loading = false;
          var res = result.data;
          if (res.status == "0") {
            if (flag) {
              this.goodslist = this.goodslist.concat(res.result.list);
              if (res.result.count < 8) {
                this.busy = true;
              } else {
                this.busy = false;
              }
            } else {
              this.goodslist = res.result.list;
              this.busy = false;
            }
          } else {
            this.goodslist = [];
          }
        })
      },
      sortGoods() {
        this.sortFlag = !this.sortFlag;
        this.page = 1;
        this.getGoodsList();
      },
      fiterByShow() {
        this.filterBy = true;
        this.overLayFlag = true;
      },
      //关闭遮罩
      closePop() {
        this.overLayFlag = false;
        this.filterBy = false;
      },
      findAll(){
        this.priceChecked = 'all';
        this.page = 1;
        this.getGoodsList();
      },
      setFilter(index) {
        this.priceChecked = index;
        this.page = 1;
        this.getGoodsList();
        this.closePop();
      },
      loadMore() {
        this.busy = true;
        this.loading = true;
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true);
        }, 500)

      },
      //加入购物车
      addCart(Id){
        axios.post('/goods/addCart',{
          productId: Id,
        }).then((response)=>{
          let res = response.data;
          if (res.status == "0"){
            this.mdshowCart = true;
            this.mdshow = false;
            this.$store.commit("updateCartCount",1);
          }else {
            this.mdshowCart = false;
            this.mdshow = true;
          }
        })
      },
      closeModal(){
        this.mdshow = false;
        this.mdshowCart = false;
      }
    }
  };
</script>
<style>
  .accessory-list ul::after{
    clear: both;
    height: 0;
    content: '';
    display: block;
    visibility: hidden;
  }
  .loadmore{
    height: 100px;
    width: 100px;
    margin:0px auto;
  }
  btn:hover{
    background-color: #ffe5e6;
    transition: 0.3s ease-in-out;
  }
  .shopping{
    width: 150px;
    margin-left:40px;
  }
  .cartlist{
    width: 150px;
    margin-left: 50px;
  }
  .close1{
    display: block;
    width: 150px;
    margin: 0 140px;
  }
</style>
