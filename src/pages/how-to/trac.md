---
layout: "@layouts/BaseLayout.astro"
title: Trac
---
# Trac

#### WARNING
So far, Unit doesn’t support handling the **REMOTE_USER** headers
directly, so authentication should be implemented via external means.  For
example, consider using [trac-oidc](https://pypi.org/project/trac-oidc/) or
[OAuth2Plugin](https://trac-hacks.org/wiki/OAuth2Plugin).

To run the [Trac](https://trac.edgewall.org) issue tracking system using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 2 language module.

   #### NOTE
   As of now, Trac [doesn’t fully support](https://trac.edgewall.org/ticket/12130) Python 3.  Mind that Python 2
   is officially deprecated.
2. Prepare and activate a [virtual environment](https://virtualenv.pypa.io/en/latest/) to contain your installation
   (assuming **virtualenv** is installed):
   ```console
   $ mkdir -p :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ virtualenv venv
   $ source venv/bin/activate
   ```
3. Next, [install Trac](https://trac.edgewall.org/wiki/TracInstall) and its
   optional dependencies, then initialize a [Trac environment](https://trac.edgewall.org/wiki/TracEnvironment) and deploy static files:
   ```console
   $ pip install Trac
   $ pip install babel docutils genshi \
                 pygments pytz textile             # optional dependencies
   $ mkdir :nxt_ph:`static/ <Arbitrary directory name>`                                 # will store Trac's /chrome/ tree
   $ mkdir :nxt_ph:`trac_env/ <Arbitrary directory name>`
   $ trac-admin trac_env/ initenv                  # initialize Trac environment
   $ trac-admin trac_env/ deploy static/           # extract Trac's static files
   $ mv static/htdocs static/chrome                # align static file paths
   $ rm -rf static/cgi-bin/                        # remove unneeded files
   $ deactivate
   ```
4. Unit [uses WSGI](../configuration.md#configuration-python) to run Python apps, so a
   [wrapper](https://trac.edgewall.org/wiki/1.3/TracModWSGI#Averybasicscript)
   script is required to run Trac as a Unit app; let’s save it as
   **/path/to/app/trac_wsgi.py**.  Here, the **application** callable
   serves as the entry point for the app:
   > ```python
   > import trac.web.main

   > def application(environ, start_response):
   >     environ["trac.locale"] = "en_US.UTF8"
   >     return trac.web.main.dispatch_request(environ, start_response)
   > ```
5. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, [prepare](../configuration.md#configuration-python) the Trac configuration for Unit
   (use real values for **share**, **path**, **home**,
   **module**, **TRAC_ENV**, and **PYTHON_EGG_CACHE**):
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
                   "uri": "/chrome/*"
               },
               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app/static <Path to the static files; use a real path in your configuration>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/trac"
               }
           }
       ],

       "applications": {
           "trac": {
               "type": "python 2",
               "path": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`venv/",
               "module": ":nxt_hint:`trac_wsgi <WSGI module basename from Step 4 with extension omitted>`",
               "environment": {
                   "TRAC_ENV": ":nxt_ph:`/path/to/app/trac_env/ <Path to the Trac environment; use a real path in your configuration>`",
                   "PYTHON_EGG_CACHE": ":nxt_ph:`/path/to/app/trac_env/ <Path to the Python egg cache for Trac; use a real path in your configuration>`eggs/"
               }
           }
       }
   }
   ```

   The route serves requests for static files in Trac’s **/chrome/**
   [hierarchy](https://trac.edgewall.org/wiki/TracDev/TracURLs) from the
   **static/** directory.
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, Trac should be available on the listener’s IP
   address and port:
   ![Trac on Unit - New Ticket Screen](/trac.png)
