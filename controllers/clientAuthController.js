const express = require('express')
const router = express.Router()

// require client model...other applicable

router.get('/', async (req, res, next) => {
	res.send('Hello Again')
})

module.exports = router