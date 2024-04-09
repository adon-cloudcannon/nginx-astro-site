---
layout: "@layouts/BaseLayout.astro"
title: Zope
---
# Zope

To run apps built with the [Zope](https://www.zope.dev/) web framework using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.6+ language module.
2. Install Zope.  Here, we do this at **/path/to/app/**; use a real path
   in your configuration.

   First, install Zope’s [core files](https://zope.readthedocs.io/en/latest/INSTALL.html#installing-zope-with-zc-buildout),
   for example:
   ```bash
   $ pip install -U pip wheel zc.buildout
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ wget https://pypi.org/packages/source/Z/Zope/Zope-:nxt_ph:`A.B.C <Zope version>`.tar.gz
   $ tar xfvz Zope-:nxt_ph:`A.B.C <Zope version>`.tar.gz :nxt_hint:`--strip-components <Avoids creating a redundant subdirectory>`=1
   $ buildout
   ```

   Next, add a new configuration file named
   **/path/to/app/wsgi.cfg**:
   ```cfg
   [buildout]
   extends =
       buildout.cfg

   parts +=
       :nxt_ph:`wsgi.py <The basename is arbitrary; the extension is required to make the resulting Python module discoverable>`

   [wsgi.py]
   recipe = plone.recipe.zope2instance
   user = :nxt_ph:`admin:admin <Instance credentials; omit this line to configure them interactively>`
   zodb-temporary-storage = :nxt_hint:`off <Avoids compatibility issues>`
   eggs =
   scripts =
   initialization =
       from Zope2.Startup.run import make_wsgi_app
       wsgiapp = make_wsgi_app({}, '${buildout:parts-directory}:nxt_hint:`/wsgi.py/etc/zope.conf <Path to the instance's configuration file>`')
       def application(*args, **kwargs):return wsgiapp(*args, **kwargs)
   ```

   It creates a new Zope instance.  The part’s name must end with
   **.py** for the resulting instance script to be recognized as a
   Python module; the **initialization** [option](https://pypi.org/project/plone.recipe.zope2instance/#common-options)
   defines a WSGI entry point.

   Rerun Buildout, feeding it the new configuration file:
   ```bash
   $ buildout -c wsgi.cfg

         ...
         Installing wsgi.py.
         Generated script '/path/to/app/bin/wsgi.py'.
   ```

   Thus created, the instance script can be used with Unit.

   Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).

   Last, [prepare](../configuration.md#configuration-python) the Zope configuration
   for Unit (use a real value for **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/zope"
           }
       },

       "applications": {
           "zope": {
               "type": "python 3",
               "path": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "module": ":nxt_hint:`bin.wsgi <WSGI module's qualified name with extension omitted>`"
           }
       }
   }
   ```

   Create a virtual environment to install Zope’s [PIP package](https://pypi.org/project/Zope/):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ :nxt_hint:`python3 --version <Make sure your virtual environment version matches the module version>`
         Python :nxt_hint:`3.Y.Z <Major version, minor version, and revision number>`
   $ python3 -m venv :nxt_hint:`venv <This is the virtual environment directory>`
   $ source venv/bin/activate
   $ pip install 'zope[wsgi]'
   $ deactivate
   ```

   #### WARNING
   Create your virtual environment with a Python version that matches
   the language module from Step 1 up to the minor number
   (**3.Y** in this example).  Also, the app **type** in Unit
   configuration must [resolve](../configuration.md#configuration-apps-common) to a
   similarly matching version; Unit doesn’t infer it from the
   environment.

   After installation, create your Zope [instance](https://zope.readthedocs.io/en/latest/operation.html#creating-a-zope-instance):
   ```bash
   $ :nxt_hint:`venv/bin/mkwsgiinstance <Zope's own script>` -d :nxt_ph:`instance <The Zope instance's home directory>`
   ```

   To run the instance on Unit, create a WSGI entry point:
   ```python
   from pathlib import Path
   from Zope2.Startup.run import make_wsgi_app

   wsgiapp = make_wsgi_app({}, :nxt_hint:`str(Path(__file__).parent / 'etc/zope.conf' <Path to the instance's configuration file>`))
   def application(*args, **kwargs):return wsgiapp(*args, **kwargs)
   ```

   Save the script as **wsgi.py** in the instance home directory
   (here, it’s **/path/to/app/instance/**).

   Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).

   Last, [prepare](../configuration.md#configuration-python) the Zope configuration
   for Unit (use real values for **path** and **home**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/zope"
           }
       },

       "applications": {
           "zope": {
               "type": "python :nxt_ph:`3.Y <Must match language module version and virtual environment version>`",
               "path": ":nxt_ph:`/path/to/app/instance/ <Path to the instance/ subdirectory; use a real path in your configuration>`",
               "home": ":nxt_ph:`/path/to/app/venv/ <Path to the virtual environment; use a real path in your configuration>`",
               "module": ":nxt_hint:`wsgi <WSGI module basename with extension omitted>`"
           }
       }
   }
   ```
3. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your Zope instance should be available on the
   listener’s IP address and port:
   ```bash
   $ curl http://localhost

         <!DOCTYPE html>
         <html>
           <head>
         <base href="http://localhost/" />

             <title>Auto-generated default page</title>
             <meta charset="utf-8" />
           </head>
           <body>

             <h2>Zope
                 Auto-generated default page</h2>

             This is Page Template <em>index_html</em>.
           </body>
         </html>
   ```
