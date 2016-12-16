# S W A P
Directory
---------
* app - Folder for all back-end stuff
  * `model.js` - Schema for SWAP Users
  * `routes.js` - URI Routing
* public - Folder for all front-end stuff
  * js - Folder for JavaScript controllers
    * `app.js` - Angular Module that grabs other controllers and services
    * `checkinCtrl.js` - Check In Module and Controller
    * `checkoutCtrl.js` - Check Out Module and Controller
    * `gservice.js` - Google Maps Factory Server
    * `headerCtrl.js` - Header Module and Controller
  * partials - Folder for partial pages
    * `checkinForm.html` - Page for Check-in
    * `checkoutForm.html` - Page for Check-out
  * `index.html` - Main Page
  * `style.css` - Stylesheet
* `bower.json` - Bower Package to install bower_components
* `package.json` - NPM Package to install node_modules
* `server.js` - Initiate the server via node
