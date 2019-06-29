- If you run `yarn install` and encounter these errors:
```bash
... blah blah blah
gyp ERR! node -v v12.4.0
gyp ERR! node-gyp -v v5.0.1
gyp ERR! not ok 
...
node-pre-gyp ERR! node -v v12.4.0
node-pre-gyp ERR! node-pre-gyp -v v0.10.3
node-pre-gyp ERR! not ok 
```
This is a known conflict between `node v12.*` and [grpc](https://www.npmjs.com/package/grpc).
Run this command:
```
$ yarn upgrade node-gyp@latest node-pre-gyp@latest
``` 
Then:
```bash
$ yarn install
```
Or you can downgrade your Node.js to version 10.*