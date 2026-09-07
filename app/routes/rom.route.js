const express = require("express");
const rom = require("../controllers/rom.controller");

const router = express.Router();

router.route("/").get(rom.findAll).post(rom.create).delete(rom.deleteAll);

router.route("/:id").get(rom.findOne).put(rom.update).delete(rom.delete);

module.exports = router;
