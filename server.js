/* -- MODULES -- */
require('dotenv').config()
require('./db/db.js')
const express = require('express')
const cors = require('cors')
const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true
}
const app = express()
// models
const Client = require('./models/client')

// make Socket.io a different PORT
const PORT = process.env.PORT

// middleware modules
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const session = require('express-session')
// const bcrypt = require('bcrypt')


/* -- MIDDLEWARE -- */
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false })) // request.body
app.use(methodOverride('_method')) // necessary?
app.use(express.json()) // utilize json data from request.body
app.use(session({
	secret: process.env.SESSION_SECRET,
	// alternatives to save upon refresh? disadvantages?
	resave: false,
	// see note above^
	saveUninitialized: false
}))


/* -- SESSION DATA -- */
app.use((req, res, next) => {
	res.locals.loggedInUser = req.session.loggedInUser
	console.log('\nthis is loggedInUser in server: ', res.locals.loggedInUser)
	res.locals.isClient = req.session.isClient
	console.log('\nthis isClient in session: ', res.locals.isClient)
	next()
})


/* -- CONTROLLERS -- */
// Client
const clientAuthController = require('./controllers/clientAuthController')
app.use('/api/v1.0/clients', clientAuthController)
// Realtor
const realtorAuthController = require('./controllers/realtorAuthController')
app.use('/api/v1.0/realtors', realtorAuthController)
// Chat
const chatController = require('./controllers/chatController')
app.use('/api/v1.0/chats', chatController)
// Search
const searchController = require('./controllers/searchController')
app.use('/api/v1.0/searches', searchController)


/* -- ROUTES -- */
app.get('*', (req, res) => {
	res.status(404).json({
		data: {
			NotFound: "404 NOT FOUND"
		},
		message: "Did we mean to travel here, wonderer?",
		status: 404
	})	
})

/* -- LISTENER -- */
app.listen(PORT, () => {
	const d = new Date
	console.log(`\n${d} Server running on port: ${PORT}`);
})
