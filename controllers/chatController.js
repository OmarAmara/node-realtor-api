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
			res.json({
				data: conversations,
				message: `Retrieved ${conversations.length} Conversations`,
				status: 200
			}), 200
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
			res.json({
				data: conversations,
				message: `Retrieved ${conversations.length} Conversations`,
				status: 200
			}), 200
		}
	} catch(err) {
		next(err)
	}
})


// Create Message in chat Route
router.post('/messages/:chatId/', async (req, res, next) => {
	try {
		const foundChat = await Chat.findById(req.params.chatId)
		console.log('foundChat: ', foundChat);

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
			res.json("You must be a realtor?")
			console.log(foundChat.client + " " + req.session.loggedInUser._id);
		}

	} catch(err) {
		next(err)
	}
})


// Delete Chat Message Route
router.delete('/:chatId/:messageId', async (req, res, next) => {
	try {
		// ADD VERIFICATION THAT MESSAGE IS USER's
		const foundChat = await Chat.findById(req.params.chatId)
		if(req.session.isClient && req.session.loggedInUser._id === foundChat.client.toString()) {
			console.log("you are the client here!");
			console.log('foundChat before delete: ', foundChat);

			if(foundChat.messages.id(req.params.messageId).isSenderClient === true) {
				// foundChat.messages.id(req.params.messageId).remove()
				console.log('foundChat after delete message: ', foundChat);
				console.log('looks like we make it');
				// await foundChat.save()
			} else {			
				res.json({
					data: {},
					message: "You must be the message's owner to delete or modify.",
					status: 401
				}), 401
			}
		// foundChat.isSenderClient ? foundChat.messages.id(req.params.messageId).remove() : res.json('really now?')
		}
		
		if(req.session.isClient === false && req.session.loggedInUser._id === foundChat.realtor.toString()) {
			console.log('you are the realtor, buddy!');
			if(foundChat.messages.id(req.params.messageId).isSenderClient === false) {
				// foundChat.messages.id(req.params.messageId).remove()
				console.log('Looks like you made the cut realtor!');
			} else {
				res.json({
					data: {},
					message: "You must be the message's owner to delete or modify.",
					status: 401
				}), 401
			}
		} else(
			res.json({
				data: {},
				message: 'User id does not match with participant in chat.',
				status: 401
			}), 401
		)

		// chat.id: 5e54c73cddfb8d4bacfa0da1
		// message in chat: 5e555d49d42e73544079034e

		// res.json(foundChat)

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
