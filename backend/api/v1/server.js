const express = require("express");
const cors = require("cors");
const router = express.Router();
const connections = require("./routes/connections.js");
const config = require("./routes/config.js");
const data = require("./routes/data.js");

router.use(express.json());
router.use(cors());

router.use("/api/connections", connections);
router.use("/api/config", config);
router.use("/api/data", data);

module.exports = router;
