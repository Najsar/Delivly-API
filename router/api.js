const express = require('express');
const api = express.Router();
var bodyParser = require("body-parser");
var func = require('../func/main');
var log = require('../func/log');
var cookieParser = require('cookie-parser');
var users = require('../objects/user');
const fileUpload = require('express-fileupload');

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));
api.use(cookieParser());

var user = new users();

api.use( async (req, res, next) => {
    log.log('ROUTER', "Used API middleware", 4);
    if( req.cookies.userLogin != undefined ) {
        var status = await user.sessionLogin(req.cookies.userLogin);
        if(status == 0) {
            res.clearCookie('userLogin');
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress ||(req.connection.socket ? req.connection.socket.remoteAddress : null);
            log.log('ROUTER', "Saved ip address: " + ip, 4, 2);
            login = 0;
        }
        else {
            login = user.id;
        }
    }
    else {
        login = 0;
    }

    if(login == 0) {
        log.log('ROUTER', "User not authenticated, stop script", 4, 2);
        res.json({status:0, data: 0, error: 'User not login'});
    }
    else {
        log.log('ROUTER', "User authenticated, id: " + login + ", executing script", 4, 1);
        next();
    }
});
api.use(fileUpload({
    createParentPath: true
}));
api.use('/logs/', express.static('./logs/'));

api.get('/get_user/', async (req, res) => {
    var user = new users();
    var status = await user.sessionLogin(req.cookies.userLogin);
    res.json({status: 1, data: user});
});
api.get('/logout/', async (req, res) => {
    res.cookie("userLogin", '', {expires: new Date(0), domain: 'delivly.com', path: '/', secure: true, SameSite: 'None' } );
    res.cookie("userLogin", '', { expires: new Date(0) } );
    res.json({status: 1, data: 'Logout success'});
});

api.post('/gen_pass/', async (req, res) => {
    var hash = await func.genPass(req.body.pass);
    res.json({status:1, data: hash});
});
api.post('/change_avatar/', async (req, res) => {
    try {
        if(!req.files) {
            res.json({status:0, data: 'Avatar not updated'});
        } else {
            let avatar = req.files.avatar;
            var new_filename = user.nick + '.' + (avatar.name).split('.').pop();
            avatar.mv('./uploads/' + new_filename);
            user.update('avatar', new_filename);
            res.json({status:1, data: 'Avatar updated' });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = api;