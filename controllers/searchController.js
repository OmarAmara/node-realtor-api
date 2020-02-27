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

		res.status(201).json({
			data: createdSearch,
			message: "Successfully Created Search",
			status: 201
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


// Delete Search Route
router.delete('/:id', isClientAuth, async (req, res, next) => {
	try{
		const verifySearch = await Search.findById(req.params.id)

		if(req.session.loggedInUser._id === verifySearch.client.toString()) {
			// Utilize first query above to verify account, then second query below to remove.
			const deleteVerifiedSearch = await Search.findByIdAndRemove(req.params.id)
			
			// verifySearch.remove(verifySearch).update()
			// verifySearch.remove(verifySearch).save()
			// Side Note: Only Directly update data (findByIdAndUpdate, remove...) that can be changed from more than one source or account.
			// .save() or similar, .update() loads data to client side then performs updated action, may cause an error if someone else edits the same data...

			res.status(200).json({
				data: {deleteVerifiedSearch},
				message: "Successfully deleted Client's Search",
				status: 200
			})
		} else {
			res.status(405).json({
				data: {},
				message: "Method Not Allowed.",
				status: 405
			})
		}
	} catch(err) {
		next(err)
	}
})


// Update Search Route
router.put('/:id', isClientAuth, async (req, res, next) => {
	try{
		// const findSearch = await findByIdAndUpdate(req.params.id)


	} catch(err) {
		next(err)
	}
})



module.exports = router
