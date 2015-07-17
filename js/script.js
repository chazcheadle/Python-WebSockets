// Create WebSocket instance.
var ws = new WebSocket("ws://localhost:8080/websocket");

// Display message to confirm a connection has been made.
ws.onopen = function() {
    $('#status').innerHTML = 'Connected to websocket.';
};

// Display message received from WS.
ws.onmessage = function (packet) {
    $('#message-receive').append(packet.data+ "\n");
    $('#message-receive').scrollTop($('#message-receive')[0].scrollHeight);
    console.log(packet.data);
//    parse_packet(packet);
};

// Send text from input to WS.
function sendMsg() {
    var message = $('#message-send').val();
//    var message = create_packet()
    if (message) {
        ws.send(message);
        // Clear messag field
        $('#message-send').val('');
    }
    else {
        $('#status').text('Error parsing message.');
    }
}

// Change mode by sending command string.
function changeMode(mode) {
    ws.send(mode);
}

function create_packet(message) {
    var msg = {"TYPE": MESSAGE, "MESSAGE": message};
    return JSON.stringify(msg);
}

function parse_packet(packet) {
    try {
        json = jQuery.parseJSON(packet.data);
        console.log(json);
    } catch (e) {
        $('#status').text('Error!');
        return;
    }
}
