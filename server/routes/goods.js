var express = require('express');
var  router = express.Router();
var mongoose = require('mongoose');
var Goods = require('./../models/goods');
var User = require('./../models/user');


mongoose.connect('mongodb://localhost/dumall');//连接本地数据库
mongoose.connection.on("connected",function () {
    console.log("MongoDB connected success");
});

mongoose.connection.on("error",function () {
  console.log("MongoDB connected fail");
});

mongoose.connection.on("disconnected",function () {
  console.log("MongoDB connected disconnected");
});
//查询所有商品列表
router.get("/list",function (req, res, next) {
  let page = parseInt(req.param('page'));
  let pageSize = parseInt(req.param('pagesize'));
  var priceLever = req.param('priceLever');
  var priceStart='',priceEnd='';
  var param = {};
  if (priceLever != 'all') {
    switch (priceLever){
      case '0': priceStart = 0; priceEnd = 100; break;
      case '1': priceStart = 100; priceEnd = 500; break;
      case '2': priceStart = 500; priceEnd = 1000; break;
      case '3': priceStart = 1000; priceEnd = 5000; break;
    }
    param = {
      salePrice:{
        $gt: priceStart,
        $lte: priceEnd
      }
    }
  }
  let sort = req.param("sort");
  let skip = (page-1)* pageSize;
  let goodsModel = Goods.find(param).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function (err, doc) {
    if (err){
      res.json({
        status:'1',
        msg:"failed"
      })
    }else {
      res.json({
        status:'0',
        msg:'',
        result:{
          count :doc.length ,
          list:doc

        }
      })
    }
  })
});

//加入购物车方法
router.post("/addCart",function (req,res,next) {
  var userId = req.cookies.userId;
  var pid = req.body.productId;
  User.findOne ({
    userId:userId
  }, function (err, userdoc) {
      if (err){
        res.json({
          status:'1',
          msg:err.message
        })
      }else {
        if (userdoc){
          let goodsItem = '';
          userdoc.cartList.forEach(function (item) {
            if (item.productId == pid){
              goodsItem = item ;
              item.productNum++;
            }
          });
          if (goodsItem){
            userdoc.save(function (err2,doc2) {
              if (err2){
                res.json({
                  status:'1',
                  msg:err2.message
                })
              }else {
                res.json({
                  status:'0',
                  msg:'',
                  result:'success'
                })
              }
            });
          }else {
            Goods.findOne({productId: pid},function (err1,doc3) {
              if(err1){
                res.json({
                  status:"1",
                  msg:err1.message
                })
              }else {
                if (doc3){
                  doc3.checked = 1;
                  doc3.productNum = 1;

                  // doc3.productNum = 1;
                  // doc3.checked = 1;
                  userdoc.cartList.push( doc3);
                  userdoc.save(function (err2,doc) {
                    if (err2){
                      res.json({
                        status:'1',
                        msg:err2.message
                      })
                    }else {
                      res.json({
                        status:'0',
                        msg:'',
                        result:'success'
                      })
                    }
                  });
                }
              }
            })
          }


        }
      }
    }
    )
});
module.exports = router;
