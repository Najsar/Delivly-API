const express = require('express');
const router = express.Router();
var bodyParser = require("body-parser");
var func = require('../func/main');
var users = require('../objects/user');
var log = require('../func/log');
const config = require('../config/config.json');
var cookieParser = require('cookie-parser');
var cors = require('cors');

var whitelist = ['http://localhost', 'https://delivly.com', 'http://delivly.com', 'http://localhost:3010', 'ws://localhost:3010', 'wss://localhost:3010', 'ws://delivly.com', 'wss://delivly.com']
var corsOptions = {
    origin: function (origin, callback) {
        if(!origin) {
            callback(null, true);
            log.log('CORS', "Allowed by CORS: local app", 4, 1);
        }
        else if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
          log.log('CORS', "Allowed by CORS: " + origin, 4, 1);
        } else {
          callback(new Error("Not allowed by CORS"));
          log.log('CORS', "Not allowed by CORS: " + origin, 4, 2);
        }
    },
    optionsSuccessStatus: 200,
    credentials: true
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(cors(corsOptions));

router.use((req, res, next) => {
    log.log('ROUTER', "URL: "+ req.url + " TYPE: " + req.method, 4);
    next();
});

router.get('/', (req, res) => {
    res.json({status: 1, data: 'Hits main page'});
});
router.get('/get_ver/', (req, res) => {
    res.json({status: 1, data: config.version});
});

router.post('/login/', async (req, res) => {
    if(!req.body.nick || !req.body.pass) {
        res.json({status: 0, data: 'No data'});
        log.log('LOGIN', "No data has been send to server", 4, 3);
    }
    else {
        var user = new users();
        var user_name = req.body.nick;
        var user_pass = req.body.pass;
        if( req.cookies.userLogin != undefined ) {
            var status = await user.sessionLogin(req.cookies.userLogin);
            if(status == 0) {
                res.clearCookie('userLogin');
                var status = await user.dataLogin(user_name, user_pass);
                if(status == 1) {
                    res.cookie("userLogin", user.session, {maxAge: (1000*60*60*24), domain: 'delivly.com', path: '/', secure: true, SameSite: 'None' } );
                    res.cookie("userLogin", user.session, { maxAge: (1000*60*60*24) } );
                    log.log('LOGIN', "Login success | USER ID: " + user.id, 4, 1); 
                    res.json({ status: 1, data: 'Login success' });
                }
            }
            else {
                log.log('LOGIN', "User already login | USER ID: " + user.id, 4, 3);
                res.json({status: 0, error: 'User already login', data: 0 });
            }
        }
        else {
            var login_status = await user.dataLogin(user_name, user_pass);
            if(login_status == 1) {
                res.cookie("userLogin", user.session, {maxAge: (1000*60*60*24), domain: 'delivly.com', path: '/',  secure: true, SameSite: 'None' } ); 
                res.cookie("userLogin", user.session, { maxAge: (1000*60*60*24) } );
                log.log('LOGIN', "Login success | USER ID: " + user.id, 4, 1);
                res.json( {status: 1, data: 'Login success'} );
            }
            else {
                log.log('LOGIN', "Login failed, wrong pass or nick", 4, 3);
                res.json( { status: 0, error: 'Login failed', data: 0 } );
            }
        }
    }
});
router.post('/gen_pass/', async (req, res) => {
    var hash = await func.genPass(req.body.pass);
    res.json({status:1, data: hash});
});
router.post('/register/', async (req, res) => {
    if(req.body.nick == '' || req.body.pass == '' ||req.body.email == '') res.json({status:0, data: status.data})
    else {
        var user = new users();
        var status = await user.register( req.body.nick, req.body.pass, req.body.email );
        if(!status) res.json({status:0, error: 'Register failed', data: 0});
        else res.json({status:1, data: 'User registered successfull'});
    }
});
router.get('/activate/:user_id/:token', async (req, res) => {
    var user = new users();
    var status = await user.activate(req.params.user_id, req.params.token);
    if(!status) res.json({status:0, error: 'Error While try to activate', data: 0});
    else res.json({status:1, data: 'Activate successfull'});
});

router.use('/secure/', require("./api"));

router.use('/uploads/', express.static('uploads'));

router.use('*', (req, res) => {
    log.log('ROUTER', "PAGE NOT FOUND: URL: "+ req.originalUrl + " TYPE: " + req.method, 4, 3);
    res.json({status: 0,error: 404, data: 'Page not found'});
});

module.exports = router;