const { Router } = require("express");
const { checkVideo, getJobStatus } = require("../controllers/video.controller");

const router = Router();

router.post("/", checkVideo);
router.get("/job/:jobId", getJobStatus);

module.exports = router;