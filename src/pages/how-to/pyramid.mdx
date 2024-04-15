---
layout: "@layouts/BaseLayout.astro"
title: Pyramid
---
# Pyramid

To run apps built with the [Pyramid](https://trypyramid.com) web framework
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3 language module.
2. Create a virtual environment to install Pyramid’s [PIP package](https://docs.pylonsproject.org/projects/pyramid/en/latest/narr/install.html#installing-pyramid-on-a-unix-system):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <Arbitrary name of the virtual environment>`
   $ source :nxt_hint:`venv <Name of the virtual environment from the previous command>`/bin/activate
   $ pip install pyramid
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches the
   language module from Step 1 up to the minor number (**3.Y** in this
   example).  Also, the app **type** in Step 5 must [resolve](../configuration.md#configuration-apps-common) to a similarly matching version; Unit doesn’t
   infer it from the environment.

   #### NOTE
   Here, **$VENV** isn’t set because Unit picks up the virtual
   environment from **home** in Step 5.
3. Let’s see how the apps from the Pyramid [tutorial](https://docs.pylonsproject.org/projects/pyramid/en/latest/quick_tutorial)
   run on Unit.

   We modify the [tutorial app](https://docs.pylonsproject.org/projects/pyramid/en/latest/quick_tutorial/hello_world.html#steps),
   saving it as **/path/to/app/wsgi.py**:
   ```python
   from pyramid.config import Configurator
   from pyramid.response import Response

   def hello_world(request):
       return Response('<body><h1>Hello, World!</h1></body>')

   with Configurator() as config:
       config.add_route('hello', '/')
       config.add_view(hello_world, route_name='hello')
       :nxt_hint:`app <Callable's name is used in Unit configuration>` = config.make_wsgi_app()
   # serve(app, host='0.0.0.0', port=6543)
   ```

   Note that we’ve dropped the server code; also, mind that Unit imports
   the module, so the **if \_\_name_\_ == ‘_\_main_\_’** idiom would be
   irrelevant.

   To load the [configuration](https://docs.pylonsproject.org/projects/pyramid/en/latest/quick_tutorial/ini.html),
   we place a **wsgi.py** file next to **development.ini** in
   **/path/to/app/**:
   ```python
   from pyramid.paster import get_app, setup_logging

   :nxt_hint:`app <Callable's name is used in Unit configuration>` = get_app('development.ini')
   setup_logging('development.ini')
   ```

   This [sets up](https://docs.pylonsproject.org/projects/pyramid/en/latest/api/paster.html)
   the WSGI application for Unit; if the **.ini**’s pathname is
   relative, provide the appropriate **working_directory** in Unit
   configuration.
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-python) the Pyramid configuration
   for Unit (use real values for **type**, **home**, and
   **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/pyramid"
           }
       },

       "applications": {
           "pyramid": {
               "type": "python 3.:nxt_ph:`Y <Must match language module version and virtual environment version>`",
               "working_directory": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment, if any>`",
               "module": ":nxt_hint:`wsgi <WSGI module filename with extension omitted>`",
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

         <body><h1>Hello, World!</h1></body>
   ```
