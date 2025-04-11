//D:\DaiHocHutechKhoa2021\41.NgoNguPhatTrienMoi\website_bandienthoai_nodejs_javascript_mongodb\frontend\src\controllers\authenticatecontroller.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const UserModel = require("../models/UserModel");

// Đăng ký (form)
router.get("/register", (req, res) => {
    res.render("NguoiDung/register", { error: null });
});

// Xử lý đăng ký
router.post("/register", async (req, res) => {
    try {
        const body = { ...req.body, role: "user" }; // Gán mặc định role là "user"
        const response = await axios.post("http://localhost:5000/api/auth/register", body);

        const user = new UserModel(response.data.user);
        req.session.user = user;
        res.redirect("/login");
    } catch (err) {
        res.render("NguoiDung/register", {
            error: "❌ Đăng ký thất bại: " + (err.response?.data?.message || err.message)
        });
    }
});

// Đăng nhập (form)
router.get("/login", (req, res) => {
    res.render("NguoiDung/login", { error: null });
});

// Xử lý đăng nhập
router.post("/login", async (req, res) => {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/login", req.body);
        const { token, user } = response.data;

        // Lưu token và role vào session
        req.session.token = token;
        req.session.role = user.role;
        req.session.user = user; // Lưu toàn bộ thông tin người dùng vào session

        // Điều hướng dựa trên role
        if (user.role === "admin") {
            return res.redirect("http://localhost:3000/UserManage");
        } else if (user.role === "user") {
            return res.redirect("http://localhost:3000/home");
        } else {
            return res.render("NguoiDung/login", { error: "❌ Vai trò không hợp lệ" });
        }
    } catch (err) {
        res.render("NguoiDung/login", { error: "❌ Đăng nhập thất bại: " + (err.response?.data?.message || err.message) });
    }
});

// Trang cá nhân
router.get("/account", async (req, res) => {
    const token = req.session.token;
    if (!token) return res.redirect("/login");

    try {
        // Gọi lại backend để lấy thông tin người dùng
        const response = await axios.get("http://localhost:5000/api/auth/test-security", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = response.data.user;
        req.session.user = user;

        res.render("NguoiDung/account", { user });
    } catch (err) {
        console.error("❌ Lỗi khi load trang account:", err.message);
        res.redirect("/login");
    }
});

// Đăng xuất
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;
