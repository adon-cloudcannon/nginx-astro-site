# Django

To run apps based on the Django [framework](https://www.djangoproject.com)
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3 language module.
2. Install and configure the Django [framework](https://www.djangoproject.com).  The official docs [recommend](https://docs.djangoproject.com/en/stable/topics/install/#installing-an-official-release-with-pip)
   setting up a virtual environment; if you do, list it as **home** when
   configuring Unit later.  Here, it’s **/path/to/venv/**.
3. Create a Django [project](https://docs.djangoproject.com/en/stable/intro/tutorial01/).  Here, we
   install it at **/path/to/app/**; use a real path in your configuration.
   The following steps assume your project uses [basic directory structure](https://docs.djangoproject.com/en/stable/ref/django-admin/#django-admin-startproject):
   ```none
   :nxt_ph:`/path/to/app/ <Project directory>`
   |-- manage.py
   |-- :nxt_hint:`django_app1/ <Individual app directory>`
   |   |-- ...
   |-- :nxt_hint:`django_app2/ <Individual app directory>`
   |   |-- ...
   |-- :nxt_hint:`project/ <Project subdirectory>`
   |   |-- ...
   |   |-- :nxt_hint:`asgi.py <ASGI application module>`
   |   `-- :nxt_hint:`wsgi.py <WSGI application module>`
   `-- :nxt_hint:`static/ <Static files subdirectory>`
   ```
4. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, prepare the Django [configuration](../configuration.md#configuration-python) for
   Unit.  Here, the **/path/to/app/** directory is stored in the
   **path** option; the virtual environment is **home**; the WSGI or
   ASGI module in the **project/** subdirectory is [imported](https://docs.python.org/3/reference/import.html) via **module**.  If
   you reorder your directories, [set up](../configuration.md#configuration-python)
   **path**, **home**, and **module** accordingly.

   You can also set up some environment variables that your project relies on,
   using the **environment** option.  Finally, if your project uses Django’s
   [static files](https://docs.djangoproject.com/en/stable/howto/static-files/), optionally
   add a [route](../configuration.md#configuration-routes) to [serve](../configuration.md#configuration-static) them with Unit.

   Here’s an example (use real values for **share**, **path**,
   **environment**, **module**, and **home**):
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
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Thus, URIs starting with /static/ are served from /path/to/app/static/>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/django"
               }
           }
       ],

       "applications": {
           "django": {
               "type": "python :nxt_ph:`3.X <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Project directory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/venv/ <Virtual environment directory; use a real path in your configuration>`",
               "module": ":nxt_ph:`project.wsgi <Note the qualified name of the WSGI module; use a real project directory name in your configuration>`",
               ":nxt_hint:`environment <App-specific environment variables>`": {
                   "DJANGO_SETTINGS_MODULE": "project.settings",
                   "DB_ENGINE": "django.db.backends.postgresql",
                   "DB_NAME": "project",
                   "DB_HOST": "127.0.0.1",
                   "DB_PORT": "5432"
               }
           }
       }
   }
   ```

   #### NOTE
   ASGI requires Python 3.5+ and Django 3.0+.

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
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Thus, URIs starting with /static/ are served from /path/to/app/static/>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/django"
               }
           }
       ],

       "applications": {
           "django": {
               "type": "python :nxt_ph:`3.X <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Project directory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/venv/ <Virtual environment directory; use a real path in your configuration>`",
               "module": ":nxt_ph:`project.asgi <Note the qualified name of the ASGI module; use a real project directory name in your configuration>`",
               ":nxt_hint:`environment <App-specific environment variables>`": {
                   "DJANGO_SETTINGS_MODULE": "project.settings",
                   "DB_ENGINE": "django.db.backends.postgresql",
                   "DB_NAME": "project",
                   "DB_HOST": "127.0.0.1",
                   "DB_PORT": "5432"
               }
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

   After a successful update, your project and apps should be available on the
   listener’s IP address and port:
   ![Django on Unit - Admin Login Screen](images/django.png)
