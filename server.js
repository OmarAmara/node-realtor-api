/* -- MODULES -- */
require('dotenv').config()
require('./db/db.js')
const express = require('express')
const app = express()
// models
const Client = require('./models/client')

// make Socket.io a different PORT
const PORT = process.env.PORT

// middleware modules
const methodOverride = require('method-override')
const bodyParser = require('body-parser')


/* -- MIDDLEWARE -- */
app.use(bodyParser.urlencoded({ extended: false })) // request.body
app.use(methodOverride('_method')) // necessary?
app.use(express.json()) // utilize json data from request.body


/* -- CONTROLLERS -- */
const clientAuthController = require('./controllers/clientAuthController')
app.use('/api/v1.0/clients', clientAuthController)


/* -- ROUTES -- */
app.get('*', (req, res) => {
	res.status(404).send('404 NOT FOUND')	
})

/* -- LISTENER -- */
app.listen(PORT, () => {
	const d = new Date
	console.log(`\n${d} Server running on port: ${PORT}`);
})
