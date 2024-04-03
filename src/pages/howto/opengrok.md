# OpenGrok

To run the [OpenGrok](https://github.com/oracle/opengrok) code search engine using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Java 11+ language module.
2. Follow the official OpenGrok [installation guide](https://github.com/oracle/opengrok/wiki/How-to-setup-OpenGrok).  Here,
   we’ll place the files at **/path/to/app/**:
   ```console
   $ mkdir -p :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`{src,data,dist,etc,log}
   $ tar -C :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`dist --strip-components=1 -xzf opengrok-:nxt_ph:`X.Y.Z <Specific OpenGrok version>`.tar.gz
   ```

   Our servlet container is Unit so we can repackage the **source.war**
   file to an arbitrary directory at [Step 2](https://github.com/oracle/opengrok/wiki/How-to-setup-OpenGrok#step2---deploy-the-web-application):
   ```console
   $ opengrok-deploy -c :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`etc/configuration.xml  \
         :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`dist/lib/source.war :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   ```

   The resulting pathname is **/path/to/app/source.war**.
3. Run the following command so Unit can access :
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [prepare](../configuration.md#configuration-java) the OpenGrok configuration for
   Unit:
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/opengrok"
           }
       },

       "applications": {
           "opengrok": {
               "type": "java",
               "webapp": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`:nxt_hint:`source.war <Repackaged in Step 2>`",
               "options": [
                   "-Djava.awt.headless=true"
               ]
           }
       }
   }
   ```
5. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, OpenGrok should be available on the listener’s IP
   address and port:
   ![OpenGrok on Unit - Search Screen](images/opengrok.png)
