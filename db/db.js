const mongoose = require('mongoose')

// DB MODELS --


const mongodbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realtor-app'

mongoose.connect(mongodbURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
})

mongoose.connection.on('connected', () => {
	console.log(`SUCCESSFULLY Connected to DATABASE`);
})

mongoose.connection.on('disconnected', () => {
	console.log(`DISCONNECTED from DATABASE`);
})

mongoose.connection.on('error', (err) => {
	console.log(`ERROR with DATABASE Connection: \n${err}`);
})

