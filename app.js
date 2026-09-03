const express = require('express');
const cors = require('cors');

// Import các route API (Tách riêng ở thư mục routes)
const theLoaiRouter = require('./app/routes/theloai.route');
const thuongHieuRouter = require("./app/routes/thuonghieu.route");
const nhaCungCapRouter = require("./app/routes/nhacungcap.route");

const app = express();

app.use(cors());
app.use(express.json());

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SmartPhone Store API!' });
});

// Đăng ký danh sách các API Route riêng
app.use("/api/theloai", theLoaiRouter);
app.use("/api/thuonghieu", thuongHieuRouter);
app.use("/api/nhacungcap", nhaCungCapRouter);

// Middleware xử lý lỗi 404 (Không tìm thấy route)
app.use((req, res, next) => {
  return res.status(404).json({ message: 'Resource not found' });
});

module.exports = app;