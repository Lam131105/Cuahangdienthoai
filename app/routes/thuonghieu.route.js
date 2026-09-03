const express = require("express");
const thuongHieu = require("../controllers/thuonghieu.controller");

const router = express.Router();

router
  .route("/")
  .get(thuongHieu.findAll)
  .post(thuongHieu.create)
  .delete(thuongHieu.deleteAll);

router
  .route("/:id")
  .get(thuongHieu.findOne)
  .put(thuongHieu.update)
  .delete(thuongHieu.delete);

module.exports = router;
