const express = require('express');
const router = express.Router();
const csp = require('helmet-csp');
const functions = require('./functions.js');

router.post('/csp-report', (req, res) => {
  functions.logger.warn('CSP header violation', req.body['csp-report']);
  res.status(204).end();
});

router.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "*", "https://www.google-analytics.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    styleSrc: ["'self'", "https://fonts.googleapis.com"],
    scriptSrc: ["'self'", "https://www.google-analytics.com"],
    objectSrc: ["'none'"],
    connectSrc: ["'self'", "https://www.google-analytics.com"],
    reportUri: '/csp-report',
  },
  reportOnly: true,
}));

module.exports = router;
