var express = require('express'),
    router = express.Router(),
    mysql = require('mysql'),
    RSS = require('rss'),
    functions = require('../functions.js'),
    config = require('../config.js');

router.get('/events', function (req, res) {
    var connection = functions.dbConnect(res);

    var feed = new RSS({
        title: 'RPI Elections: Events',
        description: 'Upcoming events for the election',
        feed_url: config.service_url + '/feeds/events',
        site_url: config.service_url,
        link: config.service_url + '/events',
        language: 'en'
    });

    connection.query('SELECT * FROM `events` WHERE date >= CURDATE() ORDER BY date, start, end', function (err, result) {
        if(err) {
            res.sendStatus(500);
            return;
        }

        for(var i = 0; i < result.length; i++) {
            var description = "Scheduled for " + result[i].date;

            if(!result[i].end) {
                description += " at " + result[i].start;
            } else {
                description += " from " + result[i].start + " to " + result[i].end;
            }

            description += ": " + result[i].description,

            feed.item({
                title: result[i].title,
                description: description,
                url: config.service_url + '/events',
                guid: result[i].event_id,
                date: result[i].date.toISOString().substr(0, 10) + 'T' + result[i].start.substr(0, 8) + '.000Z'
            });
        }

        res.set('Content-Type', 'application/rss+xml');
        res.send(feed.xml());
    });
});

module.exports = router;
