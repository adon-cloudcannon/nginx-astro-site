---
layout: "@layouts/BaseLayout.astro"
title: Yii
---
# Yii

To run apps based on the [Yii](https://www.yiiframework.com) framework
versions 1.1 or 2.0 using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Next, [install](https://www.yiiframework.com/doc/guide/2.0/en/start-installation)
   Yii and create or deploy your app.

   Here, we use Yii’s [basic project template](https://www.yiiframework.com/doc/guide/2.0/en/start-installation#installing-from-composer)
   and Composer:
   ```bash
   $ cd :nxt_ph:`/path/to/ <Partial path to the application directory; use a real path in your configuration>`
   $ composer create-project --prefer-dist yiisoft/yii2-app-basic :nxt_ph:`app <Arbitrary app name>`
   ```

   This creates the app’s directory tree at **/path/to/app/**.
   Its **web/** subdirectory contains both the root
   **index.php** and the static files; if your app requires
   additional **.php** scripts, also store them here.
3. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-php) the Yii configuration for
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
                   "uri": [
                       "!:nxt_hint:`/assets/* <This path stores application data that shouldn't be run as code>`",
                       "*.php",
                       "*.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/yii/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`web$uri",
                   "fallback": {
                       "pass": "applications/yii/index"
                   }
               }
           }
       ],

       "applications": {
           "yii": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`web/"
                   },

                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`web/",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   }
               }
           }
       }
   }
   ```

   For a detailed discussion, see [Configuring Web Servers](https://www.yiiframework.com/doc/guide/2.0/en/start-installation#configuring-web-servers)
   and [Running Applications](https://www.yiiframework.com/doc/guide/2.0/en/start-workflow) in
   Yii 2.0 docs.

   #### NOTE
   The difference between the **pass** targets is their usage of
   the **script** [setting](../configuration.md#configuration-php):
   - The **direct** target runs the **.php** script from the
     URI or **index.php** if the URI omits it.
   - The **index** target specifies the **script** that Unit
     runs for *any* URIs the target receives.
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your app should be available on the
   listener’s IP address and port:
   ![Yii Basic Template App on Unit](/yii2.png)

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Next, [install](https://www.yiiframework.com/doc/guide/1.1/en/quickstart.installation)
   Yii and create or deploy your app.

   Here, we use Yii’s [basic project template](https://www.yiiframework.com/doc/guide/1.1/en/quickstart.first-app)
   and **yiic**:
   ```bash
   $ git clone git@github.com:yiisoft/yii.git :nxt_ph:`/path/to/yii1.1/ <Arbitrary framework path>`
   $ :nxt_ph:`/path/to/yii1.1/ <Arbitrary framework path>`framework/yiic webapp :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   ```

   This creates the app’s directory tree at **/path/to/app/**.
3. Next, [prepare](../configuration.md#configuration-php) the Yii configuration for
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
                   "uri": [
                       "!:nxt_hint:`/assets/* <This path stores application data that shouldn't be run as code>`",
                       "!/protected/*",
                       "!/themes/*",
                       "*.php",
                       "*.php/*"
                   ]
               },

               "action": {
                   "pass": "applications/yii/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": "applications/yii/index"
                   }
               }
           }
       ],

       "applications": {
           "yii": {
               "type": "php",
               "targets": {
                   "direct": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
                   },
                   "index": {
                       "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
                       "script": ":nxt_hint:`index.php <All requests are handled by a single script>`"
                   }
               }
           }
       }
   }
   ```

   For a detailed discussion, see Yii 1.1 [docs](https://www.yiiframework.com/doc/guide/1.1/en/quickstart.first-app).

   #### NOTE
   The difference between the **pass** targets is their usage of
   the **script** [setting](../configuration.md#configuration-php):
   - The **direct** target runs the **.php** script from the
     URI or **index.php** if the URI omits it.
   - The **index** target specifies the **script** that Unit
     runs for *any* URIs the target receives.
4. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, your app should be available on the
   listener’s IP address and port:
   ![Yii Basic Template App on Unit](/yii1.1.png)
