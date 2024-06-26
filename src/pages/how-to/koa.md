---
layout: "@layouts/BaseLayout.astro"
title: Koa
---
# Koa

To run apps built with the [Koa](https://koajs.com) web framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with the
   **unit-dev/unit-devel** package.  Next, [install](../installation.md#installation-nodejs-package) Unit’s **unit-http** package:
   ```bash
   # npm install -g --unsafe-perm unit-http
   ```
2. Create your app directory, [install](https://koajs.com/#introduction)
   Koa, and link **unit-http**:
   ```bash
   $ mkdir -p :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ npm install koa
   # npm link unit-http
   ```
3. Let’s try a version of the [tutorial app](https://koajs.com/#application), saving it as
   **/path/to/app/app.js**:
   ```javascript
   const Koa = require('koa');
   const app = new Koa();

   // logger

   app.use(async (ctx, next) => {
     await next();
     const rt = ctx.response.get('X-Response-Time');
     console.log(`${ctx.method} ${ctx.url} - ${rt}`);
   });

   // x-response-time

   app.use(async (ctx, next) => {
     const start = Date.now();
     await next();
     const ms = Date.now() - start;
     ctx.set('X-Response-Time', `${ms}ms`);
   });

   // response

   app.use(async ctx => {
     ctx.body = 'Hello, Koa on Unit!';
   });

   app.listen();
   ```

   The file should be made executable so the application can run on Unit:
   ```bash
   $ chmod +x :nxt_ph:`app.js <Application file; use a real path in your configuration>`
   ```
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-nodejs) the Koa configuration for
   Unit:
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/koa"
           }
       },

       "applications": {
           "koa": {
               "type": "external",
               "working_directory": ":nxt_ph:`/path/to/app/ <Needed to use the installed NPM modules; use a real path in your configuration>`",
               "executable": ":nxt_hint:`/usr/bin/env <The external app type allows to run arbitrary executables, provided they establish communication with Unit>`",
               ":nxt_hint:`arguments <The env executable runs Node.js, supplying Unit's loader module and your app code as arguments>`": [
                   "node",
                   "--loader",
                   "unit-http/loader.mjs",
                   "--require",
                   "unit-http/loader",
                   ":nxt_ph:`app.js <Basename of the application file; be sure to make it executable>`"
               ]
           }
       }
   }
   ```
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your app should be available on the listener’s IP
   address and port:
   ```bash
   $ curl http://localhost -v

         *   Trying 127.0.0.1:80...
         * TCP_NODELAY set
         * Connected to localhost (127.0.0.1) port 80 (#0)
         > GET / HTTP/1.1
         > Host: localhost
         > User-Agent: curl/7.68.0
         > Accept: */*
         >
         * Mark bundle as not supporting multiuse
         < HTTP/1.1 200 OK
         < Content-Type: text/plain; charset=utf-8
         < Content-Length: 11
         < X-Response-Time: 0ms
         < Server: Unit/1.32.1

         Hello, Koa on Unit!
   ```
