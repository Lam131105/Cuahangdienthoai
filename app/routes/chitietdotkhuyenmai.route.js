const express = require("express");
const chiTietKM = require("../controllers/chitietdotkhuyenmai.controller");

const router = express.Router();

router
  .route("/")
  .get(chiTietKM.findAll)
  .post(chiTietKM.create)
  .delete(chiTietKM.deleteAll);

router.route("/:id").get(chiTietKM.findOne).delete(chiTietKM.delete);

module.exports = router;
