# Falcon

To run apps built with the [Falcon](https://falcon.readthedocs.io/en/stable/)
web framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.5+ language module.
2. Create a virtual environment to install Falcon’s [PIP package](https://falcon.readthedocs.io/en/stable/user/install.html), for
   instance:
   ```console
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`X.Y.Z <Major version, minor version, and revision number>`
   $ python -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install falcon
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**X.Y** in
   this example).  Also, the app **type** in Step 5 must
   [resolve](../configuration.md#configuration-apps-common) to a similarly matching
   version; Unit doesn’t infer it from the environment.
3. Let’s try an updated version of the [quickstart app](https://falcon.readthedocs.io/en/stable/user/quickstart.html):
   ```python
   import falcon


   # Falcon follows the REST architectural style, meaning (among
   # other things) that you think in terms of resources and state
   # transitions, which map to HTTP verbs.
   class HelloUnitResource:
       def on_get(self, req, resp):
           """Handles GET requests"""
           resp.status = falcon.HTTP_200  # This is the default status
           resp.content_type = falcon.MEDIA_TEXT  # Default is JSON, so override
           resp.text = ('Hello, Unit!')

   # falcon.App instances are callable WSGI apps
   # in larger applications the app is created in a separate file
   app = falcon.App()

   # Resources are represented by long-lived class instances
   hellounit = HelloUnitResource()

   # hellounit will handle all requests to the '/unit' URL path
   app.add_route('/unit', hellounit)
   ```

   Note that we’ve dropped the server code; save the file as
   **/path/to/app/wsgi.py**.
   ```python
   import falcon
   import falcon.asgi


   # Falcon follows the REST architectural style, meaning (among
   # other things) that you think in terms of resources and state
   # transitions, which map to HTTP verbs.
   class HelloUnitResource:
       async def on_get(self, req, resp):
           """Handles GET requests"""
           resp.status = falcon.HTTP_200  # This is the default status
           resp.content_type = falcon.MEDIA_TEXT  # Default is JSON, so override
           resp.text = ('Hello, Unit!')

   # falcon.asgi.App instances are callable ASGI apps...
   # in larger applications the app is created in a separate file
   app = falcon.asgi.App()

   # Resources are represented by long-lived class instances
   hellounit = HelloUnitResource()

   # hellounit will handle all requests to the '/unit' URL path
   app.add_route('/unit', hellounit)
   ```

   Save the file as **/path/to/app/asgi.py**.

1. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
2. Next, [prepare](../configuration.md#configuration-python) the configuration for Unit (use
   real values for **type**, **home**, **module**,
   **protocol**, and **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/falcon"
           }
       },

       "applications": {
           "falcon": {
               "type": "python :nxt_ph:`X.Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the WSGI module; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any; use a real path in your configuration>`",
               "module": ":nxt_ph:`module_basename <WSGI/ASGI module basename with extension omitted, such as 'wsgi' or 'asgi' from Step 3>`",
               "protocol": ":nxt_ph:`wsgi_or_asgi <'wsgi' or 'asgi', as appropriate>`",
               "callable": ":nxt_hint:`app <Name of the callable in the module to run>`"
           }
       }
   }
   ```
3. Upload the updated configuration.  Assuming the JSON above was added to
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
   $ curl http://localhost/unit

         Hello, Unit!
   ```
