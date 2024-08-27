const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const loginApp = require('./index');
const addItemApp = require('./addItem');
const viewApp = require('./view');
const changePasswordApp = require('./changePassword');
const logoutApp = require('./logout');
const talswcsApp = require('./talswcsPro')
const talswcsViewApp = require('./talswcsView')

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount the individual apps
app.use(loginApp);
app.use(addItemApp);
app.use(viewApp);
app.use(changePasswordApp);
app.use(logoutApp);
app.use(talswcsApp);
app.use(talswcsViewApp);

// Error handling middleware
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
