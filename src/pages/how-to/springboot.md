---
layout: "@layouts/BaseLayout.astro"
title: Spring Boot
---
# Spring Boot

To run apps based on the [Spring Boot](https://spring.io/projects/spring-boot) frameworks using Unit:

1. Install [Unit](../installation.md#installation-precomp-pkgs) with a Java language module.
2. Create your Spring Boot project; we’ll use the [quickstart](https://spring.io/quickstart) example, creating it at
   [https://start.spring.io](https://start.spring.io):
   ![Spring Initializr - Project Setup Screen](/springboot.png)

   #### NOTE
   Choose the same Java version that your Unit language module has.

   Download and extract the project files where you need them:
   ```bash
   $ unzip :nxt_hint:`demo.zip <Downloaded project archive>` -d :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`
   ```

   This creates a directory named **/path/to/app/demo/** for you to add
   your app code to; in our [example](https://spring.io/quickstart), it’s a
   single file called
   **/path/to/app/demo/src/main/java/com/example/demo/DemoApplication.java**:
   ```java
   package com.example.demo;

   import org.springframework.boot.SpringApplication;
   import org.springframework.boot.autoconfigure.SpringBootApplication;
   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RequestParam;
   import org.springframework.web.bind.annotation.RestController;

   @SpringBootApplication
   @RestController
   public class DemoApplication {

     public static void main(String[] args) {
       SpringApplication.run(DemoApplication.class, args);
     }

     @GetMapping("/hello")
     public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
       return String.format("Hello, %s!", name);
     }
   }
   ```

   Finally, assemble a **.war** file.

   If you chose [Gradle](https://gradle.org) as the build tool:
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`demo/
   $ ./gradlew bootWar
   ```

   If you chose [Maven](https://maven.apache.org):
   ```bash
   $ cd :nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`demo/
   $ ./mvnw package
   ```

   #### NOTE
   By default, Gradle puts the **.war** file in the **build/libs/**
   subdirectory, while Maven uses **target/**; note your path for later
   use in Unit configuration.
3. Run the following command so Unit can access :
   ```bash
   # chown -R :nxt_hint:`unit:unit <User and group that Unit's router runs as by default>` :nxt_ph:`/path/to/app/ <Path to the application files such as /data/www/app/; use a real path in your commands>`
   ```

   #### NOTE
   The **unit:unit** user-group pair is available only with [official
   packages](../installation.md#installation-precomp-pkgs), Docker [images](../installation.md#installation-docker), and some [third-party repos](../installation.md#installation-community-repos).  Otherwise, account names may differ; run
   the **ps aux | grep unitd** command to be sure.

   For further details, including permissions, see the [security checklist](security.md#security-apps).
4. Next, [put together](../configuration.md#configuration-java) the Spring Boot configuration (use
   a real value for **working_directory**):
   ```json
   {
       "listeners": {
           "*:80": {
               "pass": "applications/bootdemo"
           }
       },

       "applications": {
           "bootdemo": {
               "type": "java",
               "webapp": ":nxt_ph:`gradle-or-maven-build-dir/demo.war <Relative pathname of your .war file>`",
               "working_directory": ":nxt_ph:`/path/to/app/ <Path to the application directory; use a real path in your configuration>`demo/"
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
   ```bash
   $ curl http://localhost/hello?name=Unit

         Hello, Unit!
   ```
