const {parse} = require('url');
const polyfill = require('polyfill-service');

module.exports = async (req, res) => {
	const {query: {ua}} = parse(req.url, true);

	const script = await polyfill.getPolyfillString({
		// Allow the user to override the user agent through the querystring,
		// otherwise fallback to the received header.
		uaString: ua || req.headers['user-agent'],
		// Use some sensible modern features.
		features: {es6: {}, 'default-3.6': {}},
		// Just return all polyfills when the user agent is not recognized.
		unknown: 'polyfill'
	});

	res.setHeader('Content-Type', 'application/javascript;charset=utf-8');
	res.setHeader('Content-Length', script.length);

	// Cache all front-end assets for at least a year.
	res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

	res.write(script);
	res.end();
};
