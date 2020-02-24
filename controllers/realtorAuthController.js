const express = require('express')
const router = express.Router()
// models
const Realtor = require('../models/realtor')


/* -- Realtor ROUTES -- */
router.get('/', (req, res, next) => {
	res.json("Route works!!")
})


module.exports = router
