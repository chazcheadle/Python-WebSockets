import json
import os
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop
from tornado.options import define, options, parse_command_line

define("port", default=8080, help="run on the given port", type=int)

mode = ['Echo', 'Broadcast', 'Beacon']

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    clients = []

    def open(self):
        print("WebSocket opened")
        self.write_message(self.create_packet('status', "WebSocket opened"))
        self.clients.append(self)

    def on_message(self, message):
        try:
            packet = json.loads(message)
        except:
            return self.write_message(self.create_packet('status', "Error parsing incoming packet."))
        if packet['TYPE'] == 'mode':
            self.write_message(self.create_packet('message', "* " + mode[int(packet['MESSAGE'])] + " mode activated."))
            self.write_message(self.create_packet('status', 'Activate ' + mode[int(packet['MESSAGE'])] + ' mode' ))
            print(u"Change to %s mode" % mode[int(packet['MESSAGE'])])
        if packet['TYPE'] == 'message':
            # Broadcast message to all clients.

            # Echo message back to original client
            self.write_message(self.create_packet('message', "> " + packet['MESSAGE']))
            # Update status
            self.write_message(self.create_packet('status', 'Message Received'))

        print(u"Received from client: \"" + message + "\"")

    def on_close(self):
        print("WebSocket closed")
        self.clients.remove(self)

    def parse_packet():
        packet

    def create_packet(self, type, message):
        packet = {'TYPE' : type, 'MESSAGE' : message}
        return json.dumps(packet)

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
