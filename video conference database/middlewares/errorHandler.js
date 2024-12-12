const errorHandler = (err, req, res, next) => {
	console.log(err)
	if (err.name == "SequelizeValidationError") {
		const message = err.errors[0].message
		res.status(400).json({ statusCode: 400, name: "Bad request", message })
	} else if (err.name == "Required") res.status(400).json({ statusCode: 400, message: err.message })
	else if (err.name == "Bad_Request") res.status(400).json({ status: false, statusCode: 400, message: err.message })
	else if (err.name == "Exist") res.status(409).json({ statusCode: 400, message: err.message })
	// else if (err.name == "JsonWebTokenError") res.status(400).json({ statusCode: 400, message: "Invalid User" })
	else if (err.name == "JsonWebTokenError") res.status(404).json({ statusCode: 404, message: "Photo not found" })
	else if (err.name == "Invalid_User") res.status(404).json({ statusCode: 404, message: err.message })
	else if (err.name == "SequelizeDatabaseError") res.status(400).json({ statusCode: 400, message: "Category is empty or image url is too long" })
	else if (err.name == "SequelizeUniqueConstraintError") res.status(400).json({ statusCode: 400, message: err.message })
	else if (err.name == "Invalid") res.status(401).json({ statusCode: 401, message: err.message })
	else if (err.name == "Not_Found") res.status(404).json({ statusCode: 404, message: err.message })
	else if (err.name == "Invalid token") res.render("pages/not_found/index")
	else if (err.name == "SyntaxError") res.status(404).json({ statusCode: 404, message: "Photo not found" })
	// else if (err.name == "Invalid token") res.status(401).json({ statusCode: 404, message: err.message })
	else if (err.name == "previlege") res.status(403).json({ statusCode: 403, message: err.message })
	else res.status(500).json({ statusCode: 500, message: "Internal Server Error", err })
}

module.exports = errorHandler
