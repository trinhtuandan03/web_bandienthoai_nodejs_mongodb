const express = require("express");
const router = express.Router();
const axios = require("axios");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");

// Route hiển thị danh sách sản phẩm
// router.get("/product", async (req, res) => {
//     try {
//         const categoryId = req.query.category;

//         // Xây dựng URL API dựa trên categoryId
//         const productApiUrl = categoryId
//             ? `http://localhost:5000/api/product/product-list?category=${categoryId}`
//             : `http://localhost:5000/api/product/product-list`;

//         // Gọi API để lấy danh sách sản phẩm và danh mục
//         const [productRes, categoryRes] = await Promise.all([
//             axios.get(productApiUrl),
//             axios.get("http://localhost:5000/api/category/category-list")
//         ]);

//         // Xử lý dữ liệu sản phẩm và danh mục
//         const products = productRes.data?.data?.map(item => new ProductModel(item)) || [];
//         const categories = categoryRes.data?.data?.map(item => new CategoryModel(item)) || [];

//         // Render view với dữ liệu
//         res.render("SanPham/product", {
//             products,
//             categories,
//             selectedCategory: categoryId || "",
//             user: req.session.user // Truyền thông tin người dùng vào view
//         });
//     } catch (err) {
//         console.error("❌ Lỗi khi lấy danh sách sản phẩm:", err.message);
//         res.render("SanPham/product", {
//             products: [],
//             categories: [],
//             error: "Không thể hiển thị sản phẩm.",
//             selectedCategory: "",
//             user: req.session.user // Truyền thông tin người dùng vào view
//         });
//     }
// });
router.get("/product", async (req, res) => {
    try {
        const categoryId = req.query.category || "";
        const keyword = req.query.keyword || "";

        const productApiUrl = categoryId
            ? `http://localhost:5000/api/product/product-list?category=${categoryId}`
            : `http://localhost:5000/api/product/product-list`;

        const [productRes, categoryRes] = await Promise.all([
            axios.get(productApiUrl),
            axios.get("http://localhost:5000/api/category/category-list")
        ]);

        let products = productRes.data?.data?.map(item => new ProductModel(item)) || [];
        const categories = categoryRes.data?.data?.map(item => new CategoryModel(item)) || [];

        // Lọc sản phẩm theo keyword nếu có
        if (keyword) {
            const keywordLower = keyword.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(keywordLower)
            );
        }

        res.render("SanPham/product", {
            products,
            categories,
            selectedCategory: categoryId,
            keyword, // truyền keyword vào view
            user: req.session.user
        });
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách sản phẩm:", err.message);
        res.render("SanPham/product", {
            products: [],
            categories: [],
            error: "Không thể hiển thị sản phẩm.",
            selectedCategory: "",
            keyword: "",
            user: req.session.user
        });
    }
});


// Route hiển thị chi tiết sản phẩm
router.get("/productdetails/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        const productRes = await axios.get(`http://localhost:5000/api/product/product-detail?id=${productId}`);
        const productData = productRes.data?.data;
        const product = new ProductModel(productData);

        res.render("SanPham/productdetails", { product, user: req.session.user });
    } catch (err) {
        console.error("❌ Lỗi lấy chi tiết sản phẩm:", err.message);
        res.render("SanPham/productdetails", {
            product: null,
            error: "Không thể hiển thị chi tiết sản phẩm.",
            user: req.session.user
        });
    }
});


module.exports = router;
