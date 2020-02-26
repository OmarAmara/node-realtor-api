const mongoose = require('mongoose')

const searchSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	zipcode: {
		type: String,
		minlength: 5,
		maxlength: 9,
		required: true
	},
	sqrft: {
		type: String,
		minlength: 4,
		maxlength: 7
	},
	upperPrice: {
		type: Number,
		// max price/ length
	},
	lowerPrice: {
		type: Number
	},
	client: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
		required: true
	},
	createdOn: {
		type: Date,
		default: Date.now(),
		required: true
	},
	// How To Implement timestamps, best method?
	lastModified: {
		type: Date
	}
})

const Search = mongoose.model('Search', searchSchema)

module.exports = Search
