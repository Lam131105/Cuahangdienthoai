const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu file vào thư mục public/uploads (hoặc đổi đường dẫn tùy dự án)
    cb(null, "public/uploads/thuonghieu");
  },
  filename: (req, file, cb) => {
    // Đặt tên file chống trùng bằng timestamp: ví dụ 1725800000-samsung.png
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `thuonghieu-${uniqueSuffix}${ext}`);
  },
});

// Kiểm tra chỉ cho phép file hình ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên file hình ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn kích thước file 2MB
});

module.exports = upload;
