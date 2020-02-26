// prevents !client/ realtor from starting/ initiating a conversation chat thread.
module.exports = (req, res, next) => {
	if(!req.session.isClient) {
		res.status(403).json({
			data: {
				Forbidden: "Unauthorized"
			},
			message: "User must be logged in with a Client account to perform action.",
			status: 403
		})
	} else {
		next()
	}
}