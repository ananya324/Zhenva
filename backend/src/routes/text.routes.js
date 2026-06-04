const { Router } = require("express");
const { checkText } = require("../controllers/text.controller");

const router = Router();

router.post("/",checkText);

module.exports = router;
