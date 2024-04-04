---
layout: "@layouts/BaseLayout.astro"
title: Bottle
---
# Bottle

To run apps built with the [Bottle](https://bottlepy.org/docs/dev/) web
framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 2.7+ language module.
2. Create a virtual environment to install Bottle’s [PIP package](https://bottlepy.org/docs/dev/tutorial.html#installation), for
   instance:
   ```console
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`X.Y.Z <Major version, minor version, and revision number>`
   $ python -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install bottle
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**X.Y** in
   this example).  Also, the app **type** in Step 5 must
   [resolve](../configuration.md#configuration-apps-common) to a similarly matching
   version; Unit doesn’t infer it from the environment.
3. Let’s try an updated version of the [quickstart app](https://bottlepy.org/docs/dev/tutorial.html#the-default-application),
   saving it as **/path/to/app/wsgi.py**:
   ```python
   from bottle import Bottle, template

   :nxt_hint:`app <Callable name used in Unit's configuration>` = Bottle()

   @app.route('/hello/<name>')
   def hello(name):
       return template('Hello, {{name}}!', name=name)

   # run(app, host='localhost', port=8080)
   ```

   Note that we’ve dropped the server code.
4. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the Bottle configuration for
   Unit (use real values for **type**, **home**, and **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/bottle"
           }
       },

       "applications": {
           "bottle": {
               "type": "python :nxt_ph:`X.Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the WSGI module; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any; use a real path in your configuration>`",
               "module": ":nxt_hint:`wsgi <WSGI module basename with extension omitted>`",
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
   $ curl http://localhost/hello/Unit

         Hello, Unit!
   ```
