const mongoose = require('mongoose')

const realtorSchema = mongoose.Schema({
	username: {
		type: String,
		trim: true,
		lowercase: true
	},
	company: {
		name: {
			type: String,
			required: true
		},
		location: {
			street1: {
				type: String
				//, required: true
			},
			street2: {
				type: String
			},
			city: {
				type: String,
				required: true
			},
			state: {
				type: String,
				required: true
			},
			zipcode: {
				type: String,
				required: true
			}
		},
		phone: {
			type: String,
			minlength: 10,
			required: true
		}
	},
	contactInfo: {
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			minlength: 10,
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
	// array of realtor's current clients
	clients: [],
	// resolved/ terminated client contracts/relationships
	clientHistory: [],
	password: {
		type: String,
		required: true
	}
})

const Realtor = mongoose.model('Realtor', realtorSchema)

module.exports = Realtor
