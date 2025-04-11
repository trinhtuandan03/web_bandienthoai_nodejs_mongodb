// D:\DaiHocHutechKhoa2021\41.NgoNguPhatTrienMoi\website_bandienthoai_nodejs_javascript_mongodb\backend\server.js
const express = require("express");
const bodyParser = require("body-parser");
const DatabaseConnection = require("./src/database/database");
const config = require("./config/setting.json"); // thêm dòng này
const mongoose = require("mongoose"); // thêm dòng này
const { seedDefaultRoles } = require("./src/models/role");

const app = express();

// Middleware để xử lý dữ liệu JSON và form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Kết nối tới MongoDB
(async () => {
    try {
        const client = DatabaseConnection.getMongoClient();
        await client.connect();
        console.log("✅ Kết nối MongoDB thành công!");

        // 👉 THÊM ĐOẠN NÀY
        await mongoose.connect(client.s.url, {
            dbName: config.mongodb.database
        });
        console.log("✅ Kết nối Mongoose thành công!");

        // ✅ Tạo dữ liệu role mặc định
        await seedDefaultRoles();

        app.locals.dbClient = client;
    } catch (error) {
        console.error("❌ Kết nối MongoDB thất bại:", error);
        process.exit(1);
    }
})();

// Import các controllerr
const controller = require("./src/controllers");
app.use(controller);
// Khởi động server backend 56804 5000
var server = app.listen(5000, function() {
    console.log("✅ Mở http://localhost:5000 để kiểm tra API hoạt động.");
});
