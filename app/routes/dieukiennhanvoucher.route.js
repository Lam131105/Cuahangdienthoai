const express = require("express");
const dieuKien = require("../controllers/dieukiennhanvoucher.controller");

const router = express.Router();

router
  .route("/")
  .get(dieuKien.findAll)
  .post(dieuKien.create)
  .delete(dieuKien.deleteAll);

router
  .route("/:id")
  .get(dieuKien.findOne)
  .put(dieuKien.update)
  .delete(dieuKien.delete);

module.exports = router;
