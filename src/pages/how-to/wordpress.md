---
layout: "@layouts/BaseLayout.astro"
title: Wordpress
---
# WordPress

#### NOTE
For a more specific walkthrough that includes SSL setup and NGINX as a
proxy, see our [blog post](https://www.nginx.com/blog/automating-installation-wordpress-with-nginx-unit-on-ubuntu/).

To run the [WordPress](https://wordpress.org) content management system
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP 7.3+ language module.
2. Install and configure WordPress’s [prerequisites](https://wordpress.org/support/article/before-you-install/).
3. Install WordPress’s [core files](https://wordpress.org/download/).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.
4. Update the **wp-config.php** [file](https://wordpress.org/support/article/editing-wp-config-php/) with your
   database settings and other customizations.
5. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, [prepare](../configuration.md#configuration-php) the WordPress configuration for Unit
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
                   "uri": [
                       "*.php",
                       "*.php/*",
                       "/wp-admin/"
                   ]
               },

               "action": {
                   "pass": "applications/wordpress/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": "applications/wordpress/index"
                   }
               }
           }
       ],

       "applications": {
           "wordpress": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
                       "script": "index.php"
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
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://wordpress.org/support/article/how-to-install-wordpress/#step-5-run-the-install-script)
   your WordPress installation:
   ![WordPress on Unit - Setup Screen](/wordpress.png)

   #### NOTE
   The resulting URI scheme will affect your WordPress configuration; updates
   may require [extra steps](https://wordpress.org/support/article/changing-the-site-url/).
