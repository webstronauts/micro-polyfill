const {parse} = require('url');
const polyfill = require('polyfill-service');

module.exports = async (req, res) => {
	const {query: {ua, minify = true}} = parse(req.url, true);

	const script = await polyfill.getPolyfillString({
		// Allow the user to override the user agent through the querystring,
		// otherwise fallback to the received header.
		uaString: ua || req.headers['user-agent'],
		// Use some sensible modern features.
		features: {es6: {}, 'default-3.6': {}},
		// Pass the minify option from the querystring through.
		minify: JSON.parse(minify) === true,
		// Just return all polyfills when the user agent is not recognized.
		unknown: 'polyfill'
	});

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/javascript;charset=utf-8');
	res.setHeader('Content-Length', script.length);

	if (process.env.NODE_ENV === 'production') {
		// Cache all front-end assets for at least a year.
		res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
	}

	res.write(script);
	res.end();
};
