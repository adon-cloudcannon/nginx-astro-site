---
layout: "@layouts/BaseLayout.astro"
title: Laravel
---
# Laravel

To run apps based on the [Laravel](https://laravel.com) framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Laravel’s [prerequisites](https://laravel.com/docs/deployment#server-requirements).
3. Create a Laravel [project](https://laravel.com/docs/installation#creating-a-laravel-project).
   For our purposes, the path is **/path/to/app/**:
   ```console
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ composer create-project laravel/laravel :nxt_ph:`app <Arbitrary app name; becomes the application directory name>`
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

   #### NOTE
   See the Laravel docs for further details on [directory structure](https://laravel.com/docs/structure).
5. Next, [prepare](../configuration.md#configuration-php) the Laravel configuration for
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
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/laravel <Uses the index.php at the root as the last resort>`"
                   }
               }
           }
       ],

       "applications": {
           "laravel": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/",
               "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
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

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://laravel.com/docs/configuration) your Laravel application:

> ![Laravel on Unit - Sample Screen](/laravel.png)
