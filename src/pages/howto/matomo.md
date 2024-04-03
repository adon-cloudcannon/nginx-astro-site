# Matomo

To run the [Matomo](https://matomo.org) web analytics platform using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Matomo’s [prerequisites](https://matomo.org/faq/on-premise/matomo-requirements/).
3. Install Matomo’s [core files](https://matomo.org/faq/on-premise/installing-matomo/).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
4. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-php) the Matomo configuration for Unit
   (use real values for **share** and **root**).  The default
   **.htaccess** scheme in a Matomo installation roughly translates into the
   following:
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
                   ":nxt_hint:`uri <Handles all PHP scripts that should be public>`": [
                       "/index.php",
                       "/js/index.php",
                       "/matomo.php",
                       "/misc/cron/archive.php",
                       "/piwik.php",
                       "/plugins/HeatmapSessionRecording/configs.php"
                   ]
               },

               "action": {
                   "pass": "applications/matomo/direct"
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Denies access to files and directories best kept private, including internal PHP scripts>`": [
                       "*.php",
                       "*/.htaccess",
                       "/config/*",
                       "/core/*",
                       "/lang/*",
                       "/tmp/*"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   "uri": ":nxt_hint:`~\\.(css|gif|html?|ico|jpg|js(on)?|png|svg|ttf|woff2?)$ <Enables access to static content only>`"
               },

               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri"
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Disables access to certain directories that may nonetheless contain public-facing static content served by the previous rule; forwards all unhandled requests to index.php in the root directory>`": [
                       "!/libs/*",
                       "!/node_modules/*",
                       "!/plugins/*",
                       "!/vendor/*",
                       "!/misc/cron/*",
                       "!/misc/user/*"
                   ]
               },

               "action": {
                   ":nxt_hint:`share <Serves remaining static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/matomo/index <A catch-all destination for the remaining requests>`"
                   }
               }
           }
       ],

       "applications": {
           "matomo": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   }
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

   After a successful update, Matomo should be available on the listener’s IP
   address and port:
   ![Matomo on Unit](images/matomo.png)
