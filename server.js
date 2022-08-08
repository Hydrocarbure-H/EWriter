const path = require("path");
const socketio = require("socket.io");
const express = require('express');
const http = require('http');

var fs = require('fs');


// Server configuration

const port = 7789;

const app = express();
app.use(express.static(path.join(__dirname, "www")));

const server = http.createServer(app);

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
});

const io = socketio(server);
var document_content = "";

// Loading previous document
fs.readFile('documents/file.ewriter', 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    document_content = data;
  })

// Starting server handling...

io.on("connection", (socket) => {
    socket.emit("reloading_document", {content : document_content, cursor_start : 0, cursor_end : 0});

    socket.on("new_letter", (event) =>
    {
        console.log(event)
        var actual_content = document_content;
        document_content = handle_letter(event, document_content);
        console.log("-----------------------------")
        console.log(document_content);
        if (actual_content != document_content)
        {
            socket.broadcast.emit("reloading_document", {content : document_content, cursor_start : event.cursor_start, cursor_end : event.cursor_end});
        }

        // Saving document
        fs.writeFile('documents/file.ewriter', document_content, function (err) {
            if (err) throw err;
          });
          
    });
    socket.on("disconnect", () => {
        // TO DO : How to handle when a clien is disconected
    })
});

/**
 * 
 * @param {char} letter The letter which has been pressed
 * @param {string} content The actual content of the md code
 * @returns The modified content
 */
function handle_letter(letter, content)
{
    if (letter.key.length > 1)
    {
        if (letter.key.includes("Backspace"))
        {
            content = backspace(letter, content);
        } 

        if (letter.key.includes("Enter"))
        {
            content = return_key(letter, content);
        } 
    }
    else 
    {
        if (letter.cursor_start == letter.cursor_end)
        {
            content = content.insertAt(letter.cursor_start, letter.key)
        } 
        else 
        {
            content = content.replaceBetween(letter.cursor_start, letter.cursor_end, letter.key)
        }
        
    }
    return content;
}

/**
 * @brief Handle the backspace action
 * @param {char} letter 
 * @param {string} content 
 * @returns The modified content
 */
function backspace(letter, content)
{
    return content.deleteBetween(letter.cursor_start - 1, letter.cursor_end);
}

/**
 * @brief Handle the return action
 * @param {char} letter 
 * @param {string} content 
 * @returns The modified content
 */
function return_key(letter, content)
{
    return content.insertAt(letter.cursor_start, "\n");
}

String.prototype.insertAt = function(start, what)
{
    return this.substring(0, start) + what + this.substring(start);
}

String.prototype.replaceBetween = function (start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
}

String.prototype.deleteBetween = function (start, end) {
    return this.replaceBetween(start, end + 1, '');
}