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
			res.json(`Username: ${req.body.username} or Email: ${req.body.email} Already Exists. Try a different Username or Email`)

		} else {
		 	// should be hashing password here
		 	const createdClient = await Client.create({
		 		// TEST THIS POSSIBILITY OF SPREAD:(comment out remainder of create body)
		 		//req.body.password, req.body.recoveryQuestion...req.body, password: desiredPassword, recoveryQuestion: [`${req.body.recoveryQuestion}`]
		 		// ^^ This or something similar should exclude pwd & recoveryQuestion from req.body, then add them
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
			req.session.loggedInUser = createdClient
			req.session.isClient = true

			res.status(201).json({
				data: createdClient,
				message: "Successfully Registered New Account",
				status: 201
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
		const client = await Client.findOne({ email: req.body.email }).populate('currentRealtor._id')//'currentRealtor.contactInfo._id')

		if(!client) {
			res.json("Invalid Username or Password")
		} else {
			// variable for bcrypt to compare to saves hashed password
			if(client.password === req.body.password) {
				client.password = null
				client.recoveryQuestion = null
				client.recoveryAnswer = null

				// create cookie
				req.session.loggedInUser = client
				req.session.isClient = true

				res.status(200).json({
					data: client, 
					message: "Client Successfully Logged In!", 
					status: 200
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
//** Stretch: Hitting this route will notify realtor and relationship will only commence once realtor confirms...
//** Also add so that changing realtor will place client(IN REALTOR USER) in Realtor's clientHistory
router.put('/contract/:realtorId', isClientAuth, async (req, res, next) => {
	try {
		const foundRealtor = await Realtor.findById(req.params.realtorId)

		// searches realtor's client list to see if loggedInUser is existing client
		let clientExists = false
		foundRealtor.clients.forEach((client) => {
			if (client.email === req.session.loggedInUser.email) {
				clientExists = true
			}
		})

		if(clientExists === false) {
			// hides sensitive information of client
			let client = {
				_id: req.session.loggedInUser._id,
				email: req.session.loggedInUser.email,
				firstName: req.session.loggedInUser.firstName,
				lastName: req.session.loggedInUser.lastName
			}

			foundRealtor.clients.push(client)
			await foundRealtor.save()

			// Hides sensitive data of realtor after save to not effect data, then realtor info saved into client.
			// This will be helpful to retrieve without querying entire DB.
			foundRealtor.password = null
			foundRealtor.clients = null
			foundRealtor.clientHistory = null
			const currentRealtor = {
				currentRealtor: foundRealtor
			}

			const updateCurrentClient = await Client.findById(req.session.loggedInUser._id)

			const addToRealtorHistory = {
				_id: foundRealtor._id,
				firstName: foundRealtor.firstName,
				lastName: foundRealtor.lastName,
				phoneNumber: foundRealtor.phoneNumber,
				email: foundRealtor.email
			}

			updateCurrentClient.realtorsWorkedWith.push(addToRealtorHistory)

			updateCurrentClient.currentRealtor = foundRealtor

			await updateCurrentClient.save()
			// prevents error if loggedInUser session is not updated and realtor route is hit again before logging back in.
			req.session.loggedInUser = updateCurrentClient

			res.status(201).json({
			 	data: foundRealtor,
			 	message: "Contracted New Realtor",
			 	status: 201
			})
		} else{
			res.status(400).json({
				data: {},
				message: "Client already contracted with Realtor",//`Client is already contracted with Realtor ${req.session.loggedInUser.currentRealtor[0].contactInfo.firstName + ` ` + req.session.loggedInUser.currentRealtor[0].contactInfo.lastName}. Are you trying to switch realtors? You can contact ${req.session.loggedInUser.currentRealtor[0].contactInfo.firstName} at ${req.session.loggedInUser.currentRealtor[0].contactInfo.email} or feel free to contact support at thereIs@noSupport.com`,
				status: 400
			})
		}
	} catch(err) {
		next(err)
	}
})


// Terminate Realtor/Client Relationship
router.put('/terminate/:clientId', async (req, res, next) => {
	try {
		const updatedClient = await Client.findById(req.params.clientId)
		// find realtor to update from client query. Helpful since client can only have one realtor.
		const updatedRealtor = await Realtor.findById(updatedClient.currentRealtor[0]._id.toString())

		// if logged in User is a Realtor and if retrieved client's realtor is logged in realtor
		if(req.session.isClient === false && updatedClient.currentRealtor[0]._id.toString() === req.session.loggedInUser._id) {

			// Loop through realtor's client list to check if logged in realtor is contracted with client
			const isAClient = req.session.loggedInUser.clients.some(client => client._id === req.params.clientId)

			// if client was found in realtor's client list
			if(isAClient) {

				// remove realtor from client
				updatedClient.currentRealtor = []

				// remove client from realtor's clients list
				updatedRealtor.clients.forEach((client, key) => {
					if(client._id === req.params.clientId) {

						// removes object in this position of array
						updatedRealtor.clients.splice(key, 1)
						updatedRealtor.clientHistory.push(client)
					}
				})

				await updatedClient.save()
				await updatedRealtor.save()

				// update session
				req.session.loggedInUser = updatedRealtor

				updatedClient.password = null
				updatedClient.recoveryQuestion = null
				updatedClient.recoveryQuestion = null
				res.status(200).json({
					data: {
						terminatedClient: updatedClient
					},
					message: "Terminated Contract with Client.",
					status: 200
				})
			} else {
				res.status(404).json({
					data: {
						NotFound: "Resource Does Not Exist"
					},
					message: "Cannot find Client in Realtor's Client List",
					status: 404
				})
			}

		// If loggedInUser is the Client terminating contract	
		} else if(req.session.loggedInUser._id === req.params.clientId) {
			updatedClient.currentRealtor = []

			// remove client from realtor's clients list
			updatedRealtor.clients.forEach((client, key) => {
				if(client._id === req.params.clientId) {

					// removes object in this position of array
					updatedRealtor.clients.splice(key, 1)
					updatedRealtor.clientHistory.push(client)
				}
			})

			await updatedClient.save()
			await updatedRealtor.save()

			req.session.loggedInUser = updatedClient

			res.status(200).json({
				data: {
					terminatedRealtorContactInfo: {
						firstName: updatedRealtor.firstName,
						lastName: updatedRealtor.lastName,
						phoneNumber: updatedRealtor.phoneNumber, 
						email: updatedRealtor.email
					}
				},
				message: "Terminated Contract with Realtor.",
				status: 200
			})
		} else {
			res.status(403).json({
				data: {
					Forbidden: "User is not contracted with provided User id."
				},
				message: "Must be participant in contract to make changes. Perhaps you previously terminated relationship.",
				status: 401
			})
		}
	} catch(err) {
		next(err)
	}
})



module.exports = router
