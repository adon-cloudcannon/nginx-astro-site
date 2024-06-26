---
layout: "@layouts/BaseLayout.astro"
title: Drupal
---
# Drupal

To run the [Drupal](https://www.drupal.org) content management system using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Drupal’s [prerequisites](https://www.drupal.org/docs/system-requirements).
3. Install Drupal’s [core files](https://www.drupal.org/docs/develop/using-composer/manage-dependencies#download-core).  Here, we install it at **/path/to/app/**; use
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
5. Next, [prepare](../configuration.md#configuration-php) the Drupal configuration for Unit.
   The default **.htaccess** [scheme](https://github.com/drupal/drupal)
   in a Drupal installation roughly translates into the following (use real
   values for **share** and **root**):
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
                   ":nxt_hint:`uri <Denies access to certain types of files and directories best kept hidden, allows access to well-known locations according to RFC 5785>`": [
                       "!*/.well-known/*",
                       "/vendor/*",
                       "/core/profiles/demo_umami/modules/demo_umami_content/default_content/*",
                       "*.engine",
                       "*.inc",
                       "*.install",
                       "*.make",
                       "*.module",
                       "*.po",
                       "*.profile",
                       "*.sh",
                       "*.theme",
                       "*.tpl",
                       "*.twig",
                       "*.xtmpl",
                       "*.yml",
                       "*/.*",
                       "*/Entries*",
                       "*/Repository",
                       "*/Root",
                       "*/Tag",
                       "*/Template",
                       "*/composer.json",
                       "*/composer.lock",
                       "*/web.config",
                       "*sql",
                       "*.bak",
                       "*.orig",
                       "*.save",
                       "*.swo",
                       "*.swp",
                       "*~"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Allows direct access to core PHP scripts>`": [
                       "/core/authorize.php",
                       "/core/core.api.php",
                       "/core/globals.api.php",
                       "/core/install.php",
                       "/core/modules/statistics/statistics.php",
                       "~^/core/modules/system/tests/https?\\.php",
                       "/core/rebuild.php",
                       "/update.php",
                       "/update.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/drupal/direct"
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Explicitly denies access to any PHP scripts other than index.php>`": [
                       "!/index.php*",
                       "*.php"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/web <Path to the web/ directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/drupal/index <Funnels all requests to index.php>`"
                   }
               }
           }
       ],

       "applications": {
           "drupal": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/web/ <Path to the web/ directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/web/ <Path to the web/ directory; use a real path in your configuration>`",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   }
               }
           }
       }
   }
   ```

   #### NOTE
   The difference between the **pass** targets is their usage of
   the **script** [setting](../configuration.md#configuration-php):
   - The **direct** target runs the **.php** script from the
     URI or **index.php** if the URI omits it.
   - The **index** target specifies the **script** that Unit
     runs for *any* URIs the target receives.
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://www.drupal.org/docs/develop/using-composer/manage-dependencies#s-install-drupal-using-the-standard-web-interface)
   your Drupal installation:

> ![Drupal on Unit - Setup Screen](/drupal.png)
