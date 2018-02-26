var express = require('express'),
router = express.Router(),
config = require('../config.js'),
proxy = require('http-proxy-middleware');

// work around bodyParser issue https://github.com/chimurai/http-proxy-middleware/issues/40
const restream = function(proxyReq, req, res, options) {
    if (req.body) {
        let bodyData = JSON.stringify(req.body);
        // in case content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
}

// proxy to elecnoms
elecnomsProxy = proxy('/api/nominations', {
  target: config.elecnoms_url,
  pathRewrite: {'^/api/nominations': ''},
  onProxyReq: restream,
});
router.use(elecnomsProxy);

module.exports = router;
