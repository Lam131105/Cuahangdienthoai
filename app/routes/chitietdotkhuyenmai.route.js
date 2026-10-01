const express = require("express");
const chiTietKM = require("../controllers/chitietdotkhuyenmai.controller");

const router = express.Router();

router
  .route("/")
  .get(chiTietKM.findAll)
  .post(chiTietKM.createMany)
  .delete(chiTietKM.deleteAll);
router.route("/bulk-delete").delete(chiTietKM.deleteMany);

router.get("/dotkhuyenmai/:madotkhuyenmai", chiTietKM.findByDotKhuyenMai);

router.route("/:id").get(chiTietKM.findOne);

module.exports = router;
