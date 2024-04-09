---
layout: "@layouts/BaseLayout.astro"
title: NextCloud
---
# NextCloud

To run the [NextCloud](https://nextcloud.com) share and collaboration
platform using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure NextCloud’s [prerequisites](https://docs.nextcloud.com/server/latest/admin_manual/installation/source_installation.html#prerequisites-for-manual-installation).
3. Install NextCloud’s [core files](https://docs.nextcloud.com/server/latest/admin_manual/installation/command_line_installation.html).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.

   #### NOTE
   > Verify the resulting settings in **/path/to/app/config/config.php**;
   > in particular, check the [trusted domains](https://docs.nextcloud.com/server/latest/admin_manual/installation/installation_wizard.html#trusted-domains-label)
   > to ensure the installation is accessible within your network:
   ```php
   'trusted_domains' =>
   array (
     0 => 'localhost',
     1 => '*.example.com',
   ),
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
5. Next, [put together](../configuration.md#configuration-php) the NextCloud configuration for
   Unit (use real values for **share** and **root**).  The following is
   based on NextCloud’s own [guide](https://docs.nextcloud.com/server/latest/admin_manual/installation/nginx.html):
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
                       "/build/*",
                       "/tests/*",
                       "/config/*",
                       "/lib/*",
                       "/3rdparty/*",
                       "/templates/*",
                       "/data/*",
                       "/.*",
                       "/autotest*",
                       "/occ*",
                       "/issue*",
                       "/indie*",
                       "/db_*",
                       "/console*"
                   ]
               },

               "action": {
                   "return": 404
               }
           },
           {
               "match": {
                   ":nxt_hint:`uri <Serves direct URIs with dedicated scripts>`": [
                       "/core/ajax/update.php*",
                       "/cron.php*",
                       "/index.php*",
                       "/ocm-provider*.php*",
                       "/ocs-provider*.php*",
                       "/ocs/v1.php*",
                       "/ocs/v2.php*",
                       "/public.php*",
                       "/remote.php*",
                       "/status.php*",
                       "/updater*.php*"
                   ]
               },

               "action": {
                   "pass": "applications/nextcloud/direct"
               }
           },
           {
               "match": {
                   "uri": "/ocm-provider*"
               },

               "action": {
                   "pass": "applications/nextcloud/ocm"
               }
           },
           {
               "match": {
                   "uri": "/ocs-provider*"
               },

               "action": {
                   "pass": "applications/nextcloud/ocs"
               }
           },
           {
               "match": {
                   "uri": "/updater*"
               },

               "action": {
                   "pass": "applications/nextcloud/updater"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": "applications/nextcloud/index"
                   }
               }
           }
       ],

       "applications": {
           "nextcloud": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   },

                   "ocm": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`ocm-provider/",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   },

                   "ocs": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`ocs-provider/",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   },

                   "updater": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`nextcloud/updater/",
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
   - Other targets specify the **script** that Unit runs for *any* URIs
     the target receives.
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.
7. Adjust Unit’s **max_body_size** [option](../configuration.md#configuration-stngs) to
   avoid potential issues with large file uploads, for example:
   ```bash
   # curl -X PUT -d '{"http":{"max_body_size": 2147483648}}' --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/settings <Path to the 'config/settings' section in Unit's control API>`
   ```

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://docs.nextcloud.com/server/latest/admin_manual/installation/installation_wizard.html)
   your NextCloud installation:
   ![NextCloud on Unit - Home Screen](/nextcloud.png)
