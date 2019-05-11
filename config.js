/**
* This file contains specifications for configurations needed to properly run the Elections service.
* NOTE: please do not commit this file to any public repo. It is included in the current .gitignore.
*
* To modify the configuration for development, either copy devconfig.example.js to devconfig.js and modify as necessary, or set the environment variables below as necessary.
*/

try {
  module.exports = require('./devconfig.js');
} catch(e) {
  module.exports = {
    db: process.env.DATABASE_URL,
    db_name: process.env.DB_NAME,
    cms: process.env.CMS_API_TOKEN,
    service_url: process.env.SERVICE_URL,
    session_secret: process.env.SESSION_SECRET,
    cas_dev_mode: false,
    cas_dev_mode_user: '',
    elecnoms_url: process.env.ELECNOMS_URL,
    email: {
      username: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
      host: process.env.EMAIL_HOST,
      secure: true,
      port: 465
    }
  };
}
