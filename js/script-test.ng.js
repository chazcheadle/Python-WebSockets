var app = angular.module('wsApp', []);

app.factory('wsService', function() {
  var bn_socket = new WebSocket("ws://localhost:8080/websocket");

  bn_socket.onopen = function() {
    console.log('*** WebSocket opened.');
  }
  return {

    on: function(packet) {
      // Display message received from WS.
      bn_socket.onmessage = function (packet) {
        console.log('Received packet:');
        console.log(packet);

        // Parse and verify packet.
        try {
            jsondata = jQuery.parseJSON(packet.data);
            if (jsondata) {
              console.log("Parsed JSON object:");
              if (jsondata['TYPE'] == 'action'
                  && jsondata['MODE'] == 'html') { // Change to 'context = 'msnbc.com:breakingnews
                $scope.$apply(function() {
                  $scope.message = $sce.trustAsHtml(jsondata['MESSAGE']);
                });
                $scope.action_trigger_receive();
              }
            }
        }
        catch (e) {
            $scope.status = 'Error parsing JSON object.';
            console.log("Error parsing received data.");
            console.log(e);
            return;
        }
        // Broadcast the event so it can be used anywhere on the site.
        $rootScope.$broadcast('breakingnews', $scope.message);
      };
    }
  }
});

app.controller('wsController', ['$scope', 'wsService', function($scope, wsService) {
  wsService.on(data);
}]);
