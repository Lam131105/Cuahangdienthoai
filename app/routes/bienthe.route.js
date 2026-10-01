const express = require("express");
const bienThe = require("../controllers/bienthe.controller");
const upload = require("../middlewares/bientheupload");

const router = express.Router();

router
  .route("/")
  .get(bienThe.findAll)
  .post(upload.single("image"), bienThe.create)
  .delete(bienThe.deleteAll);

// Route lấy tất cả biến thể của 1 Sản phẩm
router.get("/sanpham/:masanpham", bienThe.findBySanPham);

router
  .route("/:id")
  .get(bienThe.findOne)
  .put(upload.single("image"), bienThe.update)
  .delete(bienThe.delete);

module.exports = router;
