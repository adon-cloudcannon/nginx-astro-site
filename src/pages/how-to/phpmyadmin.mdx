---
layout: "@layouts/BaseLayout.astro"
title: phpMyAdmin
---
# phpMyAdmin

To run the [phpMyAdmin](https://www.phpmyadmin.net) web tool using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure phpMyAdmin’s [prerequisites](https://docs.phpmyadmin.net/en/latest/require.html).
3. Install phpMyAdmin’s [core files](https://docs.phpmyadmin.net/en/latest/setup.html#quick-install-1).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.

   #### NOTE
   Make sure to create the **config.inc.php** file [manually](https://docs.phpmyadmin.net/en/latest/setup.html#manually-creating-the-file)
   or using the [setup script](https://docs.phpmyadmin.net/en/latest/setup.html#using-the-setup-script).
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-php) the phpMyAdmin configuration for Unit
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
                   "uri": ":nxt_hint:`~\\.(css|gif|html?|ico|jpg|js(on)?|png|svg|ttf|woff2?)$ <Enables access to static content only>`"
               },

               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/phpmyadmin"
               }
           }
       ],

       "applications": {
           "phpmyadmin": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
           }
       }
   }
   ```
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, phpMyAdmin should be available on the listener’s IP
   address and port:
   ![phpMyAdmin on Unit](/phpmyadmin.png)
