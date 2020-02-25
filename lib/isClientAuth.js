// prevents !client/ realtor from starting/ initiating a conversation chat thread.
module.exports = (req, res, next) => {
	if(!req.session.isClient) {
		res.status(401).json({
			data: "unauthorized",
			message: "Must be logged in as Client.",
			status: 401
		})
	} else {
		next()
	}
}