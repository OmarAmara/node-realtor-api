const express = require('express')
const router = express.Router()
// models
const Realtor = require('../models/realtor')


/* -- Realtor ROUTES -- */
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


module.exports = router
