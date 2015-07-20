import json
import os
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop
from tornado.options import define, options, parse_command_line

define("port", default=8080, help="run on the given port", type=int)

modes = ['Echo', 'Broadcast', 'Beacon']

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    clients = []
    mode = ''

    def open(self):
        print("WebSocket opened")
        self.write_message(self.create_packet('status', "WebSocket opened"))
        # Register listening clients.
        self.clients.append(self)

    def on_message(self, message):
        try:
            packet = json.loads(message)
        except:
            return self.write_message(self.create_packet('status', "Error parsing incoming packet."))
        if packet['TYPE'] == 'mode':
            self.mode = modes[int(packet['MESSAGE'])]
            self.write_message(self.create_packet('message', "* " + modes[int(packet['MESSAGE'])] + " mode activated."))
            self.write_message(self.create_packet('status', 'Activate ' + modes[int(packet['MESSAGE'])] + ' mode' ))
            print(u"Change to %s mode" % modes[int(packet['MESSAGE'])])
        if packet['TYPE'] == 'message':
            if self.mode == 'Broadcast':
                # Broadcast message to all clients.
                self.broadcast_message('message', packet['MESSAGE'])
                # Update status
                self.write_message(self.create_packet('status', 'Message broadcasted'))
            else:
                # Echo message back to original client.
                self.write_message(self.create_packet('message', "> " + packet['MESSAGE']))
                # Update status
                self.write_message(self.create_packet('status', 'Message echoed'))
        if packet['TYPE'] == 'action':
            if packet['MESSAGE'] == '1':
                self.write_message(self.create_packet('message', "# Trigger Action " + packet['MESSAGE'] + "."))
                self.write_message(self.create_packet('status', "# Trigger Action received."))
                self.broadcast_message('action', packet['MESSAGE'])
            if packet['MESSAGE'] == '2':
                self.write_message(self.create_packet('message', "# Trigger Action " + packet['MESSAGE'] + "."))
                self.write_message(self.create_packet('status', "# Trigger Action received."))
                self.broadcast_message('action', packet['MESSAGE'])

        # Print status to console.
        print(u"Received from client: \"" + message + "\"")

    def on_close(self):
        print("WebSocket closed")
        self.clients.remove(self)

    # Create JSON object
    def create_packet(self, type, message):
        packet = {'TYPE' : type, 'MESSAGE' : message}
        return json.dumps(packet)

    # Broadcast message from single client to all registered listeners.
    def broadcast_message(self, type, message):
        for c in self.clients:
            if type == 'message':
                c.write_message(self.create_packet('message', ">> " + message))
            if type == 'action':
                c.write_message(self.create_packet('action', message))


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
