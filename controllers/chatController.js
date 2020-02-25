const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')

// models
const Chat = require('../models/chat')


/* -- Chat ROUTES -- */
router.get('/', async (req, res, next) => {
	try {
		console.log(req.session.loggedInUser._id);
		const conversations = await Chat.find({client: req.session.loggedInUser._id})
		res.json(`Found ${conversations.length} convos: ${conversations}`)	
	} catch(err) {
		next(err)
	}
})


// Create Message Route
router.post('/messages/:chatId/', async (req, res, next) => {
	try {
		const foundChat = await Chat.findById(req.params.chatId)
		console.log('foundChat: ', foundChat);
		console.log(foundChat.client);

		if(foundChat.client.toString() === req.session.loggedInUser._id) {
			res.json(
				"I work, now add message to story id, use boolean!"
			)
		} else {
			res.json("Some logic went wrong.")
			console.log(foundChat.client + " " + req.session.loggedInUser._id);
		}

	} catch(err) {
		next(err)
	}
})



// Create Chat thread Route
router.post('/:realtorId', isClientAuth, async (req, res, next) => {
	try {
		console.log(req.body);
		const convoWithRealtor = await Chat.find({ $and: [{client: req.session.loggedInUser._id, realtor: req.params.realtorId}] })
		console.log(convoWithRealtor);
		if(convoWithRealtor.length < 1) {
			// res.json('lets create a convo!')

			const createdChat = await Chat.create({
				client: req.session.loggedInUser._id,
				realtor: req.params.realtorId,
				messages: []
			})
			console.log(createdChat);
			res.json(
				createdChat
			)
		} else {
			res.json(`You have an existing thread with this Realtor!: ${convoWithRealtor.messages}`)
		}
	} catch(err) {
		next(err)
	}
})


module.exports = router
