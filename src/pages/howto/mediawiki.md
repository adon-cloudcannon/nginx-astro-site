# MediaWiki

To run the [MediaWiki](https://www.mediawiki.org) collaboration and
documentation platform using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install MediaWiki’s [core files](https://www.mediawiki.org/wiki/Download).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
3. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-php) the MediaWiki configuration for Unit
   (use real values for **share** and **root**):
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
                   ":nxt_hint:`uri <Controls access to directories best kept private>`": [
                       "!/tests/qunit/*",
                       "/cache/*",
                       "/includes/*",
                       "/languages/*",
                       "/maintenance/*",
                       "/tests/*",
                       "/vendor/*"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Enables access to application entry points>`": [
                       "/api.php*",
                       "/img_auth.php*",
                       "/index.php*",
                       "/load.php*",
                       "/mw-config/*.php",
                       "/opensearch_desc.php*",
                       "/profileinfo.php*",
                       "/rest.php*",
                       "/tests/qunit/*.php",
                       "/thumb.php*",
                       "/thumb_handler.php*"
                   ]
               },

               "action": {
                   "pass": "applications/mw/direct"
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Enables static access to specific content locations>`": [
                       "!*.php",
                       "!*.json",
                       ":nxt_hint:`!*.htaccess <The negations deny access to the file types listed here>`",
                       "/extensions/*",
                       "/images/*",
                       "/resources/assets/*",
                       "/resources/lib/*",
                       "/resources/src/*",
                       "/skins/*"
                   ]
               },

               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/mw/index"
               }
           }
       ],

       "applications": {
           "mw": {
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

   #### NOTE
   The difference between the **pass** targets is their usage of the
   **script** [setting](../configuration.md#configuration-php):
   - The **direct** target runs the **.php** script from the URI or
     defaults to **index.php** if the w omits it.
   - The **index** target specifies the **script** that Unit runs
     for *any* URIs the target receives.
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.
6. Browse to [http://localhost/mw-config/index.php](http://localhost/mw-config/index.php) and set MediaWiki up using
   the settings noted earlier:
   ![MediaWiki on Unit](images/mw_install.png)

   Download the newly generated **LocalSettings.php** file and place it
   [appropriately](https://www.mediawiki.org/wiki/Manual:Config_script):
   ```console
   $ chmod 600 LocalSettings.php
   # chown :nxt_ph:`unit:unit <Values from Step 3>` LocalSettings.php
   # mv LocalSettings.php :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   ```
7. After installation, add a match condition to the first step to disable
   access to the **mw-config/** directory:
   ```console
   # curl -X POST -d '"/mw-config/*"'  \
          --unix-socket :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>`  \
          http://localhost:nxt_hint:`/config/routes/mediawiki/0/match/uri/ <Path to the route's first step condition and the 'uri' value in it>`

         {
             "success": "Reconfiguration done."
         }
   ```

   After a successful update, MediaWiki should be available on the listener’s IP
   address and port:
   ![MediaWiki on Unit](images/mw_ready.png)
