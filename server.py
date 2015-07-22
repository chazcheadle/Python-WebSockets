import json
import os
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop
from tornado.options import define, options, parse_command_line

define("port", default=8080, help="run on the given port", type=int)

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    clients = []
    mode = ''

    def check_origin(self, origin):
        return True

    def open(self):
        print("WebSocket opened")
        self.write_message(self.create_packet("message", "status", "WebSocket opened"))
        # Register listening clients.
        self.clients.append(self)

    def on_message(self, message):
        try:
            packet = json.loads(message)
        except:
            return self.write_message(self.create_packet('status', "Error parsing incoming packet."))
        if packet['TYPE'] == 'message':
            if packet['MODE'] == 'broadcast':
                # Broadcast message to all clients.
                self.broadcast_message('message', 'broadcast', packet['MESSAGE'])
                # Update status
                self.write_message(self.create_packet('message', 'status', 'Message broadcasted'))
            else:
                # Echo message back to original client.
                self.write_message(self.create_packet('message', 'echo', packet['MESSAGE']))
                # Update status
                self.write_message(self.create_packet('message', 'status', 'Message echoed'))
        if packet['TYPE'] == 'action':
            if packet['MODE'] == 'trigger':
                # Update status
                self.write_message(self.create_packet('message', 'status', "# Trigger Action received."))
                self.broadcast_message('action', packet['MODE'], packet['MESSAGE'])
            else:
                self.write_message(self.create_packet('message', 'status', "# Received HTML."))
                self.broadcast_message('action', packet['MODE'], packet['MESSAGE'])

        # Print status to console.
        print(u"Received from client: \"" + message + "\"")

    def on_close(self):
        print("WebSocket closed")
        self.clients.remove(self)

    # Create JSON object
    def create_packet(self, type, mode, message):
        packet = {'TYPE' : type, 'MODE' :  mode, 'MESSAGE' : message}
        return json.dumps(packet)

    # Broadcast message from single client to all registered listeners.
    def broadcast_message(self, type, mode, message):
        for c in self.clients:
            c.write_message(self.create_packet(type, mode, message))

class IndexPageHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', IndexPageHandler),
            (r'/websocket', WebSocketHandler),
            (r"/js/(.*)", tornado.web.StaticFileHandler, {"path": os.path.join(os.path.dirname(__file__), 'js')}),
            (r"/css/(.*)", tornado.web.StaticFileHandler, {"path": os.path.join(os.path.dirname(__file__), 'css')})
        ]

        settings = {
            'template_path': 'templates'
        }
        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == '__main__':
    ws_app = Application()
    parse_command_line()
    server = tornado.httpserver.HTTPServer(ws_app)
    server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
