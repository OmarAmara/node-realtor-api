const mongoose = require('mongoose')

// MAYBE chat should be contained within bot client and realtor schema as subdoc that gets updated on both ends?
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
		body: {
			type: String,
			minlength: 1,
			required: true
		},
		timeSent: {
			type: Date,
			default: Date.now(),
		},
		isSenderClient: Boolean
		//consider the following:
		//, delivered: Boolean,
		//read: Boolean
	}]

})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat