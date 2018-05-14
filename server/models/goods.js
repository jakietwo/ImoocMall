var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var productSchem = new Schema({
  "productId":String,
  "productName":String,
  "salePrice": Number,
  "productImage":String,
  "checked":String,
  "productNum":String

});
//导出
module.exports = mongoose.model('Good',productSchem);

