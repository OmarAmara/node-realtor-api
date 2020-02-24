const express = require('express')
const router = express.Router()
// models
const Client = require('../models/client')

// require client model...other applicable

router.get('/', async (req, res, next) => {
	res.json(data={ greet: 'hello' })
})

router.post('/', async (req, res, next) => {
	try{
		console.log('hit client post route');

		 const desiredEmail = req.body.email.toLowerCase()
		 const desiredUsername = req.body.username.toLowerCase()
		 const desiredPassword = req.body.password

		 const clientExists = await Client.findOne({
		 	$or: [
			 	{email: desiredEmail},
			 	{username: desiredUsername}

		 	]
		 })

		 if(clientExists) {
		 	res.json('Client Already Exists')
		 } else {
		 	console.log('Client Does Not Exist')
		 	console.log('\n', req.body)
		 	// res.json(desiredEmail)
		 	// should be hashing password here
		 	 const createdClient = await Client.create({
		 	 	email: desiredEmail,
		 	 	username: desiredUsername,
		 	 	password: desiredPassword,
		 	 	firstName: req.body.firstName,
		 	 	lastName: req.body.lastName,
		 	 	recoveryQuestion: ["Where were you born?"],
		 	 	recoveryAnswer: req.body.recoveryAnswer,
		 	 })
		 	 res.json(createdClient)

		 }
		// console.log(req.body);
		// res.json(req.body.name + " is a good name")
	} catch(err) {
		// try creating custom error --> (console.error) or respond with if status ===... res.json(...)
		next(err)
	}
})

module.exports = router