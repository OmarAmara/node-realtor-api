const express = require('express')
const router = express.Router()
// custom middleware
const isClientAuth = require('../lib/isClientAuth')

// models
const Chat = require('../models/chat')


/* -- Chat ROUTES -- */

// Index Chat/ message Route
// Find a DRYer way here:
// Why do message id's return as null?
// try different populations. like populate('messages.id'), ...
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
			res.status(200).json({
				data: conversations,
				message: `Retrieved ${conversations.length} Conversations`,
				status: 200
			})
			// conversations.messages.forEach(message => console.log(message))
		} else {
			const conversations = await Chat.find({
				realtor: req.session.loggedInUser._id
			}).populate('messages._id').populate('client').populate('realtor')
			// remove sensitive information
			conversations.forEach((convo)=>{
				convo.client.password = null
				convo.client.recoveryQuestion = null
				convo.client.recoveryAnswer = null
				convo.realtor.password = null
			})
			res.status(200).json({
				data: conversations,
				message: `Retrieved ${conversations.length} Conversations`,
				status: 200
			})
		}
	} catch(err) {
		next(err)
	}
})


// Create Message in chat Route
router.post('/messages/:chatId', async (req, res, next) => {
	try {
		const foundChat = await Chat.findById(req.params.chatId)
		console.log('foundChat: ', foundChat);

		if(foundChat.client.toString() === req.session.loggedInUser._id || foundChat.realtor.toString() === req.session.loggedInUser._id) {
			const loggedInUserMessage = {
				body: req.body.body,
				isSenderClient: req.session.isClient
			}

			foundChat.messages.push(loggedInUserMessage)
			await foundChat.save()
			res.status(201).json({
				data: foundChat,
				message: "Successfully created message in chat thread.",
				status: 201
			})
		} else {
			res.json("Hey are you a realtor? Must be a client to do this!")
			console.log(foundChat.client + " " + req.session.loggedInUser._id);
		}

	} catch(err) {
		next(err)
	}
})


// Delete Message (in Chat) Route
router.delete('/:chatId/:messageId', async (req, res, next) => {
	try {
		const foundChat = await Chat.findById(req.params.chatId)

		// check if user attempting to delete is the client
		if(req.session.isClient && req.session.loggedInUser._id === foundChat.client.toString()) {

			// Insures that participant can only delete their message and not other participant
			if(foundChat.messages.id(req.params.messageId).isSenderClient === true) {
				foundChat.messages.id(req.params.messageId).remove()

				await foundChat.save()
				res.status(200).json({
					data: foundChat,
					message: "Successfully deleted message",
					status: 200
				})
			}
		// simplify to ternary?: foundChat.isSenderClient ? foundChat.messages.id(req.params.messageId).remove() : res.json('really now?')

		// check if user attempting to delete is the realtor	
		} else if(req.session.isClient === false && req.session.loggedInUser._id === foundChat.realtor.toString()) {

			// Insures that participant can only delete their message and not other participant
			if(foundChat.messages.id(req.params.messageId).isSenderClient === false) {
				foundChat.messages.id(req.params.messageId).remove()

				await foundChat.save()
				res.status(200).json({
					data: foundChat,
					message: "Successfully deleted message",
					status: 200
				})
			} else {
				res.status(405).json({
					data: {},
					message: "Method Not Allowed. You must be the message's owner to delete or modify.",
					status: 405
				})
			}
		} else(
			res.status(405).json({
				data: {},
				message: 'Method Not Allowed. User id in message does not match with participant in chat. You must be the ownner of the message you are trying to delete.',
				status: 405
			})
		)

	} catch(err) {
		next(err)
	}	
})


// Create Chat thread Route (only clients can start a conversation)
router.post('/:realtorId', isClientAuth, async (req, res, next) => {
	try {
		const convoWithRealtor = await Chat.find({ $and: [{client: req.session.loggedInUser._id, realtor: req.params.realtorId}] }).populate('client').populate('realtor')
		console.log(convoWithRealtor);
		if(convoWithRealtor.length < 1) {

			const createdChat = await Chat.create({
				client: req.session.loggedInUser._id,
				realtor: req.params.realtorId,
				messages: []
			})
			console.log(createdChat);
			res.status(201).json({
				data: createdChat,
				message: "Successfully Started New Chat Thread",
				status: 201
			})
		} else {
			res.json(`You have an existing thread with this Realtor!: ${convoWithRealtor.messages}`)
		}
	} catch(err) {
		next(err)
	}
})


module.exports = router
