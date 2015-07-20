var app = angular.module('wsApp', []);

app.controller('wsController', function($scope) {
  $scope.message = [];
  $scope.message.text = '';
  $scope.message.input = '';
  $scope.status = [];
  $scope.status.text = '';

  // Create WebSocket instance.
  var ws = new WebSocket("ws://localhost:8080/websocket");

  // Display message to confirm a connection has been made.
  ws.onopen = function() {
      $('#message-receive').append("Connected to websocket.\n");
      // Set Initial mode to 'Echo'.
      $scope.mode_change(0);

  };

  // Display message received from WS.
  ws.onmessage = function (packet) {
      console.log(packet.data);
      jsondata = packet_parse(packet);
      message_display(jsondata);
  };

  // Send text from input to WS.
  $scope.message_send = function message_send() {
      var text = $('#message-send').val();
      if (text) {
          message = packet_create(text)
          if (message) {
              ws.send(message);
              $('#message-send').val('');
          }
      }
      else {
          $scope.status.text = 'Ingoring empty text.';
      }
  }

  // Change mode by sending command string.
  $scope.mode_change = function mode_change(mode) {
      message = JSON.stringify({'TYPE' : 'mode', 'MESSAGE' : mode});
      ws.send(message);
  }

  function message_display(jsondata) {
      if (jsondata['TYPE'] == 'status') {
          $scope.status.text = jsondata['MESSAGE'];
          console.log('Received status change.');
      }
      if (jsondata['TYPE'] == 'message') {
          $('#message-receive').append(jsondata['MESSAGE'] + "\n");
          $('#message-receive').scrollTop($('#message-receive')[0].scrollHeight);
          console.log('Received message packet.');
      }
      if (jsondata['TYPE'] == 'action') {
          action_receive(jsondata['MESSAGE']);
          console.log('Received action trigger.');
      }

  }

  function packet_create(text) {
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
          $scope.status.text = 'Error parsing JSON object.';
          console.log("Error creating JSON object.");
          console.log(e);
          return;
      }
  }

  function packet_parse(packet) {
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
          $scope.status.text = 'Error parsing JSON object.';
          console.log("Error parsing received data.");
          console.log(e);
          return;
      }
  }

  $scope.action_send = function action_send(action) {
      message = JSON.stringify({'TYPE' : 'action', 'MESSAGE' : action});
      ws.send(message);
      console.log('Send Action ' + action + ' trigger.');
      $scope.status.text = 'Send Action ' + action + ' trigger.';
  }

  function action_receive(action) {
      $scope.status.text = 'Received Action ' + action + ' signal.';
      var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = 'http://www.stackoverflow.com/favicon.ico';
      document.getElementsByTagName('head')[0].appendChild(link);
  }

})
