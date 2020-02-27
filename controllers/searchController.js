const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')
const isRealtorAuth = require('../lib/isRealtorAuth')

// models
const Search = require('../models/search')
const Client = require('../models/client')


/* -- Search ROUTES -- */

// Create Search Route
router.post('/', isClientAuth, async (req, res, next) => {
	try{
		const createdSearch = await Search.create({
			// spread operator with req.body. In case that optional paths are given.
			...req.body,
			client: req.session.loggedInUser._id
		})
		console.log(createdSearch);

		res.status(200).json({
			data: createdSearch,
			message: "Successfully Created Search",
			status: 200
		})
	} catch(err) {
		next(err)
	}
})


// Search Index Client Route
router.get('/index', isClientAuth, async (req, res, next) => {
	try{
		if(req.session.isClient === true) {
			const searchList = await Search.find({ client: req.session.loggedInUser._id })//.populate('client')

			res.status(200).json({
				data: searchList,
				message: `Successfully Retrieved ${searchList.length} Client Searches`,
				status: 200
			})
		} else {
			res.status(401).json({
				data: {
					Unauthorized: "Not Authorized To Perform Action"
				},
				message: "Must be logged in to view content.",
				status: 401
			})
		}
	} catch(err) {
		next(err)
	}
	
})


// Search Index Realtor's Client Route
router.post('/index/:clientId', isRealtorAuth, async (req, res, next) => {
	try{
		const foundClient = await Client.findById(req.params.clientId)
		console.log(foundClient);

		if(req.session.isClient === false && foundClient.currentRealtor[0].username === req.session.loggedInUser.username) {
			// 
			req.session.loggedInUser.clients.forEach(async(client, key) => {
				if(client._id === req.params.clientId) {
					const clientSearchList = await Search.find({ client: req.params.clientId })
					
					res.status(200).json({
						data: clientSearchList,
						message: `Successfully Retrieved ${clientSearchList.length} Searches from Client`,
						status: 200
					})
				}
			})
		} else {
			res.status(403).json({
				data: {
					Forbidden: "Unauthorized"
				},
				message: "Realtor Not Contracted With Client",
				status: 403 
			})
		}
	} catch(err) {
		next(err)
	}

})
// Client and contracted Realtor needs a searchIndex
	// client can always view searchIndex, Client's Realtor can view the client's searchIndex
		// realtor: logic for Client id being in realtor's clients[] array.





module.exports = router
