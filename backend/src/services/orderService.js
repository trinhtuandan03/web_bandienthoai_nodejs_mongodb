// D:\DaiHocHutechKhoa2021\41.NgoNguPhatTrienMoi\website_bandienthoai_nodejs_javascript_mongodb\backend\src\services\orderService.js
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

class OrderService {
    async addToCart(userId, productId, quantity) {
        const existing = await Cart.findOne({ userId, productId });
        if (existing) {
            existing.quantity += quantity;
            await existing.save();
            return existing;
        } else {
            return await Cart.create({ userId, productId, quantity });
        }
    }

    async getCart(userId) {
        return await Cart.find({ userId }).populate("productId");
    }

    async updateCart(userId, productId, quantity) {
        if (quantity < 1) {
            throw new Error("Số lượng phải lớn hơn 0");
        }

        const cartItem = await Cart.findOne({ userId, productId });
        if (!cartItem) {
            throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        return cartItem;
    }


    async removeFromCart(userId, productId) {
        return await Cart.findOneAndDelete({ userId, productId });
    }

    async checkout(userId) {
        const cartItems = await Cart.find({ userId });
        if (!cartItems.length) throw new Error("Giỏ hàng rỗng");

        let total = 0;
        const products = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            total += product.price * item.quantity;
            products.push({ productId: item.productId, quantity: item.quantity });
        }

        const order = new Order({ userId, products, totalAmount: total });
        await order.save();
        await Cart.deleteMany({ userId });

        return order;
    }

    async getOrderHistory(userId) {
        return await Order.find({ userId })
            .populate("products.productId")
            .sort({ paidAt: -1 });
    }

    async getTotalRevenue() {
        const orders = await Order.find({});
        return orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    }

    // Tổng doanh thu theo ngày
    async getRevenueByDate() {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" }
                    },
                    totalAmount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return result;
    }

}

module.exports = OrderService;
