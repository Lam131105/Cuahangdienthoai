const express = require("express");
const ram = require("../controllers/ram.controller");

const router = express.Router();

router.route("/").get(ram.findAll).post(ram.create).delete(ram.deleteAll);

router.route("/:id").get(ram.findOne).put(ram.update).delete(ram.delete);

module.exports = router;
