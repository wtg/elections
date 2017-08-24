/**
 * This file contains specifications for configurations needed to properly run the Elections service.
 * NOTE: please do not commit this file to any public repo. It is included in the current .gitignore.
 *
 * Configuration details:
 *  - db: an object containing details on the database connection. For a port other than 3306, add a port attribute
 *  with the integer value for your port.
 *  - db_name: this is the desired name of the database in your MySQL server. Since the db object is used before the
 *  database has been created, it's important that the db_name is separate from the db object.
 *  - cms: the RPI Club Management System API Token issued for the application. To obtain a token, access
 *  https://cms.union.rpi.edu or contact the Rensselaer Union Systems Administrators.
 *  - service_url: the url (and port, if not 80) that the user is accessing your app from; used by the RPI Central
 *  Authentication System
 *  - email: settings required to connect to an SMTP relay
 */

module.exports = {
    db: {
        host     : 'localhost',
        user     : 'root',
        password : ''
    },
    db_name: 'rpielections',
    cms: '',
    service_url: 'http://localhost:3000',
    cas_dev_mode: false,
    cas_dev_mode_user: '',
    email: {
        username: '',
        password: '',
        from: 'Elections Website <rne@rpi.edu>',
        host: '',
        secure: true,
        port: 465
    }
};
