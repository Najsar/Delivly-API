const { Op } = require("sequelize");

var main = require('../func/main');
var users_model = require('../objects/user');
const models = require('../models/index');
var func = require('../func/log');

var users = Array();

async function io(io) {
    io.on('connection', async function(socket){
        func.log('SOCKET.IO', 'Current connected clients: ' + io.eio.clientsCount);
        var cookies = socket.request.headers.cookie;
        if(!cookies) {
            socket.disconnect();
        }
        else if('userLogin' in cookies) {
            var date = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
            var user = new users_model();
            var status = await user.sessionLogin(cookies.userLogin);
            if(status != 0) {
                user.socket_id = socket.id;
                users.push(user);

                socket.on('message', (mess) => {
                    var id = users.findIndex((user) => { 
                        if(user.socket_id == socket.id) return 1; 
                    });
                    func.log('WEBSOCKET', 'From: ' + users[id].id + ' To: ' + users[id].to + ' : ' + mess, 5, 0);
                    models.messages.create({ from: users[id].id, to: users[id].to, message: mess, date:  new Date()})
                    .then(session => {
                        func.log("WEBSOCKET", 'Message saved with id: '+session.dataValues.id, 5);
                        users.forEach(async (client) => {
                            if( ( users[id].to == client.id && client.to == users[id].id  ) || ( users[id].to == client.to && client.id == users[id].id ) ) {
                                var data = await models.users.findOne({
                                    where: {
                                        id: users[id].to,
                                    },
                                    attributes: [
                                        'id', 'nick', 'avatar'
                                    ]
                                });
                                var json_message = JSON.stringify({data: mess, to: data, from: [users[id].id, users[id].nick, users[id].avatar], date: date});
                                io.to(client.socket_id).emit('message', json_message);
                                
                                io.to(client.socket_id).emit('new_message');
                            }
                        });
                    });
                });
                socket.on('set_receiver', async (id) => {
                    var user_id = users.findIndex((user) => { 
                        if(user.socket_id == socket.id) return 1; 
                    });
                    users[user_id].to = id;
                });
                socket.on('get_messages', async () => {
                    var user_id = users.findIndex((user) => { 
                        if(user.socket_id == socket.id) return 1; 
                    });
                    var data = await models.messages.findAll({
                        where: {
                            [Op.or]: [
                                { [Op.and]: {
                                    to:  users[user_id].id,
                                    from:  users[user_id].to
                                } },
                                { [Op.and]: {
                                    to:  users[user_id].to,
                                    from:  users[user_id].id
                                } }
                            ]
                        },
                        include: [
                            {
                                model: models.users,
                                attributes: [
                                    'id', 'nick', 'avatar'
                                ],
                                as: 'from-data'
                            },
                            {
                                model: models.users,
                                attributes: [
                                    'id', 'nick', 'avatar'
                                ],
                                as: 'to-data'
                            }
                        ],
                        attributes: [
                        'from', 'to', 'message', 'date'
                        ]
                    });
                    if(data[0]) {
                        socket.emit('message', JSON.stringify(data));
                    }
                    else {
                        socket.emit('message', JSON.stringify({data: 'To twoja pierwsza wiadomość do tego gracza', to: user.id, from: [0, 'SERVER', 'default.svg'], date: date}));
                    }
                });

                socket.on('disconnect', () => {
                    func.log('SOCKET.IO', 'User disconnected, currently online: ' + io.eio.clientsCount);
                    var user_closed = users.findIndex((user) => { 
                        if(user.socket_id == socket.id) return 1; 
                    });
                    users.splice(user_closed, 1);
                });
                socket.on('get_all_messages', async () => {
                    var user_id = users.findIndex((user) => { 
                        if(user.socket_id == socket.id) return 1; 
                    });
                    var data = await models.messages.findAll({
                        where: {
                            from: users[user_id].id,
                        },
                        include: [
                            {
                                model: models.users,
                                attributes: [
                                    'id', 'nick', 'avatar'
                                ],
                                as: 'from-data'
                            },
                            {
                                model: models.users,
                                attributes: [
                                    'id', 'nick', 'avatar'
                                ],
                                as: 'to-data'
                            }
                        ],
                        attributes: [
                        'from', 'to', 'message', 'date'
                        ],
                        order: [
                            ['date', 'DESC']
                        ]
                    });
                    var data_sorted = Array();
                    var user_id_only = Array();
                    data.forEach((d) => {
                        if(!user_id_only.includes(d.to)) {
                            data_sorted.push(d);
                            user_id_only.push(d.to);
                        }
                    });
                    socket.emit('messages', JSON.stringify(data_sorted));
                });
            }
        }
        else {
            socket.disconnect();
        }
    });
}

module.exports = io;