const sequelize = require('sequelize');
const bcrypt = require("bcryptjs");
const models = require('../models/index');
const log = require('../func/log');
var func = require('../func/main');
const { Op } = require("sequelize");

async function checkPass(user, pass) {
    var hash = await ( models.users.findOne({
        attributes: ['pass'],
        where: {
            nick: user
        }
    }) );
    if(hash != undefined) {
        return bcrypt.compareSync(pass, hash.pass);
    }
    else {
        return 0;
    }
}

var user = function() { }

user.prototype.sessionLogin = async function(session) {
    var user_id = ( await models.sessions.findOne({
        attributes: ['user_id', 'date'],
        where: {
            session: session
        }
    }) );
        if(user_id == null) {
            log.log('LOGIN', "Session not found, remove cookie", 4, 2);
            return 0;
        }
        else {
            var user_date = new Date(user_id.date);
            var current_date = new Date();
            if(current_date > user_date) {
                log.log('LOGIN', "Session expired, remove cookie", 4, 2);
                return 0;
            }
            else {
                var user = ( await models.users.findOne({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'Pass', 'Salt']
                    },
                    where: {
                        id: user_id.user_id
                    }
                }) ).dataValues;
                this.id = user.id;
                this.nick = user.nick;
                this.email = user.email;
                this.active = user.active;
                this.avatar = user.avatar;
                return 1;
            }
        }
}
user.prototype.dataLogin = async function(user, pass) {
    if(await checkPass(user, pass)) {
        var session = func.gen(16);
        var user_db = await ( models.users.findOne({
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'Pass', 'Salt']
            },
            where: {
                nick: user
            }
        }) );
        var dt = new Date();
        dt.setTime(dt.getTime() + (24 * 60 * 60 * 1000));
        models.sessions.create({ user_id: user_db.id, session: session, date:  dt})
        .then(session => {
            log.log("LOGIN", 'Session saved as id: '+session.dataValues.id, 4);
        });
        this.id = user_db.id;
        this.nick = user_db.nick;
        this.email = user_db.email;
        this.active = user_db.active;
        this.avatar = user_db.avatar;
        this.session = session;
        return 1;
    }
    else {
        log.log("LOGIN", 'Username / Password not found', 4, 3);
        return 0;
    }
}
user.prototype.register = async function(nick, pass, email) {
    var user_exist = await models.users.findOne({
        attributes: {
            include: ['id']
        },
        where: {
            [Op.or]: [
                { nick: nick },
                { email: email }
            ]
            
        }
    });
    if(user_exist) {
        log.log('REGISTER', "User with this email or nick exist", 4, 2);
        return 0;
    }
    else {
        log.log('REGISTER', "Starting register script", 4, 1);
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(pass, salt);

        return models.users.create({ nick: nick, pass: hash, email: email, active: false })
        .then(async user => {
            log.log("REGISTER", 'Added new user with id: ' + user.id, 4);

            var token = func.gen(16);

            return models.activate_account.create({ user_id: user.id, token: token, used: false })
            .then(async () => {
                func.transporter.sendMail({
                    from: '"Automat Delivly" <noreply@delivly.com>',
                    to: email,
                    subject: "Aktywacja konta",
                    html: "<center><h2>Witaj " + nick + ",</h2><h3>Kliknij w link poniżej aby aktywować konto:</h3><h1><b><a href='https://delivly.com/activate/" + user.id + "/" + token + "'>Aktywuj konto</a></b></h1><h3>Po aktywacji będziesz miał pełny dostęp do gry!</h3></center>"
                });
                return 1;
            });
        });
    }
}
user.prototype.activate = async function(user_id, token) {
    var check_token = await models.activate_account.findOne({
        attributes: {
            include: ['id', 'used']
        },
        where: {
            [Op.and]: [
                { user_id: user_id },
                { token: token }
            ]
            
        }
    });
    if(check_token && check_token.used==0) {
        models.activate_account.update(
            { used: 1 },
            { where: { user_id: user_id } }
        )
        return models.users.update(
            { active: 1 },
            { where: { id: user_id } }
        )
        .then(() => {
            return 1;
        })
        .error(() => {
            return 0;
        }); 
    }
    else {
        return 0; 
    }

}
user.prototype.update = async function(table_name, value) {
    return models.users.update(
        { [ table_name ]: value },
        { where: { id: this.id } }
    )
    .then(() => {
        return 1;
    })
    .error(() => {
        return 0;
    }); 
}

module.exports = user;