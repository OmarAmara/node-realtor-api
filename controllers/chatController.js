const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')

// models
const Chat = require('../models/chat')


/* -- Chat ROUTES -- */

// Index Chat/ message Route
// Find a DRYer way here:
router.get('/', async (req, res, next) => {
	try {
		console.log(req.session.loggedInUser._id);

		if(req.session.isClient) {
			const conversations = await Chat.find({
				client: req.session.loggedInUser._id 
			}).populate('messages._id').populate('client').populate('realtor')
			//--> Front-end will have to loop all conversation and then messages!
			// remove sensitive information
			conversations.forEach((convo)=>{
				convo.client.password = null
				convo.client.recoveryQuestion = null
				convo.client.recoveryAnswer = null
				convo.realtor.password = null
			})
			res.json(`Found ${conversations.length} convos: ${conversations}`)
			// conversations.messages.forEach(message => console.log(message))
		} else {
			const conversations = await Chat.find({
				realtor: req.session.loggedInUser._id
			}).populate('messages').populate('client').populate('realtor')
			// remove sensitive information
			conversations.forEach((convo)=>{
				convo.client.password = null
				convo.client.recoveryQuestion = null
				convo.client.recoveryAnswer = null
				convo.realtor.password = null
			})
			res.json(`Found ${conversations.length} convos: ${conversations}`)	
		}
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

		if(foundChat.client.toString() === req.session.loggedInUser._id || foundChat.realtor.toString() === req.session.loggedInUser._id) {
			const loggedInUserMessage = {
				body: req.body.body,
				// test this with realtor loggedIn
				isSenderClient: req.session.isClient
			}

			foundChat.messages.push(loggedInUserMessage)
			await foundChat.save()
			res.json(
				`foundChat: ${foundChat}`
			)
		} else {
			res.json("Some logic went wrong.")
			console.log(foundChat.client + " " + req.session.loggedInUser._id);
		}

	} catch(err) {
		next(err)
	}
})


// Delete Chat Message Route
router.delete('/:chatId/:messageId', async (req, res, next) => {
	try {
		const foundChat = await Chat.findById(req.params.chatId)
		

	} catch(err) {
		next(err)
	}	
})



// Create Chat thread Route
router.post('/:realtorId', isClientAuth, async (req, res, next) => {
	try {
		const convoWithRealtor = await Chat.find({ $and: [{client: req.session.loggedInUser._id, realtor: req.params.realtorId}] }).populate('client').populate('realtor')
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
