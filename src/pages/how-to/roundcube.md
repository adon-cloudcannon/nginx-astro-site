---
layout: "@layouts/BaseLayout.astro"
title: Roundcube
---
# Roundcube

To run the [Roundcube](https://roundcube.net) webmail platform using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a PHP language module.
2. Install and configure Roundcube’s [prerequisites](https://github.com/roundcube/roundcubemail/wiki/Installation#install-dependencies).
3. Install Roundcube’s [core files](https://roundcube.net/download/).  Here, we install it at **/path/to/app/**; use
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
5. Next, [prepare](../configuration.md#configuration-php) the Roundcube configuration for Unit
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
                   ":nxt_hint:`uri <Serves direct requests for PHP scripts and directory-like URIs>`": [
                       "*.php",
                       "*/"
                   ]
               },

               "action": {
                   "pass": "applications/roundcube"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri"
               }
           }
       ],

       "applications": {
           "roundcube": {
               "type": "php",
               "root": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`"
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

   After a successful update, browse to [http://localhost/installer/](http://localhost/installer/) and [set up](https://github.com/roundcube/roundcubemail/wiki/Installation#configuring-roundcube)
   your Roundcube installation:
   ![Roundcube on Unit - Setup Screen](/roundcube-setup.png)
7. After installation, switch **share** and **root** to the
   **public_html/** subdirectory to [protect](https://github.com/roundcube/roundcubemail/wiki/Installation#protect-your-installation)
   sensitive data:
   ```bash
   # curl -X PUT -d ':nxt_ph:`"/path/to/app/ <Path to the application directory; use a real path in your configuration>`public_html$uri"' --unix-socket \
         :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/routes/1/action/share <Path to the app's document root in our configuration; mind that route steps are zero-indexed>`
   # curl -X PUT -d '":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public_html/"' --unix-socket \
         :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/applications/roundcube/root <Path to the app's root option in Unit's control API>`
   ```

   Thus, Roundcube should be available on the listener’s IP address and port:
   ![Roundcube on Unit - Login Screen](/roundcube.png)
