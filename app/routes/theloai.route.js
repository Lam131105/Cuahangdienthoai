const express = require("express");
const theLoai = require("../controllers/theloai.controller");

const router = express.Router();

router
  .route("/")
  .get(theLoai.findAll)
  .post(theLoai.create)
  .delete(theLoai.deleteAll);

router
  .route("/:id")
  .get(theLoai.findOne)
  .put(theLoai.update)
  .delete(theLoai.delete);

module.exports = router;
