const express = require('express')
const router = express.Router()
// models
const Realtor = require('../models/realtor')


/* -- Realtor ROUTES -- */
// Register Realtor Route
router.post('/register', async (req, res, next) => {
	try {
		console.log('hit realtor register route');

		const desiredUsername = req.body.username.toLowerCase()
		const licenseNumber = req.body.brokerLicenseNumber
		const desiredPassword = req.body.password

		const realtorExists = await Realtor.findOne({
		 	$or: [
				{username: desiredUsername},
				{brokerLicenseNumber: licenseNumber}
		 	]
		})

		if(realtorExists) {
			// use req.body to keep casing
			res.json(`Username: ${req.body.username} or Realtor Brokerage License Already Exists. Try a different Username or check License Number`)
		} else {
		 	console.log('Realtor Does Not Exist')
		 	console.log('\n', req.body)
		 	// should be hashing password here
		 	const createdRealtor = await Realtor.create({
		 		// GREAT PLACE TO USE SPREAD OPERATOR?
		 		username: desiredUsername,
		 		brokerLicenseNumber: licenseNumber,
		 		password: desiredPassword,
		 		company: req.body.company,
				contactInfo: req.body.contactInfo,
				websiteURL: req.body.websiteURL
		 		// Should broker have recovery info like Client?
		 		// recoveryQuestion: [`req.body.recoveryQuestion`],
		 		// recoveryAnswer: req.body.recoveryAnswer,
		 	})

			res.json(createdRealtor)
		}
	} catch(err) {
		// create custom error
		next(err)
	}
})


// Login Realtor Route
router.post('/login', async (req, res, next) => {
	try {
		const realtor = await Realtor.findOne({ username: req.body.username.toLowerCase() })

		if(!realtor) {
			res.json("Invalid Username or Password")
		} else {
			// variable for bcrypt to compare to saves hashed password
			console.log(realtor)
			// const data = {realtorId: realtor.id, company: realtor.company, contactInfo: realtor.contactInfo, clients: realtor.clients, username: realtor.username, websiteURL: realtor.websiteURL, brokerLicenseNumber: realtor.brokerLicenseNumber}
			if(realtor.password === req.body.password) {
				// spread destructorer, but gives too much info
				// const { password, ...noPassword } = realtor console.log(noPassword)
				realtor.password = null
				req.session.loggedInUser = realtor
				res.json({
					data: realtor, 
					message: "Realtor Successfully Logged In!", 
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

// Logout Realtor Route
router.get('/logout', async (req, res, next) => {
	try {
		await req.session.destroy()

		res.json("Realtor Successfully Logged Out")
	} catch(err) {
		next(err)
	}
})


module.exports = router
