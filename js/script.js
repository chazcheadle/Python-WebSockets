// Create WebSocket instance.
var ws = new WebSocket("ws://localhost:8080/websocket");

// Display message to confirm a connection has been made.
ws.onopen = function() {
    $('#status').innerHTML = 'Connected to websocket.';
};

// Display message received from WS.
ws.onmessage = function (packet) {
    console.log(packet.data);
    jsondata = parse_packet(packet);
    display_message(jsondata);
};

// Send text from input to WS.
function send_message() {
    var text = $('#message-send').val();
    if (text) {
        message = create_packet(text)
        if (message) {
            ws.send(message);
            $('#message-send').val('');
        }
    }
    else {
        $('#status').text('Ingoring empty text.');
    }
}

// Change mode by sending command string.
function change_mode(mode) {
    message = JSON.stringify({'TYPE' : 'mode', 'MESSAGE' : mode});
    ws.send(message);
}

function display_message(jsondata) {
    if (jsondata['TYPE'] == 'status') {
        $('#status').text(jsondata['MESSAGE']);
        console.log('Received status change.');
    }
    if (jsondata['TYPE'] == 'message') {
        $('#message-receive').append(jsondata['MESSAGE'] + "\n");
        $('#message-receive').scrollTop($('#message-receive')[0].scrollHeight);
        console.log('Received message packet.');
    }
}

function create_packet(text) {
    var packet = {"TYPE": 'message', "MESSAGE": text};
    try {
        jsondata = JSON.stringify(packet);
        if (jsondata) {
            console.log("Created JSON object:");
            console.log(jsondata);
            return(jsondata);
        }
    }
    catch(e) {
        $('#status').text('Error parsing JSON object.');
        console.log("Error creating JSON object.");
        console.log(e);
        return;
    }
}

function parse_packet(packet) {
    console.log("Received packet:");
    console.log(packet);
    try {
        jsondata = jQuery.parseJSON(packet.data);
        if (jsondata) {
            console.log("Parsed JSON object:");
            console.log(jsondata);
            return(jsondata);
        }
    }
    catch (e) {
        $('#status').text('Error parsing JSON object.');
        console.log("Error parsing received data.");
        console.log(e);
        return;
    }
}
