// MODULES --
require('dotenv').config()
require('./db/db.js')
const express = require('express')
const app = express()

// make Socket.io a different PORT
const PORT = process.env.PORT


// MIDDLEWARE --


// CONTROLLERS --
const clientAuthController = require('./controllers/clientAuthController')
app.use('/api/v1.0/clients', clientAuthController)


// ROUTES --
app.get('*', (req, res) => {
	res.status(404).send('404 NOT FOUND')	
})

// LISTENER --

app.listen(PORT, () => {
	const d = new Date
	console.log(`\n${d} Server running on port: ${PORT}`);
})


