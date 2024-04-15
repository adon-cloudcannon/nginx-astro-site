---
layout: "@layouts/BaseLayout.astro"
title: Ruby on Rails
---
# Ruby on Rails

To run apps based on the [Ruby on Rails](https://rubyonrails.org) framework
using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Ruby language module.
2. [Install](https://guides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails)
   Ruby on Rails and create or deploy your app.  Here, we use Ruby on Rails’s [basic template](https://guides.rubyonrails.org/getting_started.html#creating-the-blog-application):
   ```bash
   $ cd :nxt_ph:`/path/to/ <Path where the application directory will be created; use a real path in your configuration>`
   $ rails new :nxt_ph:`app <Arbitrary app name; becomes the application directory name>`
   ```

   This creates the app’s directory tree at **/path/to/app/**; its
   **public/** subdirectory contains the static files, while the entry
   point is **/path/to/app/config.ru**.
3. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-ruby) the Ruby on Rails configuration (use real
   values for **share** and **working_directory**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "routes"
           }
       },

       "routes": [
           {
               "action": {
                   ":nxt_hint:`share <Serves static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`public$uri",
                   "fallback": {
                       "pass": "applications/rails"
                   }
               }
           }
       ],

       "applications": {
           "rails": {
               "type": "ruby",
               "script": ":nxt_hint:`config.ru <All requests are handled by a single script, relative to working_directory>`",
               "working_directory": ":nxt_ph:`/path/to/app/ <Path to the application directory, needed here for 'require_relative' directives; use a real path in your configuration>`"
           }
       }
   }
   ```
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
   ![Ruby on Rails Basic Template App on Unit](/rails.png)
