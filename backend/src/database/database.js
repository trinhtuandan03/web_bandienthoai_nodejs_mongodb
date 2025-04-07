//D:\DaiHocHutechKhoa2021\41.NgoNguPhatTrienMoi\website_bandienthoai_nodejs_javascript_mongodb\backend\src\database\database.js
const config = require("./../../config/setting.json");

class DatabaseConnection {
    static getMongoClient() {
        const user = config.mongodb.username;
        const pass = config.mongodb.password;
        const dbName = config.mongodb.database;

        const url = `mongodb+srv://${user}:${pass}@trinhtuandan-mongodb.fhup4.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=trinhtuandan-mongodb`;

        const { MongoClient } = require("mongodb");
        const client = new MongoClient(url);
        return client;
    }
}

module.exports = DatabaseConnection;
// update
