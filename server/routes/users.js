var express = require('express');
var router = express.Router();
var User = require('./../models/user');
require('./../util/util');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/login",function (req, res, next) {
  var param = {
    userName:req.body.userName,
    userPwd:req.body.userPwd,
  };
  User.findOne(param,function (err, userdoc) {
    if (err){
      res.json({
        status:"1",
        msg: err.message
      })
    }else {
      if (userdoc){
        res.cookie("userId",userdoc.userId,{
          path:'/',
          maxAge:1000*60*60
        });
        res.cookie("userName",userdoc.userName,{
          path:'/',
          maxAge:1000*60*60
        });
        // req.session.user = userdoc;
        res.json({
          status:"0",
          msg:'',
          result:{
            userName:userdoc.userName
          }
        })
      }else {
        res.json({
          status:'1',
          msg:"用户名或者密码错误"
        })
      }
    }
  });
});
//登出接口
router.post("/logout",function (req, res, next){
  res.cookie("userId","",{
    path:'/',
    maxAge:-1
  });
  res.json({
    status:'0',
    msg:"",
    result:{}
  })
});
//保持用户登录状态
router.get('/checkLogin',function (req, res, next) {
  if (req.cookies.userId){
    res.json({
      status:'0',
      msg:'',
      result:req.cookies.userName
    })
  }else {
    res.json({
      status:'1',
      msg:'未登录',
      result:{}
    })
  }
});

//查询用户购物车数据
router.get('/cartList',function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId},function (err,doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }
    else {
      if (doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.cartList
        })
      }
    }
  })
});
//购物车删除
router.post('/cartDel',function (req,res,next) {
  var userId = req.cookies.userId, productId = req.body.productId;
  User.update({
    userId:userId
  },{
    $pull:{
      'cartList':{
        'productId':productId
      }
    }
  },function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:'',
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
});
//购物车编辑数量
router.post('/cartEdit',function (req, res, next) {
  var userId = req.cookies.userId,productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked;
  User.update({'userId':userId,'cartList.productId':productId},{
    'cartList.$.productNum':productNum,
    'cartList.$.checked':checked
  },function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
});
router.post('/editCheckAll',function (req, res, next) {
  var userId = req.cookies.userId,
      checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId},function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      if (doc){
        doc.cartList.forEach((item)=>{
          item.checked = checkAll;
        });
        doc.save(function (err1, doc1) {
          if (err1){
            res.json({
              status:'1',
              msg:err1.message,
              result:''
            })
          }else {
            res.json({
              status:'0',
              msg:'',
              result:'suc'
            })
          }
        })
      }
    }
  })
});
//查询用户配送地址
router.get('/addressList',function (req, res, next) {
  var userId = req.cookies.userId;
  User.findOne({userId:userId},function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result: doc.addressList
      })
    }
  })
});
//设置默认地址
router.post('/setDefault',function (req, res, next) {
  var userId = req.cookies.userId,
      addressId = req.body.addressId;
  if (!addressId){
    res.json({
      status:'1',
      msg:'addressId is null',
      result:''
    })
  }else {
    User.findOne({userId:userId},function (err, doc) {
      if (err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else {
        var addressList = doc.addressList;
        addressList.forEach((item)=>{
          if(item.addressId == addressId){
            item.isDefault = true;
          }else {
            item.isDefault = false;
          }
        });
        doc.save(function (err1, doc1) {
          if(err1){
            res.json({
              status:'1',
              msg:err1.message,
              result:''
            })
          }else {
            res.json({
              status:'0',
              msg:'',
              result:'suc'
            })
          }
        })
      }
    })
  }

});
//删除地址
router.post('/delAddress',function (req, res, next) {
  var userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
       'addressId':addressId
    }}
  },function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:'suc'
      })
    }
  })
});
//支付功能
router.post('/payment',function (req, res, next) {
  var userId = req.cookies.userId,orderTotal = req.body.orderTotal;
  var addressId = req.body.addressId;
  User.findOne({
    userId:userId
  },function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      var address = '',goodsList = [];
      //获取当前用户地址信息
      doc.addressList.forEach((item)=>{
        if(item.addressId = addressId){
          address = item;
        }
      });
      //获取用户购物车购买的商品
      doc.cartList.forEach((item)=>{
        if (item.checked == '1') {
          goodsList.push(item);
        }
      });
      //生成order ID
      var platForm = '622';
      var r1 = Math.floor( Math.random()*10);
      var r2 = Math.floor( Math.random()*10);
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-mm-dd hh:mm:ss');
      var orderId =  platForm + r1 + sysDate + r2;
      var order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:1,
        createDate:createDate
      };

      doc.orderList.push(order);

      doc.save(function (err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
    }
  })
});
//获取订单详情
router.get('/orderDetail',function (req, res, next) {
  var orderId = req.param("orderId"),userId = req.cookies.userId;
  User.findOne({
    userId:userId
  },function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else {
      var orderList = doc.orderList;
      if (orderList.length>0){
        var orderTotal = 0;
        orderList.forEach((item)=>{
          if (item.orderId == orderId ) {
            orderTotal = item.orderTotal;
          }
        });
        if (orderTotal <=0 ){
           res.json({
             status:'12002',
             msg:'无此订单',
             result:''
           });
        }else {
          res.json({
            status:"0",
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }

      }else {
        res.json({
          status:'12001',
          msg:'当前用户无订单',
          result:''
        })
      }
    }
  })
});
//获取购物车数量
router.get('/getCartCount',function (req, res, next) {
  if (req.cookies.userId && req.cookies ){
    var userId = req.cookies.userId;
    User.findOne({userId:userId},function (err, doc) {
      if (err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        });
      }else{
        let count = 0,cartLisr = doc.cartList;
        cartLisr.forEach((item)=>{
          count += parseInt( item.productNum);
        });
        res.json({
          status:'0',
          msg:'',
          result:count
        })
      }
    });
  }else {
    let count = 0;
    res.json({
      status:'1001',
      msg:'你他么还没登录！',
      result:count
    })
  }

});
module.exports = router;
