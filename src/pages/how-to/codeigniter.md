---
layout: "@layouts/BaseLayout.astro"
title: CodeIgniter
---
# CodeIgniter

To run apps built with the [CodeIgniter](https://codeigniter.com) web
framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Download CodeIgniter’s [core files](https://codeigniter.com/user_guide/installation/index.html) and [build](https://codeigniter.com/user_guide/tutorial/index.html) your application.
   Here, let’s use a [basic app template](https://forum.codeigniter.com/thread-73103.html), installing it at
   **/path/to/app/**.
3. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-php) the CodeIgniter configuration for
   Unit:
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
                   "uri": ":nxt_hint:`!/index.php <Denies access to index.php as a static file>`"
               },

               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public$uri",
                   "fallback": {
                       ":nxt_hint:`pass <Serves any requests not served with the 'share' immediately above>`": "applications/codeigniter"
                   }
               }
           }
       ],

       "applications": {
           "codeigniter": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/",
               "script": ":nxt_hint:`index.php <All requests are served by a single script>`"
           }
       }
   }
   ```
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your app should be available on the listener’s IP
   address and port:

> ![CodeIgniter Sample App on Unit](/codeigniter.png)
