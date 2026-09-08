#!/usr/bin/env python3
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser, sys
ROOT=Path(__file__).resolve().parent
os.chdir(ROOT)
port=int(sys.argv[1]) if len(sys.argv)>1 else 8765
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  super().end_headers()
 def do_POST(self):
  targets={'/__save__/model':('models/宜家建筑白模.glb',b'glTF'),'/__save__/preview':('previews/白模视图.png',b'\x89PNG')}
  host=self.headers.get('Host','')
  origin=self.headers.get('Origin','')
  if self.path not in targets or host!=f'127.0.0.1:{port}' or origin!=f'http://127.0.0.1:{port}':
   self.send_error(403);return
  try:n=int(self.headers.get('Content-Length','0'))
  except ValueError:self.send_error(400);return
  if not 0<n<20000000:self.send_error(413);return
  buf=self.rfile.read(n);name,signature=targets[self.path]
  if not buf.startswith(signature):self.send_error(400);return
  dest=ROOT/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(buf)
  self.send_response(200);self.send_header('Content-Type','text/plain');self.end_headers();self.wfile.write(b'OK')
server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
print(f'建筑白模查看器：http://127.0.0.1:{port}',flush=True)
if '--no-browser' not in sys.argv:webbrowser.open(f'http://127.0.0.1:{port}')
server.serve_forever()
