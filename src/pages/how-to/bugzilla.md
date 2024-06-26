---
layout: "@layouts/BaseLayout.astro"
title: Bugzilla
---
# Bugzilla

To run the [Bugzilla](https://www.bugzilla.org) bug tracking system using
Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Perl language module.
2. Install and configure Bugzilla’s [prerequisites](https://bugzilla.readthedocs.io/en/latest/installing/linux.html#install-packages).
3. Install Bugzilla’s [core files](https://bugzilla.readthedocs.io/en/latest/installing/linux.html#bugzilla).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.

   #### NOTE
   Unit uses [PSGI](https://metacpan.org/pod/PSGI) to run Perl
   applications; Bugzilla natively supports PSGI since version 5.1.
4. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
5. Next, [prepare](../configuration.md#configuration-perl) the Bugzilla configuration for
   Unit.  The default **.htaccess** scheme roughly translates into the
   following (use real values for **share**, **script**,
   and **working_directory**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "routes"
           }
       },

       "routes": [
           {
               ":nxt_hint:`match <Restricts access to .dot files to the public webdot server at research.att.com>`": {
                   "source": ":nxt_hint:`192.20.225.0/24 <Well-known IP range>`",
                   "uri": "/data/webdot/*.dot"
               },

               "action": {
                   ":nxt_hint:`share <Serves static files that match the conditions above>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri"
               }
           },
           {
               "action": {
                   ":nxt_hint:`share <Unconditionally serves remaining requests that target static files>`": ":nxt_ph:`/path/to/app <Path to the application directory; use a real path in your configuration>`$uri",
                   ":nxt_hint:`types <Enables sharing only for certain file types>`": [
                       "text/css",
                       "image/*",
                       "application/javascript"
                   ],

                   "fallback": {
                       ":nxt_hint:`pass <Serves any requests not served with the 'share' immediately above>`": "applications/bugzilla"
                   }
               }
           }
       ],

       "applications": {
           "bugzilla": {
               "type": "perl",
               "working_directory": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`",
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

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://bugzilla.readthedocs.io/en/latest/installing/essential-post-install-config.html)
   your Bugzilla installation:
   ![Bugzilla on Unit - Setup Screen](/bugzilla.png)
