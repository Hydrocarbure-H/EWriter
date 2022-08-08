const socket = io();

socket.on("reloading_document", (data) => {
    var input = document.getElementById("textarea");

    console.log(data);

    // save cursor position
    var start = input.selectionStart;
    var end = input.selectionEnd;

    if (data && data.cursor_end <= start) {
        start += (data.cursor_end - data.cursor_start) + 1;
        end += (data.cursor_end - data.cursor_start) + 1;
    }

    input.value = data.content;
    // reset cursor position
    input.selectionStart = start;
    input.selectionEnd = end;

    // Apply and render markdown into HTML
    fill_in_html_render(data.content);
})

/**
 * @brief This function will get the keycode and the cursor position. 
 * Then, emit a new_letter signal to the server.
 * @param {event} e 
 */
function send_letter(e) {
    var area = document.querySelector("textarea");

    var event = {
        key: e.key,
        cursor_start: area.selectionStart,
        cursor_end: area.selectionEnd
    }

    if (e.keyCode === 9) {
        e.preventDefault()
        event.key = "    "
        event.cursor_end += 4;
        textarea.setRangeText(
            "    ",
            textarea.selectionStart,
            textarea.selectionStart,
            'end'
        )
    }

    socket.emit("new_letter", event);
}

function fill_in_html_render(content)
{
    var html_div = document.querySelector(".renderer");
    html_div.innerHTML = convert_html_to_markdown(content);
}

function convert_html_to_markdown(md)
{
    var remarkable = new Remarkable({
        // Syntax highlighting for code
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (err) {}
            }
    
            try {
                return hljs.highlightAuto(str).value;
            } catch (err) {}
    
            return ''; 
        }
    });

    return remarkable.render(md);
}

