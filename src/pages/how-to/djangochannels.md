---
layout: "@layouts/BaseLayout.astro"
title: Django Channels
---
# Django Channels

To run Django apps using the Django Channels [framework](https://channels.readthedocs.io/en/stable/) with Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.6+ language module.
2. Install and configure the Django 3.0+ [framework](https://www.djangoproject.com).  The official docs [recommend](https://docs.djangoproject.com/en/stable/topics/install/#installing-an-official-release-with-pip)
   setting up a virtual environment; if you do, list it as **home** when
   configuring Unit later.  Here, it’s **/path/to/venv/**.
3. Install Django Channels in your virtual environment:
   > ```bash
   > $ cd :nxt_ph:`/path/to/venv/ <Path to the virtual environment; use a real path in your configuration>`
   > $ source bin/activate
   > $ pip install channels
   > $ deactivate
   > ```
4. Create a Django project.  Here, we’ll use the [tutorial chat app](https://channels.readthedocs.io/en/stable/tutorial/part_1.html#tutorial-part-1-basic-setup),
   installing it at **/path/to/app/**; use a real path in your
   configuration.  The following steps assume your project uses [basic
   directory structure](https://docs.djangoproject.com/en/stable/ref/django-admin/#django-admin-startproject):
   ```none
   :nxt_ph:`/path/to/app/ <Project directory>`
   |-- manage.py
   |-- :nxt_hint:`chat/ <Individual app directory>`
   |   |-- ...
   |-- :nxt_hint:`mysite/ <Project subdirectory>`
   |   |-- ...
   |   `-- :nxt_hint:`asgi.py <ASGI application module>`
   `-- :nxt_hint:`static/ <Static files subdirectory>`
   ```
5. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Integrate Django Channels into your project according to the official [Channels guide](https://channels.readthedocs.io/en/stable/tutorial/part_1.html#integrate-the-channels-library).
7. Next, create the Django Channels [configuration](../configuration.md#configuration-python) for
   Unit.  Here, the **/path/to/app/** directory is stored in the
   **path** option; the virtual environment is **home**; the ASGI
   module in the **mysite/** subdirectory is [imported](https://docs.python.org/3/reference/import.html) via **module**.  If
   you reorder your directories, [set up](../configuration.md#configuration-python)
   **path**, **home**, and **module** accordingly.

   You can also set up some environment variables that your project relies on,
   using the **environment** option.  Finally, if your project uses
   Django’s [static files](https://docs.djangoproject.com/en/stable/howto/static-files/), optionally
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
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Thus, URIs starting with /static/ are served from /path/to/app/static/; use a real path in your configuration>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/djangochannels"
               }
           }
       ],

       "applications": {
           "djangochannels": {
               "type": "python :nxt_ph:`3.X <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/ <Project directory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/venv/ <Virtual environment directory; use a real path in your configuration>`",
               "module": ":nxt_ph:`mysite.asgi <Note the qualified name of the ASGI module; use a real site directory name in your configuration>`",
               ":nxt_hint:`environment <App-specific environment variables>`": {
                   "DJANGO_SETTINGS_MODULE": "mysite.settings"
               }
           }
       }
   }
   ```
8. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your project and apps (here, a chat) run on
   the listener’s IP address and port:
   ![Django Channels on Unit - Tutorial App Screen](/djangochannels.png)
