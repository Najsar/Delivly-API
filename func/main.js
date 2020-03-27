const bcrypt = require("bcryptjs");
const log = require('./log');
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "delivly.com",
    port: 587,
    secure: false,
    auth: {
        user: 'noreply@delivly.com',
        pass: 'X2nXnKZvHY'
    }
});
function gen(length, type=0) {
    var result           = '';
    switch(type) {
        case 0: var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; break;
        case 1: var characters = '0123456789'; break;
        case 2: var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; break;
        case 3: var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; break;
    }
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 function genPass(pass) {
    log.log('genPass', "Generating hash...", 4, 1);
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pass, salt);
    log.log('genPass', "HASH: " + hash, 4, 1);
    return hash;
 }
 function str_obj(str) {
    str = str.split('; ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
        var cur = str[i].split('=');
        result[cur[0]] = cur[1];
    }
    return result;
}

module.exports = {
    str_obj: str_obj,
    gen: gen,
    transporter: transporter,
    genPass: genPass
}