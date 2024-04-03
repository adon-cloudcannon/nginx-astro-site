# MoinMoin

#### WARNING
So far, Unit doesn’t support handling the **REMOTE_USER** headers
directly, so authentication should be implemented via other means.  For a
full list of available authenticators, see [here](https://moinmo.in/HelpOnAuthentication).

To run the [MoinMoin](https://moinmo.in/MoinMoinWiki) wiki engine using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Python 2 language module.

   #### NOTE
   As of now, MoinMoin [doesn’t fully support](https://moinmo.in/Python3)
   Python 3.  Mind that Python 2 is officially deprecated.
2. Install and configure MoinMoin’s [prerequisites](https://moinmo.in/MoinMoinDependencies).
3. Install MoinMoin’s [core files](https://moinmo.in/MoinMoinDownload).  Here, we install it at **/path/to/app/**; use
   a real path in your configuration.

   For example:
   ```console
   $ tar xzf moin-:nxt_ph:`X.Y.Z <MoinMoin version>`.tar.gz --strip-components 1 -C :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   ```
4. Configure your wiki instances:

   See the ‘Single Wiki’ section [here](https://master.moinmo.in/InstallDocs/ServerInstall) for an explanation of these commands:
   ```console
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ mkdir single/
   $ cp :nxt_hint:`wiki/config/wikiconfig.py <Wiki instance configuration>` single/
   $ cp -r wiki/data/ single/data/
   $ cp -r wiki/underlay/ single/underlay/
   $ cp :nxt_hint:`wiki/server/moin.wsgi <WSGI module to run, extension should be changed for proper discovery>` single/moin.py
   ```

   Next, [edit](https://moinmo.in/HelpOnConfiguration#Configuring_a_single_wiki)
   the wiki instance configuration in **wikiconfig.py** as
   appropriate.

   See the ‘Multiple Wikis’ section [here](https://master.moinmo.in/InstallDocs/ServerInstall) for an explanation of these commands:
   ```console
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   $ mkdir multi/ multi/wiki1/ multi/wiki2/
   $ cp wiki/config/wikifarm/* multi/
   $ cp :nxt_hint:`wiki/config/wikiconfig.py <Wiki instance configuration>` multi/wiki1.py
   $ cp :nxt_hint:`wiki/config/wikiconfig.py <Wiki instance configuration>` multi/wiki2.py
   $ cp -r wiki/data/ multi/wiki1/data/
   $ cp -r wiki/data/ multi/wiki2/data/
   $ cp -r wiki/underlay/ multi/wiki1/underlay/
   $ cp -r wiki/underlay/ multi/wiki2/underlay/
   $ cp :nxt_hint:`wiki/server/moin.wsgi <WSGI module to run, extension should be changed for proper discovery>` multi/moin.py
   ```

   Next, [edit](https://moinmo.in/HelpOnConfiguration#Configuration_of_multiple_wikis)
   the farm configuration in **farmconfig.py** and the wiki instance
   configurations, shown here as **wiki1.py** and **wiki2.py**,
   as appropriate.
5. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, [prepare](../configuration.md#configuration-python) the MoinMoin configuration for
   Unit (use real values for **path**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/moin"
           }
       },

       "applications": {
           "moin": {
               "type": "python 2",
               "path": [
                   ":nxt_ph:`/path/to/app/wsgi/module/ <Path where the WSGI module was stored at Step 4>`",
                   ":nxt_ph:`/path/to/app/ <Path where the MoinMoin directory was extracted at Step 3>`",
               ],

               "module": ":nxt_hint:`moin <WSGI file basename>`"
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

   After a successful update, MoinMoin should be available on the listener’s IP
   address and port:
   ![Moin on Unit - Welcome Screen](images/moin.png)
