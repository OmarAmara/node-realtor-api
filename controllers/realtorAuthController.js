const express = require('express')
const router = express.Router()
// models
const Realtor = require('../models/realtor')


/* -- Realtor ROUTES -- */

// Register Realtor Route
router.post('/register', async (req, res, next) => {
	try {
		const desiredEmail = req.body.email.toLowerCase()
		const licenseNumber = req.body.brokerLicenseNumber
		const desiredPassword = req.body.password

		const realtorExists = await Realtor.findOne({
		 	$or: [
				{email: desiredEmail},
				{brokerLicenseNumber: licenseNumber}
		 	]
		})

		if(realtorExists) {
			// use req.body to keep casing
			res.status(409).json({
				data: {},
				messgae: `Email: ${req.body.email} or Realtor Brokerage License Already Exists. Try a different Email or check License Number`,
				status: 409
			})
		} else {
		 	// should be hashing password here
		 	const createdRealtor = await Realtor.create({
		 		// GREAT PLACE TO USE SPREAD OPERATOR?
		 		// ^^ Look at create Client comments to see how this may be implemented.
				...req.body
		 		// Should broker have recovery info like Client?
		 		// recoveryQuestion: [req.body.recoveryQuestion],
		 		// recoveryAnswer: req.body.recoveryAnswer,
		 	})
		 	createdRealtor.password = null

			// session cookie
			req.session.loggedInUser = createdRealtor
			req.session.isClient = false

			res.status(201).json({
				data: createdRealtor,
				message: "Successfully Registered Account",
				status: 201
			})
		}
	} catch(err) {
		// create custom error
		next(err)
	}
})


// Login Realtor Route
router.post('/login', async (req, res, next) => {
	try {
		const realtor = await Realtor.findOne({ email: req.body.email.toLowerCase() })

		if(!realtor) {
			res.json("Invalid Email or Password")
		} else {
			// variable for bcrypt to compare to saves hashed password
			console.log(realtor)
			// const data = {realtorId: realtor.id, company: realtor.company, contactInfo: realtor.contactInfo, clients: realtor.clients, username: realtor.username, websiteURL: realtor.websiteURL, brokerLicenseNumber: realtor.brokerLicenseNumber}
			if(realtor.password === req.body.password) {
				// spread destructorer, but gives too much info
				// const { password, ...noPassword } = realtor console.log(noPassword)
				realtor.password = null

				// session cookie
				req.session.loggedInUser = realtor
				req.session.isClient = false

				res.status(200).json({
					data: realtor, 
					message: "Realtor Successfully Logged In!", 
					status: 200
				})
			} else {
				res.json("Invalid Email or Password")
			}
		}
	} catch(err) {
		next(err)
	}	
})

// Logout Realtor Route
router.get('/logout', async (req, res, next) => {
	try {
		await req.session.destroy()

		res.json("Realtor Successfully Logged Out")
	} catch(err) {
		next(err)
	}
})


// Realtor Index
router.get('/list', async (req, res, next) => {
	try {
		const realtors = await Realtor.find({})

		realtors.forEach((realtor) => {
			realtor.clients = null
			realtor.clientHistory = null
			realtor.password = null
		})

		res.status(200).json({
			data: realtors,
			message: `Retrieved ${realtors.length} Realtors.`,
			status: 200
		})

	} catch(err) {
		next(err)
	}
})


module.exports = router
