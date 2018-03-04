# RPI Elections [![Stories in Ready](https://badge.waffle.io/wtg/elections.svg?label=ready&title=Ready)](http://waffle.io/wtg/elections)

A modern platform for managing elections, designed specifically for GM Week and other student government elections at RPI.

## Features

* Simpler nominations
* Accessible candidate and party information
* Modern web goodness

## Deployment

This website is built in a modified MEAN stack (MariaDB, Express.js, Angular.js, and Node), and can be deployed using the following steps:

1. Clone this git repository by running the following command in a Git-enabled terminal:
    * `> git clone https://github.com/wtg/elections.git`

2. Navigate into the directory of the application:
    * `> cd elections`

3. If Node is installed on your computer, skip this step.
    * Install Node [here](https://nodejs.org/en/download/).

4. Install all necessary dependencies by running the following commands:
    * `> npm install`

5. If MySQL is installed on your computer, skip this step. Install MySQL or MariaDB (the open-source equivalent).

6. Make a copy of `devconfig.example.js` and name it `devconfig.js`. Provide details about the database connection (host, port, username, password), as shown in the example.
    * This could be completed in the terminal by running: `> cp devconfig.example.js devconfig.js`
    * Blank configuration variables are provided in the file.

8. Run the server: `npm run dev`. This command will also create the database for the site if it doesn't currently exist.

9. Navigate to `localhost:3000` in your browser, and pat yourself on the back—your instance is deployed.

## Credits

This project was created by the [Web Technologies Group](https://webtech.union.rpi.edu/).

### Developers

The core development team consists of:

* [Justin Etzine](http://github.com/justetz)
* [Jason Lee](http://github.com/jzblee)
* [Sidney Kochman](http://github.com/kochman)
* [Rob Russo](http://github.com/rickrizzo)

A list of all contributors can be found [here](https://github.com/wtg/elections/graphs/contributors).
