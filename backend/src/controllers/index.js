//D:\DaiHocHutechKhoa2021\41.NgoNguPhatTrienMoi\website_bandienthoai_nodejs_javascript_mongodb\backend\src\controllers\index.js

var express = require("express");
var router = express.Router();

router.use("/api/auth", require(__dirname + "/api/authenticatecontroller"));
router.use("/api/category", require(__dirname + "/api/categorycontroller")); 
router.use("/api/product", require(__dirname + "/api/productcontroller"));
router.use("/api/blog", require(__dirname + "/api/blogcontroller"));
router.use("/api/order", require(__dirname + "/api/ordercontroller"));

router.get("/", function(req, res) {
    res.render("index.ejs");
});
module.exports = router;
//commit hienne hihi