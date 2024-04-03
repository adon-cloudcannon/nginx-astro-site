# DokuWiki

To run the [DokuWiki](https://www.dokuwiki.org) content management system
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure DokuWiki’s [prerequisites](https://www.dokuwiki.org/requirements).
3. Install DokuWiki’s [core files](https://www.dokuwiki.org/install).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
   ```console
   $ mkdir -p :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>` && cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ wget https://download.dokuwiki.org/src/dokuwiki/dokuwiki-stable.tgz
   $ tar xvzf dokuwiki-stable.tgz :nxt_hint:`--strip-components <Avoids creating a redundant subdirectory>`=1
   $ rm dokuwiki-stable.tgz
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
                       "/data/*",
                       "/conf/*",
                       "/bin/*",
                       "/inc/*",
                       "/vendor/*"
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
                       "*.php"
                   ]
               },

               "action": {
                   "pass": "applications/dokuwiki"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
               }
           }
       ],

       "applications": {
           "dokuwiki": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "index": ":nxt_hint:`doku.php <The app's main script>`"
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

   After a successful update, your app should be available on the listener’s IP
   address and port.
7. Browse to **/install.php** to complete your [installation](https://www.dokuwiki.org/installer):
   ![DokuWiki on Unit - Installation Screen](images/dokuwiki.png)
