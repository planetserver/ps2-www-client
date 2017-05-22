#!/usr/bin/python
import os
import subprocess
import re
import json
import cgi
import urllib

from stretch import *
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer

# Author: Bang Pham Huu, mailto: b.phamhuu@jacobs-university.de

# Require: python PIL, urllib2, gdal, numpy (version >= 1.8)

# This port is for python
PORT_NUMBER = 8090

# Kill old webserver before starting new server
print "Kill process on port {0}".format(PORT_NUMBER)
subprocess.call("fuser -k {0}/tcp".format(PORT_NUMBER), shell=True)
print "Start simpleHTTPServer for stretching WCPS query. Use Ctrl + C to stop server."

#This class will handles any incoming request from
#the browser
class PythonWebHandler(BaseHTTPRequestHandler):

    #Handler for the GET requests
    def do_GET(self):
        self.send_response(200)
        #self.send_header('Content-type','image/png')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # Get the result from WCPS query and return the stretched image to web
        stretchHandler = StretchHandler(None, "");
        try:
            URI = urllib.unquote(self.path.partition("wcpsQuery=")[2]);             
            image = stretchHandler.parseURI(URI);
            self.wfile.write(image);
        except Exception as e:
            print str(e)
        return

    def do_POST(self):
        self.send_response(200)
        #self.send_header('Content-type','image/png')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # Get the result from WCPS query and return the stretched image to web
        stretchHandler = StretchHandler(None, "");

        varLen = int(self.headers['Content-Length'])
        postVars = self.rfile.read(varLen)

        try:            
            tmp = postVars.split("wcpsQuery=")
            # get the URI wcpsQuery=petascopeEndPoint?query=
            URI = urllib.unquote(tmp[1])
            image = stretchHandler.parseURI(URI);
            self.wfile.write(image);
        except Exception as e:
            print e
        return 

try:
    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(('', PORT_NUMBER), PythonWebHandler)
    print 'Started httpserver on port', PORT_NUMBER

    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()
