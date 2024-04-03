# phpBB

To run the [phpBB](https://www.phpbb.com) bulletin board using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure phpBB’s [prerequisites](https://www.phpbb.com/support/docs/en/3.3/ug/quickstart/requirements/).
3. Install phpBB’s [core files](https://www.phpbb.com/downloads/).  Here, we install it at **/path/to/app/**; use
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
5. Next, prepare the app [configuration](../configuration.md#configuration-php) for Unit (use
   real values for **share** and **root**):
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
                   ":nxt_hint:`uri <Denies access to files and directories best kept private>`": [
                       "/cache/*",
                       "/common.php*",
                       "/config.php*",
                       "/config/*",
                       "/db/migration/data/*",
                       "/files/*",
                       "/images/avatars/upload/*",
                       "/includes/*",
                       "/store/*"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   "uri": [
                       "/",
                       "*.php",
                       "*.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/phpbb/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/phpbb/index <Catch-all for requests not yet served by other rules>`"
                   }
               }
           }
       ],

       "applications": {
           "phpbb": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
                       "script": "app.php"
                   }
               }
           }
       }
   }
   ```

   #### NOTE
   The difference between the **pass** targets is their usage of the
   **script** [setting](../configuration.md#configuration-php):
   - The **direct** target runs the **.php** script from the URI or
     defaults to **index.php** if the URI omits it.
   - The **index** target specifies the **script** that Unit runs
     for *any* URIs the target receives.
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
   ![phpBB on Unit](images/phpbb.png)
7. Browse to **/install/app.php** to complete your installation.  Having
   done that, delete the **install/** subdirectory to mitigate security
   risks:
   ```console
   $ rm -rf :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`install/
   ```
