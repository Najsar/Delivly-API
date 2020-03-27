const fs = require('fs');

module.exports = {
    log: function(trigger, message, type=0, level) {
        const config = require('../config/config.json');
        var type_file = "";
        var log_send = 0;
        type_info = ["\x1b[34m[INFO]", "\x1b[32m[SUCCESS]", "\x1b[33m[WARNING]", "\x1b[31m[ERROR]", "\x1b[35m[DEBUG]", "\x1b[95m[VERBOSE]"];
        type_file = ["[INFO]", "[SUCCESS]", "[WARNING]", "[ERROR]", "[DEBUG]", "[VERBOSE]"];

        if(config.debug_level == 2) {
            log_send = 1;

            if(level != undefined) {
                type_info_send = type_info[type] + type_info[level];
                type_file_send = type_file[type] + type_file[level];
            }
            else {
                type_info_send = type_info[type];
                type_file_send = type_file[type];
            }
        }
        else if(config.debug_level == 1) {
            if(type < 5) {
                log_send = 1;
                if(level !== undefined) {
                    type_info_send = type_info[type] + type_info[level];
                    type_file_send = type_file[type] + type_file[level];
                }
                else {
                    type_info_send = type_info[type];
                    type_file_send = type_file[type];
                }
            }
        }
        else {
            if(type < 4) {
                log_send = 1;
                
                type_info_send = type_info[type];
                type_file_send = type_file[type];
            }
        }
        if(log_send == 1) {
            if(config.log_to_file == 1) {
                fs.appendFile("logs/"+new Date().toLocaleDateString()+".log", "[" + new Date().toLocaleTimeString() + "][" + trigger + "]"+ type_file_send +" " + message+"\n", (err) => {
                    if(err) console.log("\x1b[90m[" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + "]\x1b[96m[LOGGER]\x1b[31m[ERROR] \x1b[0m" + "ERROR while saving log! | ERROR: " + err);
                }); 
            }
            console.log("\x1b[90m[" + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString() + "]\x1b[96m[" + trigger + "]"+ type_info_send +" \x1b[0m" + message);
            return 1;
        }
    }
}