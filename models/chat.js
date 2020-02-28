const mongoose = require('mongoose')

// MAYBE chat should be contained within bot client and realtor schema as subdoc that gets updated on both ends?
// Currently reduces query time by chat hosting where messages live.
// Front-End note --> Chat name display: logic to display other account’s name as chatroom name.
const chatSchema = mongoose.Schema({
	client: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
		required: true
	},
	realtor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Realtor',
		required: true
	},
	messages: [{
		// To Hide Message, messages never actually deleted for Hx and reference.
		// Consider necessity of time archived? archived: {type:Bool, time:Date...}
		archived: {
			type: Boolean,
			default: false,
		},
		body: {
			type: String,
			minlength: 1,
			required: true
		},
		timeSent: {
			type: Date,
			default: Date.now(),
			required: true
		},
		// Can this be changed to id of sender?
		// Determines which User "Owns" the message
		isSenderClient: Boolean,
		// is this necessary for now?
		// delivered: Boolean,
		// Provides interactivity and notification logic.
		senderRead: {
			type: Boolean,
			default: false
			// add date? Way to validate to add date when value changes to true?
		},
		recipientRead: {
			type: Boolean,
			default: false
			// add date? Way to validate to add date when value changes to true?
		}
	}]
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat