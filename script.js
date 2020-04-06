dict = {}
saved_dict = {}
timeout = {}

function getCommand() {
    full_command = document.getElementById("command").value;
    answer(">" + full_command);

    full_command = full_command.toLowerCase();
    parser = full_command.split(" ");
    command_name = parser[0];

    if (command_name in commandTable) {
        commandTable[command_name](parser);
    } else {
        answer("Command not found!");
    }
}

var commandTable = {
    // SET key value: set a string value, 
    //     always overwriting what is saved under key
    "set": () => {
        dict[parser[1]] = parser[2];
        answer("Added string!");
    },
    // GET key: get a string value at key
    "get": () => {
        var key = parser[1];
        if (check_key(key)) return;
        if (check_type(key, "string")) return;
        answer(dict[key]);
    },
    // SADD key value1 [value2...]: add values to set stored at key
    "sadd": () => {
        var key = parser[1];
        if ((key in dict) && (check_type(key, "set"))) return;

        var size = parser.length;
        if (key in dict) {
            var index;
            for (index = 2; index < size; ++ index) {
                dict[key].add(parser[index]);
            }
        } else {
            dict[key] = new Set(parser.slice(2, size));
        }
        answer("Added values to set !");
    },
    // SREM key value1 [value2...]: remove values from set
    "srem": () => {
        var key = parser[1];
        if (check_key(key)) return;
        if (check_type(key, "set")) return;

        var size = parser.length;
        var index;
        for (index = 2; index < size; ++ index) {
            dict[key].delete(parser[index]);
        }
        answer("Removed values from set!");
    },
    // SMEMBERS key: return array of all members of set
    "smembers": () => {
        var key = parser[1];
        if (check_key(key)) return;
        if (check_type(key, "set")) return;

        var str = "";
        dict[key].forEach(member => {
            str += member + " ";
        })
        answer(str);
    },
    // SINTER [key1] [key2] [key3] ...: set intersection among all set 
    //     stored in specified keys. Return array of members of the result set
    "sinter": () => {
        var size = parser.length;
        var intersection = {}
        for (var i = 1; i < size; ++ i) {
            var key = parser[i];
            answer("Visting set at key " + key + " ...");
            if (check_type(key, "set")) return;

            for (let value of dict[key]) {
                console.log("in");
                if (value in intersection)
                    intersection[value] += 1;
                else
                    intersection[value] = 1;
            }
        }
        var str = "Intersection: "
        Object.keys(intersection).forEach(
            (value) => {
                if (intersection[value] == size - 1) {
                    str += value + " ";
                }
            }
        );
        answer(str);
    },
    // KEYS: List all available keys
    "keys": () => {
        var str = "";
        for (var key in dict) {
            str += key + " ";
        }
        answer(str);
    },
    // DEL key: delete a key
    "del": () => {
        var key = parser[1];
        if (check_key(key)) return;

        delete dict[key];
        answer("Key deleted!")
    },
    // EXPIRE key seconds: set a timeout on a key, seconds is a positive integer 
    //     (by default a key has no expiration). Return the number of seconds 
    //     if the timeout is set
    "expire": () => {
        var key = parser[1];
        if (check_key(key)) return;

        var time = parseInt(parser[2]) * 1000;
        setTimeout((key) => {
            delete dict[key];
            answer("Key expired!")
        }, time);
        timeout[key] = (new Date).getTime() + time;
        answer("This key will be expired as scheduled!")
    },
    // TTL key: query the timeout of a key
    "ttl": () => {
        var key = parser[1];
        if (check_key(key)) return;
        answer(`This key will be expired in
            ${(timeout[key] - (new Date).getTime())/1000} second(s)!`)
    },
    // SAVE: save current state in a snapshot
    "save": () => {
        saved_dict = { ...dict};
        answer("Current state saved!")
    },
    // RESTORE: restore from the last snapshot
    "restore": () => {
        dict = saved_dict;
        answer("Last snapshot restored!")
    }
}

function answer(content) {
    document.getElementById("result").innerHTML = content + "<br />" +
    document.getElementById("result").innerHTML;
}

function check_key(key) {
    if (key in dict) {
        return false;
    } else {
        answer("ERROR: Key not found.")
        return true;
    }
}

function check_type(key, type) {
    var type2 = (type == "set" ? "object" : type);
    if (typeof(dict[key]) == type2) {
        return false;
    } else {
        console.log(typeof dict[key]);
        answer("ERROR: Value in under this key is not a " + type + ".");
        return true;
    }
}

