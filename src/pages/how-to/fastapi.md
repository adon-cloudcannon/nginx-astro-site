---
layout: "@layouts/BaseLayout.astro"
title: SSL/TLS certificates
---
# FastAPI

To run apps built with the [FastAPI](https://fastapi.tiangolo.com) web framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.6+ language module.
2. Create a virtual environment to install FastAPI’s [PIP package](https://fastapi.tiangolo.com/tutorial/#install-fastapi):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install fastapi
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**3.Y** in this
   example).  Also, the app **type** in Step 5 must [resolve](../configuration.md#configuration-apps-common) to a similarly matching version; Unit doesn’t
   infer it from the environment.
3. Let’s try a version of a [tutorial app](https://fastapi.tiangolo.com/tutorial/first-steps/),
   saving it as **/path/to/app/asgi.py**:
   ```python
   from fastapi import FastAPI

   app = FastAPI()

   @app.get("/")
   async def root():
       return {"message": "Hello, World!"}
   ```

   #### NOTE
   For something more true-to-life, try the
   [RealWorld example app](https://github.com/nsidnev/fastapi-realworld-example-app); just
   install all its dependencies in the same virtual environment where you’ve
   installed FastAPI and add the app’s **environment** [variables](../configuration.md#configuration-apps-common) like **DB_CONNECTION** or
   **SECRET_KEY** directly to the app configuration in Unit instead of
   the **.env** file.
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the FastAPI configuration for
   Unit (use real values for **type**, **home**, and **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/fastapi"
           }
       },

       "applications": {
           "fastapi": {
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
   $ curl http://localhost

         Hello, World!
   ```

   Alternatively, try FastAPI’s nifty self-documenting features:

![FastAPI on Unit - Swagger Screen](/fastapi.png)
