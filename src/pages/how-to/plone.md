---
layout: "@layouts/BaseLayout.astro"
title: Plone
---
# Plone

To run the [Plone](https://plone.org) content management system using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.6+ language module.
2. Install and configure Plone’s [prerequisites](https://docs.plone.org/manage/installing/requirements.html).
3. Install Plone’s [core files](https://docs.plone.org/manage/installing/installation.html).  Here, we install it at **/path/to/app/**;
   use a real path in your configuration:
   ```bash
   $ mkdir /tmp/plone && cd /tmp/plone/
   $ wget https://launchpad.net/plone/:nxt_ph:`A.B <Plone version>`/:nxt_ph:`A.B.C <Plone version>`/+download/Plone-:nxt_ph:`A.B.C <Plone version>`-UnifiedInstaller-1.0.tgz
   $ tar xzvf Plone-:nxt_ph:`A.B.C <Plone version>`-UnifiedInstaller-1.0.tgz  \
         :nxt_hint:`--strip-components <Avoids creating a redundant subdirectory>`=1
   $ ./install.sh --target=:nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`  \
                  --with-python=:nxt_ph:`/full/path/to/python <Full pathname of the Python executable used to create Plone's virtual environment>`  \
                  standalone
   ```

   #### NOTE
   Plone’s [Zope](https://plone.org/what-is-plone/zope) instance and
   virtual environment are created in the **zinstance/** subdirectory;
   later, the resulting path is used to configure Unit, so take care to note
   it in your setup.  Also, make sure the Python version specified with
   `--with-python` matches the module version from Step 1.
4. To run Plone on Unit, add a new configuration file named
   **/path/to/app/zinstance/wsgi.cfg**:
   ```cfg
   [buildout]
   extends =
       buildout.cfg

   parts +=
       :nxt_ph:`wsgi.py <The basename is arbitrary; the extension is required to make the resulting Python module discoverable>`

   [wsgi.py]
   recipe = plone.recipe.zope2instance
   user = :nxt_ph:`admin:admin <Instance credentials; omit this line to configure them interactively>`
   eggs =
       ${instance:eggs}
   scripts =
   initialization =
       from Zope2.Startup.run import make_wsgi_app
       wsgiapp = make_wsgi_app({}, '${buildout:parts-directory}:nxt_hint:`/instance/etc/zope.conf <Path to the Zope instance's configuration>`')
       def application(*args, **kwargs):return wsgiapp(*args, **kwargs)
   ```

   It creates a new Zope instance.  The part’s name must end with **.py**
   for the resulting instance script to be recognized as a Python module; the
   **initialization** [option](https://pypi.org/project/plone.recipe.zope2instance/#common-options)
   defines a WSGI entry point using **zope.conf** from the **instance**
   part in **buildout.cfg**.

   Rerun Buildout, feeding it the new configuration file:
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`zinstance/
   $ bin/buildout -c wsgi.cfg

         ...
         Installing wsgi.py.
         Generated script '/path/to/app/zinstance/bin/wsgi.py'.
   ```

   Thus created, the instance script can be used with Unit.
5. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, [prepare](../configuration.md#configuration-python) the Plone configuration for Unit
   (use real values for **path** and **home**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/plone"
           }
       },

       "applications": {
           "plone": {
               "type": "python :nxt_ph:`3.Y <Python executable version used to install Plone>`",
               "path": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`zinstance/",
               "home": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`zinstance/",
               "module": ":nxt_hint:`bin.wsgi <WSGI module's qualified name with extension omitted>`"
           }
       }
   }
   ```
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your Plone instance should be available on the
   listener’s IP address and port:
   ![Plone on Unit - Setup Screen](/plone.png)
