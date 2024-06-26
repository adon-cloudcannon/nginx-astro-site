---
layout: "@layouts/BaseLayout.astro"
title: Joomla
---
# Joomla

To run the [Joomla](https://www.joomla.org) content management system using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Joomla’s [prerequisites](https://downloads.joomla.org/technical-requirements).
3. Install Joomla’s [core files](https://docs.joomla.org/Special:MyLanguage/J3.x:Installing_Joomla).  Here, we install it at **/path/to/app/**; use
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
5. Next, [prepare](../configuration.md#configuration-php) the Joomla configuration for
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
                   ":nxt_hint:`uri <Matches direct URLs and the administrative section of the site>`": [
                       "*.php",
                       "*.php/*",
                       "/administrator/"
                   ]
               },

               "action": {
                   "pass": "applications/joomla/direct"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   "fallback": {
                       "pass": ":nxt_hint:`applications/joomla/index <Unconditionally matches all remaining URLs, including rewritten ones>`"
                   }
               }
           }
       ],

       "applications": {
           "joomla": {
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

   The first route step handles the admin section and all URLs that specify a
   PHP script; the **direct** target doesn’t set the **script** option
   to be used by default, so Unit looks for the respective **.php** file.

   The next step serves static files via a **share**.  Its **fallback**
   enables rewrite mechanics for [search-friendly URLs](https://docs.joomla.org/Enabling_Search_Engine_Friendly_(SEF)_URLs).  All
   requests go to the **index** target that runs the **index.php**
   script at Joomla’s directory root.
6. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```bash
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, Joomla should be available on the listener’s IP
   and port to finish the [setup](https://docs.joomla.org/J3.x:Installing_Joomla#Main_Configuration):

> ![Joomla on Unit - Setup Screen](/joomla.png)
