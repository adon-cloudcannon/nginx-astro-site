---
layout: "@layouts/BaseLayout.astro"
title: Redmine
---
# Redmine

To run the [Redmine](https://www.redmine.org) project management system using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Ruby language module.
2. Install and configure Redmine’s [prerequisites](https://www.redmine.org/projects/redmine/wiki/RedmineInstall#Installation-procedure).
3. Install Redmine’s [core files](https://www.redmine.org/projects/redmine/wiki/RedmineInstall#Step-1-Redmine-application).  Here, we install it at **/path/to/app/**; use
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
5. Next, [prepare](../configuration.md#configuration-ruby) the Redmine configuration for Unit
   (use a real value for **working_directory**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/redmine"
           }
       },

       "applications": {
           "redmine": {
               "type": "ruby",
               "working_directory": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
               "script": ":nxt_hint:`config.ru <Entry point script name, including the file name extension>`",
               "environment": {
                   "RAILS_ENV": ":nxt_hint:`production <Environment name in the Redmine configuration file>`"
               }
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

   After a successful update, Redmine should be available on the listener’s IP
   and port:
   ![Redmine on Unit - Sample Screen](/redmine.png)
