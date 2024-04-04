---
layout: "@layouts/BaseLayout.astro"
title: Starlette
---
# Starlette

To run apps built with the [Starlette](https://www.starlette.io) web
framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.5+ language module.
2. Create a virtual environment to install Starlette’s [PIP package](https://www.starlette.io/#installation):
   ```console
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install 'starlette[full]'
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**3.Y** in this
   example).  Also, the app **type** in Step 5 must [resolve](../configuration.md#configuration-apps-common) to a similarly matching version; Unit doesn’t
   infer it from the environment.
3. Let’s try a version of a [tutorial app](https://www.starlette.io/applications/),
   saving it as **/path/to/app/asgi.py**:
   ```python
   from starlette.applications import Starlette
   from starlette.responses import PlainTextResponse
   from starlette.routing import Route, Mount, WebSocketRoute


   def homepage(request):
       return PlainTextResponse('Hello, world!')

   def user_me(request):
       username = "John Doe"
       return PlainTextResponse('Hello, %s!' % username)

   def user(request):
       username = request.path_params['username']
       return PlainTextResponse('Hello, %s!' % username)

   async def websocket_endpoint(websocket):
       await websocket.accept()
       await websocket.send_text('Hello, websocket!')
       await websocket.close()

   def startup():
       print('Ready to go')


   routes = [
       Route('/', homepage),
       Route('/user/me', user_me),
       Route('/user/{username}', user),
       WebSocketRoute('/ws', websocket_endpoint)
   ]

   app = Starlette(debug=True, routes=routes, on_startup=[startup])
   ```

   #### NOTE
   This sample omits the static route because Unit’s quite [capable](../configuration.md#configuration-static) of serving static files itself if needed.
4. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the Starlette configuration for Unit
   (use real values for **type**, **home**, and **path**), adding a
   [route](../configuration.md#configuration-routes) to serve static content:
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "routes"
           }
       },

       "routes": [
           {
               "match": {
                   "uri": "/static/*"
               },

               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Thus, URIs starting with /static/ are served from /path/to/app/static/; use a real path in your configuration>`$uri"
               }
           },

           {
               "action": {
                   "pass": "applications/starlette"
               }
           }
       ],

       "applications": {
           "starlette": {
               "type": "python 3.:nxt_ph:`Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the ASGI module>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any>`",
               "module": ":nxt_hint:`asgi <ASGI module filename with extension omitted>`",
               "callable": ":nxt_hint:`app <Name of the callable in the module to run>`"
           }
       }
   }
   ```
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your app should be available on the listener’s IP
   address and port:
   ```console
   $ curl http://localhost

         Hello, world!

   $ curl http://localhost/user/me

         Hello, John Doe!

   $ wscat -c ws://localhost/ws

         Connected (press CTRL+C to quit)
         < Hello, websocket!
         Disconnected (code: 1000, reason: "")
   ```
