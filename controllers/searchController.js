const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')

// models
const Search = require('../models/search')
const Client = require('../models/client')


/* -- Search ROUTES -- */

// Create Search Route
router.post('/', isClientAuth, async (req, res, next) => {
	const createdSearch = await Search.create({
		// utilize spread operator?
		name: req.body.name,
		zipcode: req.body.zipcode,
		sqrft: req.body.sqrft,
		upperPrice: req.body.upperPrice,
		lowerPrice: req.body.lowerPrice,
		client: req.session.loggedInUser._id
		// ...req.params
	})
	console.log(createdSearch);

	res.status(200).json({
		data: createdSearch,
		message: "Successfully Created Search",
		status: 200
	})

})


// Search Index Route
router.get('/', async (req, res, next) => {
		
})
// Client and contracted Realtor needs a searchIndex
	// client can always view searchIndex, Client's Realtor can view the client's searchIndex
		// realtor: logic for Client id being in realtor's clients[] array.





module.exports = router
