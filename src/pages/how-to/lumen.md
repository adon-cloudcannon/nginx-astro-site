---
layout: "@layouts/BaseLayout.astro"
title: Lumen
---
# Lumen

To run apps based on the [Lumen](https://lumen.laravel.com) framework using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Lumen’s [prerequisites](https://lumen.laravel.com/docs/8.x#server-requirements).
3. Create a Lumen [project](https://lumen.laravel.com/docs/8.x#installing-lumen).
   For our purposes, the path is **/path/to/app/**:
   ```bash
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ composer create-project laravel/lumen :nxt_ph:`app <Arbitrary app name; becomes the application directory name>`
   ```
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-php) the Lumen configuration for
   Unit (use real values for **share** and **root**):
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
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/lumen <Uses the index.php at the root as the last resort>`"
                   }
               }
           }
       ],

       "applications": {
           "lumen": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/",
               "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
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

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://lumen.laravel.com/docs/8.x/configuration) your Lumen application.
