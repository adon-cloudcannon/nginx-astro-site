---
layout: "@layouts/BaseLayout.astro"
title: MODX
---
# MODX

To run the [MODX](https://modx.com) content application platform using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure MODX’s [prerequisites](https://docs.modx.com/current/en/getting-started/server-requirements).
3. Install MODX’s [core files](https://modx.com/download).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-php) the MODX configuration for Unit
   (use real values for **share** and **root**).  The default
   **.htaccess** scheme in a MODX installation roughly translates into the
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
                   ":nxt_hint:`uri <Denies access to directories best kept private>`": [
                       "!/.well-known/",
                       "/core/*",
                       "*/.*"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Serves direct requests for PHP scripts>`": "*.php"
               },

               "action": {
                   "pass": "applications/modx"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/modx <A catch-all destination for the remaining requests>`"
                   }
               }
           }
       ],

       "applications": {
           "modx": {
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

   After a successful update, MODX should be available on the listener’s IP
   address and port:
   ![MODX on Unit - Manager Screen](/modx.png)
