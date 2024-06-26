---
layout: "@layouts/BaseLayout.astro"
title: CakePHP
---
# CakePHP

To run apps based on the [CakePHP](https://cakephp.org) framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP 7.2+ language module.
2. [Install](https://book.cakephp.org/4/en/installation.html) CakePHP and
   create or deploy your app.  Here, we use CakePHP’s [basic template](https://book.cakephp.org/4/en/installation.html#create-a-cakephp-project)
   and Composer:
   ```bash
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ composer create-project --prefer-dist cakephp/app:4.* :nxt_ph:`app <Arbitrary app name; becomes the application directory name>`
   ```

   This creates the app’s directory tree at **/path/to/app/**.  Its
   **webroot/** subdirectory contains both the root **index.php** and
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
4. Next, prepare the app [configuration](../configuration.md#configuration-php) for Unit (use
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
                   ":nxt_hint:`uri <Handles all requests that explicitly target PHP scripts>`": [
                       "*.php",
                       "*.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/cakephp/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Unconditionally serves remaining requests that target static files>`": ":nxt_ph:`/path/to/app/webroot <Path to the webroot/ directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       ":nxt_hint:`pass <Serves any requests not served with the 'share' immediately above>`": "applications/cakephp/index"
                   }
               }
           }
       ],

       "applications": {
           "cakephp": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/webroot/ <Path to the webroot/ directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/webroot/ <Path to the webroot/ directory; use a real path in your configuration>`",
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

   For a detailed discussion, see [Fire It Up](https://book.cakephp.org/4/en/installation.html#fire-it-up) in CakePHP
   docs.
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
   ![CakePHP Basic Template App on Unit](/cakephp.png)
