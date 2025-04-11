const express = require("express");
const router = express.Router();
const axios = require("axios");
const UserModel = require("../../models/UserModel");
const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/CategoryModel");
const BlogModel = require("../../models/BlogModel");
const checkAdminToken = require("../../middleware/checkRole");

// Middleware kiểm tra vai trò admin
router.use((req, res, next) => {
    const role = req.session.role;

    if (!req.session.token) {
        return res.redirect("/login"); // Chuyển hướng nếu chưa đăng nhập
    }

    if (role === "user") {
        return res.redirect("http://localhost:3000/home"); // Điều hướng user đến trang home
    }

    if (role !== "admin") {
        return res.status(403).render("unauthorized", {
            message: "Bạn không có quyền truy cập vào trang quản trị."
        });
    }

    next(); // Tiếp tục xử lý nếu là admin
});

// Route quản lý người dùng
router.get("/UserManage", async function (req, res) {
    const token = req.session.token;

    try {
        const response = await axios.get("http://localhost:5000/api/auth/user-list", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userList = response.data.data.map(u => new UserModel(u));
        res.render("admin/UserManage/userManage.ejs", {
            users: userList,
            error: null
        });
    } catch (err) {
        console.error("❌ Lỗi truy cập UserManage:", err.message);
        res.redirect("/login");
    }
});

router.get("/UserDetails", async function (req, res) {
    const token = req.session.token;
    const userId = req.query.id;

    if (!token || !userId) return res.redirect("/UserManage");

    try {
        const response = await axios.get(`http://localhost:5000/api/auth/user-detail?id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const userData = response.data.data;
        res.render("admin/UserManage/userDetails.ejs", { user: userData });

    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết người dùng:", err.message);
        res.render("admin/UserManage/userDetails.ejs", {
            user: null,
            error: "Không thể lấy thông tin người dùng"
        });
    }
});

router.get("/SanPhamManage/Index", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        const response = await axios.get("http://localhost:5000/api/product/product-list", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const productList = response.data.data.map(p => new ProductModel(p));

        res.render("admin/SanPhamManage/Index.ejs", {
            products: productList,
            error: null
        });

    } catch (err) {
        console.error("❌ Lỗi lấy danh sách sản phẩm:", err.message);
        res.render("admin/SanPhamManage/Index.ejs", {
            products: [],
            error: "Không thể lấy danh sách sản phẩm"
        });
    }
});

router.get("/SanPhamManage/Create", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        const response = await axios.get("http://localhost:5000/api/category/category-list", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const categories = response.data.data.map(c => new CategoryModel(c));

        res.render("admin/SanPhamManage/Create.ejs", {
            error: null,
            categories
        });
    } catch (err) {
        console.error("❌ Lỗi lấy danh mục:", err.message);
        res.render("admin/SanPhamManage/Create.ejs", {
            error: "Không thể tải danh mục sản phẩm",
            categories: []
        });
    }
});

router.post("/SanPhamManage/Create", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        await axios.post("http://localhost:5000/api/product/add-product", req.body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.redirect("/SanPhamManage/Index");
    } catch (err) {
        console.error("❌ Lỗi thêm sản phẩm:", err.message);
        res.render("admin/SanPhamManage/Create.ejs", {
            error: "Không thể thêm sản phẩm: " + (err.response?.data?.message || err.message)
        });
    }
});


router.get("/SanPhamManage/Details", async function (req, res) {
    const token = req.session.token;
    const id = req.query.id;

    if (!token || !id) return res.redirect("/SanPhamManage/Index");

    try {
        const response = await axios.get(`http://localhost:5000/api/product/product-detail?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const product = new ProductModel(response.data.data);

        res.render("admin/SanPhamManage/Details.ejs", {
            product,
            error: null
        });

    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết sản phẩm:", err.message);
        res.render("admin/SanPhamManage/Details.ejs", {
            product: null,
            error: "Không thể lấy thông tin sản phẩm"
        });
    }
});

router.get("/SanPhamManage/Edit", async function (req, res) {
    const token = req.session.token;
    const id = req.query.id;

    if (!token || !id) return res.redirect("/SanPhamManage/Index");

    try {
        const response = await axios.get(`http://localhost:5000/api/product/product-detail?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const product = new ProductModel(response.data.data);

        res.render("admin/SanPhamManage/Edit.ejs", {
            product,
            error: null
        });

    } catch (err) {
        console.error("❌ Lỗi lấy dữ liệu sản phẩm để sửa:", err.message);
        res.render("admin/SanPhamManage/Edit.ejs", {
            product: null,
            error: "Không thể tải thông tin sản phẩm"
        });
    }
});

router.post("/SanPhamManage/Edit", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        await axios.put("http://localhost:5000/api/product/update-product", req.body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.redirect("/SanPhamManage/Index");
    } catch (err) {
        console.error("❌ Lỗi cập nhật sản phẩm:", err.message);
        res.render("admin/SanPhamManage/Edit.ejs", {
            product: req.body,
            error: "Không thể cập nhật sản phẩm: " + (err.response?.data?.message || err.message)
        });
    }
});

router.post("/SanPhamManage/Delete", async function (req, res) {
    const token = req.session.token;
    const id = req.body.id; // Lấy ID sản phẩm từ body request

    if (!token || !id) {
        return res.status(400).json({ message: "Thiếu token hoặc ID sản phẩm." });
    }

    try {
        const response = await axios.delete(`http://localhost:5000/api/product/delete-product?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
            return res.status(200).json({ message: "Xóa sản phẩm thành công!" });
        } else {
            return res.status(response.status).json({ message: response.data.message || "Lỗi không xác định." });
        }
    } catch (err) {
        console.error("❌ Lỗi xóa sản phẩm:", err.message);
        return res.status(500).json({ message: "Không thể xóa sản phẩm: " + (err.response?.data?.message || err.message) });
    }
});

router.get("/BlogManage/Index", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        const response = await axios.get("http://localhost:5000/api/blog/list", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const blogs = response.data.data.map(b => new BlogModel(b));

        res.render("admin/BlogManage/Index.ejs", {
            blogs,
            error: null
        });
    } catch (err) {
        console.error("❌ Lỗi lấy danh sách bài viết:", err.message);
        res.render("admin/BlogManage/Index.ejs", {
            blogs: [],
            error: "Không thể tải danh sách bài viết"
        });
    }
});

router.get("/BlogManage/Create", function (req, res) {
    res.render("admin/BlogManage/Create.ejs");
});
router.post("/BlogManage/Create", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        const data = {
            ...req.body,
            author: req.session.user?.name || "Admin"
        };
        await axios.post("http://localhost:5000/api/blog/add", data, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.redirect("/BlogManage/Index");
    } catch (err) {
        console.error("❌ Lỗi thêm bài viết:", err.message);
        res.render("admin/BlogManage/Create.ejs", {
            error: "Không thể thêm bài viết: " + (err.response?.data?.message || err.message)
        });
    }
});

router.get("/BlogManage/Details", async function (req, res) {
    const token = req.session.token;
    const id = req.query.id;

    if (!token || !id) return res.redirect("/BlogManage/Index");

    try {
        const response = await axios.get(`http://localhost:5000/api/blog/detail?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const blog = new BlogModel(response.data.data);

        res.render("admin/BlogManage/Details.ejs", {
            blog,
            error: null
        });
    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết bài viết:", err.message);
        res.render("admin/BlogManage/Details.ejs", {
            blog: null,
            error: "Không thể tải thông tin bài viết"
        });
    }
});

router.get("/BlogManage/Edit", async function (req, res) {
    const token = req.session.token;
    const id = req.query.id;

    if (!token || !id) return res.redirect("/BlogManage/Index");

    try {
        const response = await axios.get(`http://localhost:5000/api/blog/detail?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const blog = new BlogModel(response.data.data);

        res.render("admin/BlogManage/Edit.ejs", {
            blog,
            error: null
        });
    } catch (err) {
        console.error("❌ Lỗi lấy bài viết để sửa:", err.message);
        res.render("admin/BlogManage/Edit.ejs", {
            blog: null,
            error: "Không thể tải thông tin bài viết"
        });
    }
});

router.post("/BlogManage/Edit", async function (req, res) {
    const token = req.session.token;

    if (!token) return res.redirect("/login");

    try {
        await axios.put("http://localhost:5000/api/blog/update", req.body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.redirect("/BlogManage/Index");
    } catch (err) {
        console.error("❌ Lỗi cập nhật bài viết:", err.message);
        res.render("admin/BlogManage/Edit.ejs", {
            blog: req.body,
            error: "Không thể cập nhật bài viết: " + (err.response?.data?.message || err.message)
        });
    }
});

router.get("/Thongke/all", async (req, res) => {
    try {
        const token = req.session.token;

        const response = await axios.get("http://localhost:5000/api/order/total-revenue", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const total = response.data.total;

        res.render("admin/Thongke/all", {
            totalRevenue: total,
            user: req.session.user
        });

    } catch (err) {
        console.error("❌ Lỗi lấy tổng doanh thu:", err.message);
        res.render("admin/Thongke/all", {
            totalRevenue: 0,
            user: req.session.user,
            error: "Không thể lấy tổng doanh thu."
        });
    }
});

router.get("/Thongke/date", async (req, res) => {
    try {
        const token = req.session.token;
        const response = await axios.get("http://localhost:5000/api/order/revenue-by-date", {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.render("admin/Thongke/date.ejs", {
            revenueData: response.data
        });

    } catch (err) {
        console.error("❌ Lỗi lấy doanh thu theo ngày:", err.message);
        res.render("admin/Thongke/date.ejs", {
            revenueData: [],
            error: "Không thể lấy dữ liệu doanh thu."
        });
    }
});

router.get("/Thongke/month", function (req, res) {
    res.render("admin/Thongke/month.ejs");
});
router.get("/Thongke/year", function (req, res) {
    res.render("admin/Thongke/year.ejs");
});







module.exports = router;