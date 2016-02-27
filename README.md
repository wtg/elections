# RPI Elections
A modern platform for managing elections, designed specifically for GM Week and other student government elections at RPI.

## Features

* Simpler nominations
* Accessible candidate and party information
* Modern web goodness

## Deployment

This website is built in a modified MEAN stack (MySQL, Express.js, Angular.js, and Node.js), and can be deployed using the following steps:

1. Clone this git repository by running the following command in a Git-enabled terminal:
    * `> git clone https://github.com/wtg/elections.git`

2. Navigate into the directory of the application:
    * `> cd elections`

3. If NodeJS and Bower are both installed on your computer, skip this step.
    * Install NodeJS [here](https://nodejs.org/en/download/).
    * Install Bower through Node Package Manager (npm) by running: `npm install -g bower`. *Note: bower is used for obtaining new libraries, but all existing bower dependencies are committed into the repository.*

4. Install all necessary dependencies by running the following commands:
    * `> npm install`

5. If MySQL is installed on your computer, skip this step. Install MySQL or MariaDB (the open-source equivalent).

6. Make a copy of `config.example.js` and name it `config.js`. Provide details about the database connection (host, port, username, password), as shown in the example.
    * This could be completed in the terminal by running: `> cp config.example.js config.js`
    * Blank configuration variables are provided in the file.

8. Run the server: `npm start`. This command will also create the database for the site if it doesn't currently exist.

9. Navigate to `localhost:3000` in your browser, and pat yourself on the back, your instance is deployed.

## Credits

This project was created by the [Web Technologies Group](http://www.rpiwtg.com/).

### Developers

The core development team consists of:

* [Justin Etzine](http://github.com/justetz)
* [Rob Russo](http://github.com/rickrizzo)
* [Jason Lee](http://github.com/jzblee)

A list of all contributors can be found [here](https://github.com/wtg/elections/graphs/contributors).
