const fs = require('fs');
const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':
      deletefile(res, pathname, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

function deletefile(res, pathname, filepath) {
  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Subfolders are not supported');

    return;
  }

  fs.stat(filepath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.statusCode = 404;
      res.end('File not found');

      return;
    }

    fs.unlink(filepath, (error) => {
      if (error) {
        res.statusCode = 500;
        res.end('Something went wrong');
      }

      res.statusCode = 200;
      res.end();
    });
  });
}

module.exports = server;
