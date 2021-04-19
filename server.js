const express = require("express");
const path = require("path");
var app = express();
app.use(express.static(path.join(__dirname, "")));
server = app.listen(process.env.PORT || 3000);


const io = require("socket.io")(server);


// var webSocketServ = require("ws").Server;

// var wss = new webSocketServ({
//   port: 9090,
// });

var users = {};
var otherUser;
// wss.on("connection", function (conn) {
//     console.log("User connected");
io.on("connection", (conn) => {
    console.log(conn.id);

    conn.on("cmessage", function (message) {
        var data;

        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
        }
        console.log(data.type);
        switch (data.type) {
            case "login":
                if (users[data.name]) {
                    sendToOtherUser(conn, {
                        type: "login",
                        success: false,
                    });
                } else {
                    users[data.name] = conn;
                    conn.name = data.name;

                    sendToOtherUser(conn, {
                        type: "login",
                        success: true,
                    });
                }
                // console.log(users[data.name]);
                break;
            case "offer":
                var connect = users[data.name];
                if (connect != null) {
                    conn.otherUser = data.name;

                    sendToOtherUser(connect, {
                        type: "offer",
                        offer: data.offer,
                        name: conn.name,
                    });
                }
                break;

            case "answer":
                var connect = users[data.name];

                if (connect != null) {
                    conn.otherUser = data.name;
                    sendToOtherUser(connect, {
                        type: "answer",
                        answer: data.answer,
                    });
                }

                break;

            case "candidate":
                var connect = users[data.name];

                if (connect != null) {
                    sendToOtherUser(connect, {
                        type: "candidate",
                        candidate: data.candidate,
                    });
                }
                break;
            case "reject":
                var connect = users[data.name];

                if (connect != null) {
                    sendToOtherUser(connect, {
                        type: "reject",
                        name: conn.name,
                    });
                }
                break;
            case "accept":
                var connect = users[data.name];

                if (connect != null) {
                    sendToOtherUser(connect, {
                        type: "accept",
                        name: conn.name,
                    });
                }
                break;
            case "filee":
                var connect = users[data.name];
                console.log("filee got");
                if (connect != null) {
                    sendToOtherUser(connect, {
                        type: "filee",
                        name: conn.name,
                        FileePath: data.FileePath,
                        fileeName: data.fileeName,
                    });
                }
                break;
            case "leave":
                var connect = users[data.name];
                connect.otherUser = null;

                if (connect != null) {
                    sendToOtherUser(connect, {
                        type: "leave",
                    });
                }

                break;

            default:
                sendToOtherUser(conn, {
                    type: "error",
                    message: "Command not found: " + data.type,
                });
                break;
        }
    });
    conn.on("close", function () {
        console.log("Connection closed");
        if (conn.name) {
            delete users[conn.name];
            if (conn.otherUser) {
                var connect = users[conn.otherUser];
                conn.otherUser = null;

                if (conn != null) {
                    sendToOtherUser(connect, {
                        type: "leave",
                    });
                }
            }
        }
    });

    conn.send("Hello World");
});

function sendToOtherUser(connection, message) {
    connection.emit("gmessage", JSON.stringify(message));
    // console.log(JSON.stringify(message));
}
