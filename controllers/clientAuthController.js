const express = require('express')
const router = express.Router()

// require client model...other applicable

router.get('/', async (req, res, next) => {
	res.json(data={ greet: 'hello' })
})

module.exports = router