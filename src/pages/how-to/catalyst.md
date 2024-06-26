---
layout: "@layouts/BaseLayout.astro"
title: Catalyst
---
# Catalyst

To run apps based on the [Catalyst](https://metacpan.org/dist/Catalyst-Manual) 5.9+ framework using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Perl language module.
2. Install Catalyst’s [core files](https://metacpan.org/dist/Catalyst-Manual/view/lib/Catalyst/Manual/Intro.pod#Install).
3. [Create](https://metacpan.org/dist/Catalyst-Manual/view/lib/Catalyst/Manual/Tutorial/02_CatalystBasics.pod#CREATE-A-CATALYST-PROJECT)
   a Catalyst app.  Here, let’s store it at **/path/to/app/**:
   ```bash
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ catalyst.pl :nxt_ph:`app <Arbitrary app name; becomes the application directory name>`
   $ cd app
   $ perl Makefile.PL
   ```

   Make sure the app’s **.psgi** file includes the **lib/**
   directory:
   ```perl
   use lib 'lib';
   use app;
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
5. Next, [prepare](../configuration.md#configuration-perl) the Catalyst configuration for Unit
   (use real values for **script** and **working_directory**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/catalyst"
           }
       },

       "applications": {
           "catalyst": {
               "type": "perl",
               "working_directory": ":nxt_ph:`/path/to/app/ <Needed to use modules from the local lib directory; use a real path in your configuration>`",
               "script": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`app.psgi"
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

   After a successful update, your app should be available on the listener’s IP
   address and port:
   ![Catalyst Basic Template App on Unit](/catalyst.png)
