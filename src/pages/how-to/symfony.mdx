---
layout: "@layouts/BaseLayout.astro"
title: Symfony
---
# Symfony

To run apps built with the [Symfony](https://symfony.com) framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP 7.2.5+ language module.
2. Next, [install](https://symfony.com/doc/current/setup.html) Symfony and
   create or deploy your app.  Here, we use Symfony’s [reference app](https://symfony.com/doc/current/setup.html#the-symfony-demo-application):
   ```bash
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ symfony new --demo :nxt_ph:`app <Arbitrary app name>`
   ```

   This creates the app’s directory tree at **/path/to/app/**.  Its
   **public/** subdirectory contains both the root **index.php** and
   the static files; if your app requires additional **.php** scripts, also
   store them here.
3. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-php) the Symfony configuration for Unit
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
                   ":nxt_hint:`uri <Handles all direct script-based requests>`": [
                       "*.php",
                       "*.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/symfony/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/symfony/index <Uses the index.php at the root as the last resort>`"
                   }
               }
           }
       ],

       "applications": {
           "symfony": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public/",
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
     defaults to **index.php** if the URI omits it.
   - The **index** target specifies the **script** that Unit runs
     for *any* URIs the target receives.

   For a detailed discussion, see [Configuring a Web Server](https://symfony.com/doc/current/setup/web_server_configuration.html) in
   Symfony docs.
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your project and apps should be available on the
   listener’s IP address and port:
   ![Symfony Demo App on Unit - Admin Post Update](/symfony.png)
