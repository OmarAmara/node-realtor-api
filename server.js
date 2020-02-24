// MODULES --
require('dotenv').config()
require('./db/db.js')
const express = require('express')
const app = express()

// make Socket.io a different PORT
const PORT = process.env.PORT


// MIDDLEWARE --


// CONTROLLERS --



// ROUTES --


// LISTENER --

app.listen(PORT, () => {
	const d = new Date
	console.log(`\n${d} Server running on port: ${PORT}`);
})


