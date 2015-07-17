import json
import os
import tornado.web
import tornado.websocket
import tornado.httpserver
import tornado.ioloop

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")
        self.write_message("WebSocket opened")

    def on_message(self, message):
        print(u"Received from client: \"" + message + "\"")
        if message == 'mode-beacon':
            self.write_message(u"Switched to Beacon Mode")
        elif message == 'mode-broadcast':
            self.write_message(u"Switched to Broadcast Mode")
        else:
            self.write_message(message)

    def on_close(self):
        print("WebSocket closed")


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
    server = tornado.httpserver.HTTPServer(ws_app)
    server.listen(8080)
    tornado.ioloop.IOLoop.instance().start()
