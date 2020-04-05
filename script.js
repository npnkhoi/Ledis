string_dict = {}
set_dict = {}
saved_strings = {}
saved_sets = {}
timeout = {}

function answer(content) {
    document.getElementById("result").innerHTML = content + "<br />" +
    document.getElementById("result").innerHTML;
}

var commandTable = {
    /*
    String:
    - SET key value: set a string value, 
                     always overwriting what is saved under key
    - GET key: get a string value at key
    */
    "set": () => {
        string_dict[parser[1]] = parser[2];
        answer("Added string!");
    },
    "get": () => {
        var key = parser[1];
        if (key in string_dict) {
            answer(string_dict[key]);
        } else {
            answer("ERROR: Key not found!");
        }
    },
    /*
    Set: Set is a unordered collection of unique string values 
        (duplicates not allowed)
    - SADD key value1 [value2...]: add values to set stored at key
    - SREM key value1 [value2...]: remove values from set
    - SMEMBERS key: return array of all members of set
    - SINTER [key1] [key2] [key3] ...: *(bonus)* set intersection among all set 
        stored in specified keys. Return array of members of the result set
    */
    "sadd": () => {
        var key = parser[1];
        var size = parser.length;
        if (key in set_dict) {
            var index;
            for (index = 2; index < size; ++ index) {
                set_dict[key].add(parser[index]);
            }
        } else {
            set_dict[key] = new Set(parser.slice(2, size));
        }
        answer("Added values to set !");
    },
    "srem": () => {
        var key = parser[1];
        var size = parser.length;
        if (key in set_dict) {
            var index;
            for (index = 2; index < size; ++ index) {
                set_dict[key].delete(parser[index]);
            }
        } else {
            answer("ERROR: Key not found!");
        }
        answer("Removed values from set!");
    },
    "smembers": () => {
        key = parser[1];
        if (key in set_dict) {
            var str = "";
            set_dict[key].forEach(member => {
                str += member + " ";
            })
            answer(str);
        } else {
            answer("ERROR: Key not found!");
        }
    },
    "sinter": () => {
        var size = parser.length;
        throw "Function not implemented."
    },
    /*
    Data Expiration:
    - KEYS: List all available keys
    - DEL key: delete a key
    - EXPIRE key seconds: set a timeout on a key, seconds is a positive integer 
        (by default a key has no expiration). Return the number of seconds if the 
        timeout is set
    - TTL key: query the timeout of a key
    */
    "keys": () => {
        var str = "";
        for (var key in string_dict) {
            str += key + " ";
        }
        answer(str);
    },
    "del": () => {
        var key = parser[1];
        if (key in string_dict) {
            delete string_dict[key];
            answer("Key deleted!")
        } else {
            answer("ERROR: Key not found!");
        }
    },
    "expire": () => {
        var key = parser[1];
        var time = parseInt(parser[2]) * 1000;
        if (key in string_dict) {
            setTimeout((key) => {
                delete string_dict[key];
                answer("Key expired!")
            }, time);
            timeout[key] = (new Date).getTime() + time;
            answer("This key will be expired as scheduled!")
        } else {
            answer("ERROR: Key not found!");            
        }
    },
    "ttl": () => {
        var key = parser[1];
        if (key in string_dict) {
            answer(`This key will be expired in
                ${(timeout[key] - (new Date).getTime())/1000} second(s)!`)
        } else {
            answer("ERROR: Key not found!");
        }
    },
    /*
    Snapshot:
    - SAVE: save current state in a snapshot
    - RESTORE: restore from the last snapshot,
    */
    "save": () => {
        saved_strings = { ...string_dict};
        saved_sets = { ...set_dict};
        answer("Current state saved!")
    },
    "restore": () => {
        string_dict = saved_strings;
        set_dict = saved_sets;
        answer("Last snapshot restored!")
    }
}

function getCommand() {
    command = document.getElementById("command").value;
    process(command);
}

function process(full_command) {
    answer(">" + full_command);
    full_command = full_command.toLowerCase();
    parser = full_command.split(" ");
    command_name = parser[0];
    console.log(command_name);
    if (command_name in commandTable) {
        commandTable[command_name](parser);
    } else {
        answer("Command not found!");
    }
}