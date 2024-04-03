# Review Board

To run the [Review Board](https://www.reviewboard.org) code review tool using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 2.7 language module.
2. Install and configure Review Board’s [prerequisites](https://www.reviewboard.org/docs/manual/dev/admin/installation/linux/#before-you-begin).

   #### NOTE
   We’ll use Unit as the web server, so you can skip the corresponding step.
3. Install the [core files](https://www.reviewboard.org/docs/manual/dev/admin/installation/linux/#installing-review-board) and create a [site](https://www.reviewboard.org/docs/manual/dev/admin/installation/creating-sites/).
   Here, it’s **/path/to/app/**; use a real path in your configuration:
   ```console
   $ rb-site install :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`

         * Welcome to the Review Board site installation wizard

             This will prepare a Review Board site installation in:

             /path/to/app

             We need to know a few things before we can prepare your site for
             installation. This will only take a few minutes.
             ...
   ```
4. Add the **.py** extension to the WSGI module’s name to make it
   discoverable by Unit, for example:
   ```console
   $ mv :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`htdocs/reviewboard.wsgi   \
        :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`htdocs/wsgi.py
   ```
5. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).

   Also, make sure the following directories are [writable](https://www.reviewboard.org/docs/manual/dev/admin/installation/creating-sites/#changing-permissions):
   ```console
   $ chmod u+w :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`htdocs/media/uploaded/
   $ chmod u+w :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`data/
   ```
6. Next, [prepare](../configuration.md#configuration-python) the Review Board configuration for Unit
   (use real values for **share** and **path**):
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
                   ":nxt_hint:`uri <Static file directories>`": [
                       "/media/*",
                       "/static/*",
                       "/errordocs/*"
                   ]
               },

               "action": {
                   ":nxt_hint:`share <Serves matching static files>`": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`htdocs$uri"
               }
           },
           {
               "action": {
                   "pass": "applications/rb"
               }
           }
       ],

       "applications": {
           "rb": {
               "type": "python 2",
               "path": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`htdocs/",
               "module": ":nxt_hint:`wsgi <WSGI module basename with extension omitted>`"
           }
       }
   }
   ```
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, browse to [http://localhost](http://localhost) and [set up](https://www.reviewboard.org/docs/manual/dev/admin/#configuring-review-board)
   your Review Board installation:
   ![Review Board on Unit - Dashboard Screen](images/reviewboard.png)
