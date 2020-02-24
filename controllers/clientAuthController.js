const express = require('express')
const router = express.Router()

// require client model...other applicable

router.get('/', async (req, res, next) => {
	res.json(data={ greet: 'hello' })
})

router.post('/', async (req, res, next) => {
	try{
		// const desiredEmail = req.body.email
		// const desiredUsername = req.body.username
		// const desiredPassword = req.body.password
		console.log('client post route hit');
		console.log(req.body);
		res.json(req.body.name + " is a good name")
	} catch(err) {
		// try creating custom error --> (console.error) or respond with if status ===... res.json(...)
		next(err)
	}
})

module.exports = router