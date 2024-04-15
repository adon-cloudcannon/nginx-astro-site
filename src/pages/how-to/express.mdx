---
layout: "@layouts/BaseLayout.astro"
title: Express
---
# Express

To run apps built with the [Express](https://expressjs.com) web framework
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with the
   **unit-dev/unit-devel** package.  Next, [install](../installation.md#installation-nodejs-package) Unit’s **unit-http** package:
   ```bash
   # npm install -g --unsafe-perm unit-http
   ```
2. Create your app directory, [install](https://expressjs.com/en/starter/installing.html) Express, and link
   **unit-http**:
   ```bash
   $ mkdir -p :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ npm install express --save
   # npm link unit-http
   ```
3. Create your Express [app](https://expressjs.com/en/starter/hello-world.html); let’s store it as
   **/path/to/app/app.js**.  First, initialize the directory:
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ npm init
   ```

   Next, add your application code:
   ```javascript
   #!/usr/bin/env node

   const http = require('http')
   const express = require('express')
   const app = express()

   app.get('/', (req, res) => res.send('Hello, Express on Unit!'))

   http.createServer(app).listen()
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
5. Next, [prepare](../configuration.md#configuration-nodejs) the Express configuration for
   Unit:
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/express"
           }
       },

       "applications": {
           "express": {
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
   ![Express on Unit - Welcome Screen](/express.png)
