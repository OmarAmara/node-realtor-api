const mongoose = require('mongoose')

const realtorSchema = mongoose.Schema({
	username: {
		type: String,
		trim: true,
		lowercase: true
	},
	company: {
		name: String,
		required: true,
		location: {
			street1: String,
			street2: String,
			city: String,
			state: String,
			zipcode: String,
			required: true
		},
		phone: {
			type: String,
			minlenght: 10,
			required: true
		}
	},
	contactInfo: {
		fullname: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		}
	},
	brokerLicenseNumber: {
		type: String,
		required: true
	},
	websiteURL: {
		type: String
	},
	// array of realtor's clients
	clients: [],
	password: {
		type: String,
		required: true
	}
})

const Realtor = mongoose.model('Realtor', realtorSchema)

module.exports = Realtor
