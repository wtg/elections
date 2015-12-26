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
    * Install Bower through Node Package Manager (npm) by running: `npm install -g bower`. *Note: bower is used for obtaining new libraries, but all existing bower dependencies are committed into the repository*

4. Install all necessary dependencies by running the following commands:
    * `> npm install`

5. If MySQL is installed on your computer, skip this step. Install MySQL, or MariaDB (the open-source equivalent).

6. Make a copy of `db.example.js` and name it `db.js`. Provide details about the database connection (host, port, username, password), as shown in the example.

7. Make a copy of `token.example.js` and name it `token.js`. Replace `<token>` with your Club Management System API Token. To obtain a key, access [CMS](https://cms.union.rpi.edu) or contact the Union Systems Administrators.

8. Run the server: `npm start`. This command will also create the database for the site if it doesn't currently exist.

9. Naviagte to `localhost:3000` in your browser, and pat yourself on the back, your instance is deployed.

## Credits

This project was created by the [Web Technologies Group](http://www.rpiwtg.com/).

### Developers 
* [Justin Etzine](http://github.com/justetz)
* [Erica Braunschweig](http://github.com/braune13)
* [Ylonka Machado](http://github.com/machay)
* [Rob Russo](http://github.com/rickrizzo)
