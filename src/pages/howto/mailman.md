# Mailman Web

To install and run the web UI for the [Mailman 3](https://docs.list.org/en/latest/index.html)  suite using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 3.7+ language module.
2. Follow Mailman’s [guide](https://docs.list.org/en/latest/install/virtualenv.html#virtualenv-install)
   to install its prerequisites and core files, but stop at [setting up a WSGI
   server](https://docs.list.org/en/latest/install/virtualenv.html#setting-up-a-wsgi-server);
   we’ll use Unit instead.  Also, note the following settings (values from the
   guide are given after the colon):
   - Virtual environment path: **/opt/mailman/venv/**
   - Installation path: **/etc/mailman3/**
   - Static file path: **/opt/mailman/web/static/**
   - User and group: **mailman:mailman**

   These are needed to configure Unit.
3. Run the following command so Unit can access Mailman’s static files:
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_hint:`/opt/mailman/web/static/ <Mailman's static file path>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with
   [official packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ;
   run the **ps aux | grep unitd** command to be sure.

   Alternatively, add Unit’s unprivileged user account to Mailman’s group so Unit
   can access the static files:
   ```console
   # usermod -a -G :nxt_hint:`mailman <Mailman's user group noted in Step 2>` :nxt_hint:`unit <User that Unit's router runs as by default>`
   ```
4. Next, prepare the Mailman [configuration](../configuration.md#configuration-python) for Unit
   (use values from Step 2 for **share**, **path**, and **home**):
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
                   "uri": ":nxt_hint:`/static/* <Matches requests for web UI's static content>`"
               },

               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_hint:`/opt/mailman/web/ <Mailman's static file path without the 'static/' part; URIs starting with /static/ are thus served from /opt/mailman/web/static/>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/mailman_web"
               }
           }
       ],

       "applications": {
           "mailman_web": {
               "type": "python :nxt_ph:`3.X <Must match language module version and virtual environment version>`",
               "path": ":nxt_hint:`/etc/mailman3/ <Mailman's installation path you noted in Step 2>`",
               "home": ":nxt_hint:`/opt/mailman/venv/ <Mailman's virtual environment path you noted in Step 2>`",
               "module": ":nxt_hint:`mailman_web.wsgi <Qualified name of the WSGI module, relative to installation path>`",
               "user": ":nxt_hint:`mailman <Mailman's user group noted in Step 2>`",
               ":nxt_hint:`environment <App-specific environment variables>`": {
                   "DJANGO_SETTINGS_MODULE": ":nxt_hint:`settings <Web configuration module name, relative to installation path>`"
               }
           }
       }
   }
   ```
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, Mailman’s web UI should be available on the
   listener’s IP address and port:
   ![Mailman on Unit - Lists Screen](images/mailman.png)
