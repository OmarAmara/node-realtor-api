const mongoose = require('mongoose')

const clientSchema = mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	// deploy with min/maxlength validators
	username: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	recoveryQuestion: {
		type: [String],
		enum: [
			"Where were you born?",
			"What is your mother's maiden name?",
			"Which elementary Schoold did you graduate from?"
		],
		required: true
	},
	recoveryAnswer: {
		type: String,
		required: true
	},
	createdOn: {
		type: Date,
		default: Date.now(),
		required: true
	},
	hometown: {
		type: String
	},
	zipcode: {
		type: String,
		minlength: 5,
		maxlength: 9
	},
	// this will hold id of current realtor. Can only have 1 realtor at a time.
	currentRealtor: [],
	// this will hold history of realtors.
	realtorsWorkedWith: []
})


const Client = mongoose.model('Client', clientSchema)

module.exports = Client