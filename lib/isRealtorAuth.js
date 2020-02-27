// prevents !realtor from accessing route
module.exports = (req, res, next) => {
	if(!req.session.loggedInUser.brokerLicenseNumber) {
		res.status(403).json({
			data: {
				Forbidden: "Unauthorized"
			},
			message: "User must be logged in with an authorized Realtor account to perform action.",
			status: 403
		})
	} else {
		next()
	}
}