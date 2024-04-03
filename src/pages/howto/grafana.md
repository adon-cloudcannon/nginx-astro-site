# Grafana

Here, we install Grafana from [sources](https://github.com/grafana/grafana/blob/main/contribute/developer-guide.md)
so we can [configure it](../configuration.md#configuration-go) to run on Unit.

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Go language module.

   Also, make sure Unit’s Go module is available at **$GOPATH**.
2. Download Grafana’s source files:
   ```console
   $ go get github.com/grafana/grafana
   ```
3. Update the code, adding Unit to Grafana’s protocol list.  You can either
   apply a patch ([`grafana.patch`](../downloads/grafana.patch)):
   ```console
   $ cd :nxt_hint:`$GOPATH/src/github.com/grafana/grafana <The path where the previous step saves the application's files>`
   $ curl -O https://unit.nginx.org/_downloads/grafana.patch
   $ patch -p1 < grafana.patch
   ```

   Or update the sources manually.  In **conf/defaults.ini**:
   ```ini
   #################################### Server ##############################
   [server]
   # Protocol (http, https, socket, unit)
   protocol = unit
   ```

   In **pkg/api/http_server.go**:
   ```go
   import (
       // ...
       "net/http"
       "unit.nginx.org/go"
       "os"
       // ...
   )

   // ...

   switch setting.Protocol {

   // ...

   case setting.HTTP, setting.HTTPS, setting.HTTP2:
       var err error
       listener, err = net.Listen("tcp", hs.httpSrv.Addr)
       if err != nil {
           return errutil.Wrapf(err, "failed to open listener on address %s", hs.httpSrv.Addr)
       }
   case setting.SOCKET:
       var err error
       listener, err = net.ListenUnix("unix", &net.UnixAddr{Name: setting.SocketPath, Net: "unix"})
       if err != nil {
           return errutil.Wrapf(err, "failed to open listener for socket %s", setting.SocketPath)
       }
   case setting.UNIT:
       var err error
       err = unit.ListenAndServe(hs.httpSrv.Addr, hs.macaron)
       if err == http.ErrServerClosed {
           hs.log.Debug("server was shutdown gracefully")
           return nil
       }
   ```

   In **pkg/setting/setting.go**:
   ```go
    const (
        HTTP              Scheme = "http"
        HTTPS             Scheme = "https"
        SOCKET            Scheme = "socket"
        UNIT              Scheme = "unit"
        DEFAULT_HTTP_ADDR string = "0.0.0.0"
    )

    // ...

    Protocol = HTTP
    protocolStr, err := valueAsString(server, "protocol", "http")
    // ...
    if protocolStr == "https" {
        Protocol = HTTPS
        CertFile = server.Key("cert_file").String()
        KeyFile = server.Key("cert_key").String()
    }
    if protocolStr == "h2" {
        Protocol = HTTP2
        CertFile = server.Key("cert_file").String()
        KeyFile = server.Key("cert_key").String()
    }
    if protocolStr == "socket" {
        Protocol = SOCKET
        SocketPath = server.Key("socket").String()
    }
    if protocolStr == "unit" {
        Protocol = UNIT
    }
   ```
4. Build Grafana:
   ```console
   $ cd :nxt_hint:`$GOPATH/src/github.com/grafana/grafana <The path where the previous step saves the application's files>`
   $ :nxt_hint:`go get ./... <Installs dependencies>`
   $ go run build.go setup
   $ go run build.go build
   $ yarn install --pure-lockfile
   $ yarn start
   ```

   Note the directory where the newly built **grafana-server** is placed,
   usually **$GOPATH/bin/**; it’s used for the **executable** option in
   the Unit configuration.
5. Run the following commands so Unit can access Grafana’s files:
   ```console
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_hint:`$GOPATH/src/github.com/grafana/grafana <Path to the application's files>`
   # chown :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_hint:`$GOPATH/bin/grafana-server <Path to the application's executable>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with
   [official packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ;
   run the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
6. Next, [prepare](../configuration.md#configuration-php) the configuration (replace
   **$GOPATH** with its value in **executable** and
   **working_directory**):
   ```json
   {
       "listeners": {
           "*:3000": {
               "pass": "applications/grafana"
           }
       },

       "applications": {
           "grafana": {
               "executable": ":nxt_ph:`$GOPATH <Replace with the environment variable's value>`:nxt_hint:`/bin/grafana-server <Path to the application's executable>`",
               "type": "external",
               "working_directory": ":nxt_ph:`$GOPATH <Replace with the environment variable's value>`:nxt_hint:`/src/github.com/grafana/grafana/ <Path to the application's files>`"
           }
       }
   }
   ```

   See [Go application options](../configuration.md#configuration-go) and the Grafana [docs](https://grafana.com/docs/grafana/latest/administration/configuration/#static_root_path)
   for details.
7. Upload the updated configuration.  Assuming the JSON above was added to
   `config.json`:
   ```console
   # curl -X PUT --data-binary @config.json --unix-socket \
          :nxt_ph:`/path/to/control.unit.sock <Path to Unit's control socket in your installation>` :nxt_hint:`http://localhost/config/ <Path to the config section in Unit's control API>`
   ```

   #### NOTE
   The [control socket](../controlapi.md#configuration-socket) path may vary; run
   **unitd -h** or see [Startup and Shutdown](source.md#source-startup) for details.

   After a successful update, Grafana should be available on the listener’s IP
   and port:
   ![Grafana on Unit - Setup Screen](images/grafana.png)
