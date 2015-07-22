var app = angular.module('wsApp', []);

app.controller('wsController', ['$scope', '$sce', function($scope, $sce) {
  $scope.message = [];
  $scope.message.input_text = '';
  $scope.action_html = [];
  $scope.action_html.output = '';
  $scope.action_html.input_text = '';
  $scope.action_json = [];
  $scope.action_json.output = '';
  $scope.action_json.input_text = '';
  $scope.status = [];
  $scope.status.output = '';

  // Create WebSocket instance.
  var ws = new WebSocket("ws://localhost:8080/websocket");

  // Display message to confirm a connection has been made.
  ws.onopen = function() {
      $('#message-receive').append("Connected to websocket.\n");
      // Set Initial mode to 'Echo'.
      $scope.mode_change('echo');

  };

  // Display message received from WS.
  ws.onmessage = function (packet) {
      console.log(packet.data);
      jsondata = $scope.packet_parse(packet);
      $scope.message_display(jsondata);
  };

  // Send text from input to WS.
  $scope.message_send = function message_send() {
      if ($scope.message.input_text != '') {
          message = $scope.packet_create($scope.message.input_text)
          if (message) {
              ws.send(message);
              $scope.message.input_text = '';
          }
      }
      else {
          $scope.status.output = 'Ingoring empty text.';
      }
  }

  // Change mode by sending command string.
  $scope.mode_change = function mode_change(mode) {
      $scope.mode = mode;
      $scope.status.output = "Entering " + mode + " mode.";

//      message = JSON.stringify({"TYPE" : "message" "MODE" : 0, "MESSAGE" : mode});
//      ws.send(message);
  }

  $scope.message_display = function message_display(jsondata) {
      if (jsondata['TYPE'] == 'message') {
        if (jsondata['MODE'] == 'echo') {
          $('#message-receive').append("> " + jsondata['MESSAGE'] + "\n");
          $('#message-receive').scrollTop($('#message-receive')[0].scrollHeight);
          console.log('Received message packet.');
        }
        if (jsondata['MODE'] == 'broadcast') {
          $('#message-receive').append(">> " + jsondata['MESSAGE'] + "\n");
          $('#message-receive').scrollTop($('#message-receive')[0].scrollHeight);
          console.log('Received broadcast message packet.');
        }
        if (jsondata['MODE'] == 'status') {
          $scope.status.output = jsondata['MESSAGE'];
          console.log('Received status message.');
        }
      }
      if (jsondata['TYPE'] == 'action') {
        if (jsondata['MODE'] == 'trigger') {
          $scope.action_trigger_receive();
        }
        if (jsondata['MODE'] == 'html') {
          $scope.action_html_receive(jsondata['MESSAGE']);
        }
        if (jsondata['MODE'] == 'json') {
          $scope.action_json_receive(jsondata['MESSAGE']);
        }
      }
      $scope.$apply();

  }

  $scope.packet_create = function packet_create(text) {
      var packet = {"TYPE": 'message', "MODE" : $scope.mode, "MESSAGE": text};
      try {
          jsondata = JSON.stringify(packet);
          if (jsondata) {
              console.log("Created JSON object:");
              console.log(jsondata);
              return(jsondata);
          }
      }
      catch(e) {
          $scope.status.output = 'Error parsing JSON object.';
          console.log("Error creating JSON object.");
          console.log(e);
          return;
      }
  }

  $scope.packet_parse = function packet_parse(packet) {
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
          $scope.status.output = 'Error parsing JSON object.';
          console.log("Error parsing received data.");
          console.log(e);
          return;
      }
  }

  $scope.action_trigger_send = function action_trigger_send() {
      message = JSON.stringify({"TYPE" : "action", "MODE" : "trigger", "MESSAGE" : ''});
      ws.send(message);
      console.log('Send Action trigger.');
      $scope.status.output = 'Send Action trigger.';
  }

  $scope.action_trigger_receive = function action_trigger_receive() {
      $scope.status.output = 'Received Action trigger signal.';
      var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = 'http://www.stackoverflow.com/favicon.ico';
      document.getElementsByTagName('head')[0].appendChild(link);
  }

  $scope.action_html_send = function action_html_send() {
    if ($scope.action_html.input_text != '') {
      message = JSON.stringify({"TYPE" : "action", "MODE" : "html", "MESSAGE" : $scope.action_html.input_text});
      ws.send(message);
      console.log('Send HTML.');
      $scope.action_html.input_text = '';
    }
  }

  $scope.action_html_receive = function action_html_receive(html) {
      $scope.status.output = 'Received HTML';
      $scope.action_html.output = $sce.trustAsHtml(html);
  }

  $scope.action_json_send = function action_json_send() {
    if ($scope.action_json.input_text != '') {
      message = JSON.stringify({"TYPE" : "action", "MODE" : "json", "MESSAGE" : JSON.stringify({'TEST' : $scope.action_json.input_text})});
      ws.send(message);
      console.log('Send JSON.');
      $scope.action_json.input_text = '';
    }
  }

  $scope.action_json_receive = function action_json_receive(jsondata) {
      $scope.status.output = 'Received JSON';
      console.log(jsondata);
      $scope.action_json.output = $sce.trustAsHtml(jsondata);
  }
}]);
