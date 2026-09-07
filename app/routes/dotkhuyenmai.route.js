const express = require("express");
const dotKhuyenMai = require("../controllers/dotkhuyenmai.controller");

const router = express.Router();

router
  .route("/")
  .get(dotKhuyenMai.findAll)
  .post(dotKhuyenMai.create)
  .delete(dotKhuyenMai.deleteAll);

// Route lấy các đợt khuyến mãi đang diễn ra (Active)
router.get("/active", dotKhuyenMai.findActive);

router
  .route("/:id")
  .get(dotKhuyenMai.findOne)
  .put(dotKhuyenMai.update)
  .delete(dotKhuyenMai.delete);

module.exports = router;
