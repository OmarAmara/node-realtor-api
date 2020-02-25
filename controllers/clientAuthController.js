const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')

// models
const Client = require('../models/client')
const Realtor = require('../models/realtor')


/* -- Client ROUTES -- */
// test route
router.get('/', async (req, res, next) => {
	res.json(data={ greet: 'hello' })
})

// Register Client Route
router.post('/register', async (req, res, next) => {
	try {
		console.log('hit client register route');

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
		 	// deprecated warning
		 	// res.json(
		 	// 	data={"taken" : "Client Already Exists"},
		 	// 	status=200 
		 	// )
		 	// use req.body to keep casing
			res.json(`Username: ${req.body.username} or Email: ${req.body.email} Already Exists. Try a different Username or Email`)
		} else {
		 	console.log('Client Does Not Exist')
		 	console.log('\n', req.body)
		 	// should be hashing password here
		 	const createdClient = await Client.create({
		 		email: desiredEmail,
		 		username: desiredUsername,
		 		password: desiredPassword,
		 		firstName: req.body.firstName,
		 		lastName: req.body.lastName,
		 		// this portion will change when front end utilizes drop down of three options in model.
		 		recoveryQuestion: [`${req.body.recoveryQuestion}`],
		 		recoveryAnswer: req.body.recoveryAnswer,
		 	})
		 	createdClient.password = null
			createdClient.recoveryQuestion = null
			createdClient.recoveryAnswer = null
	 		// create cookie
			req.session.loggedInUser = client
			req.session.isClient = true

			res.status(200).json({
				data: createdClient,
				message: "Successfully Registered New Account",
				status: 200
			})
		}
	} catch(err) {
		// try creating custom error --> (console.error) or respond with if status ===... res.json(...)
		next(err)
	}
})

// Login Client Route
router.post('/login', async (req, res, next) => {
	try {
		const client = await Client.findOne({ email: req.body.email })

		if(!client) {
			res.json("Invalid Username or Password")
		} else {
			// variable for bcrypt to compare to saves hashed password
			console.log(client)
			if(client.password === req.body.password) {
				client.password = null
				client.recoveryQuestion = null
				client.recoveryAnswer = null

				// create cookie
				req.session.loggedInUser = client
				req.session.isClient = true

				res.status(201).json({
					data: client, 
					message: "Client Successfully Logged In!", 
					status: 201
				})
			} else {
				res.json("Invalid Username or Password")
			}
		}
	} catch(err) {
		next(err)
	}
})

// Logout Client Route
router.get('/logout', async (req, res, next) => {
	try {
		await req.session.destroy()

		res.json("Client Successfully Logged Out")
	} catch(err) {
		next(err)
	}
})


// Contract Realtor/Client Relationship
//** In future, Make this so hitting route will notify realtor and relationship will only commence once realtor confirms...
router.put('/contract/:realtorId', isClientAuth, async (req, res, next) => {
	try {

		const foundRealtor = await Realtor.findById(req.params.realtorId)


		if(req.session.loggedInUser.currentRealtor !== foundRealtor) {

			let client = req.session.loggedInUser
			client.password = null
			client.recoveryAnswer = null
			client.recoveryQuestion = null
			console.log(client)

			foundRealtor.clients.push(client)
			await foundRealtor.save()
			console.log(foundRealtor)
			// ^^ Everything above functions as intended.

			const currentRealtor = {
				currentRealtor: foundRealtor
			}

			const updateCurrentClient = await Client.findByIdAndUpdate(req.session.loggedInUser._id, currentRealtor)
			console.log(updateCurrentClient)
		}


	} catch(err) {
		next(err)
	}
})





module.exports = router
