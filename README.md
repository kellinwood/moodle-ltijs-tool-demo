# moodle-ltijs-tool-demo

This repo supports running demo in which moodle is configured to launch an external tool via LTI 1.3.  The tool uses ltijs for LTI support.

Running this demo requires docker and a VNC client.

Note that all shell scripts and docker commands are to be executed locally (on the docker host), and all browser operations are to be performed in the VNC window after connecting to the chrome container.

Five docker containers will be used.

1. moodle
2. mariadb - backing DB used by Moodle
3. lti-tool1 - the LTI-launchable tool that relies on ltijs for LTI support
4. mongodb - the backing store used by ltijs
5. chrome - a VNC-enabled container with chrome courtesy of the selenium project

I ran into troulbe getting the redirects between moodle and the lti-tool working with the browser running on the host, which is why the demo uses chrome running on the same docker network as moodle and the tool.


## Startup phase 1

```
./startup_phase1.sh

# Tail the moodle logs
docker logs -f moodle
```

The script, startup_phase1.sh, will create all five containers and start all but the lti-tool1 container.  Wait until the moodle log output shows that the apache server up before continuing.  This will take several minutes...

Wait for the following log output:
```
[Tue Jul 14 23:08:14.624469 2020] [mpm_prefork:notice] [pid 74] AH00163: Apache/2.4.43 (Unix) OpenSSL/1.1.1d PHP/7.3.19 configured -- resuming normal operations
[Tue Jul 14 23:08:14.624532 2020] [core:notice] [pid 74] AH00094: Command line: 'httpd -f /opt/bitnami/apache/conf/httpd.conf -D FOREGROUND'
```

## Connect to chrome via VNC

Connect to the chrome container via VNC on localhost port 5900.  The password is 'secret'. 

The chrome container is running the [Fluxbox window manager](http://fluxbox.org).

* Right click to get the fluxbox menu
* Select Applications -> Networking -> Web Browsing -> Google Chrome
* Dismiss the popup asking if Chrome should be made the default browser on the system

## Login to moodle

* Visit http://moodle.com to connect to the moodle
* Click the login link in the upper right
* Login with username: 'user', and password: 'bitnami'

## Configure lti-tool1 as an external tool

* Click on 'Site administration' in the left-hand navigation pane
* Click on the 'Plugins' tab
* Under 'Activity Modules', click on 'Manage Tools'
* Click 'Configure a tool manually'
* Enter 'Tool 1' for the tool name
* Enter 'http://lti-tool1:3000' for the tool URL
* Change the LTI version to 'LTI 1.3'
* Set the 'Public Key Type' to 'Keyset URL', if its not set that way already
* Enter 'http://lti-tool1:3000/keys' in the 'Public keyset' field
* Enter 'http://lti-tool1:3000/login' in the 'Initiate Login URL' field
* Enter 'http://lti-tool1:3000' in the 'Redirection URI(s)' field
* Confirm or change 'Tool configuration usage' to 'Show as preconfigured tool...'
* Click 'Save'

## Determine the Client ID assigned to the tool

* Click the settings/gear icon in the tool that was just created.
* Copy the Client ID value  (the lti-tool code needs this ID)

## Update lti-tool1 with the Client ID

* Edit docker-compose.yml and change the environment viarable value for LTI_CLIENT_ID under lti-tool1.  Specifically change 'changeme_moodle_client_id' to the client ID copied from the Moodle external tool's setting page above.

```
services:
  lti-tool1:
    environment:
      - LTI_CLIENT_ID=value-copied-from-moodle-above
```


## Rebuild and start the tool

```
./startup_phase2.sh lti-tool1
```

This will re-build the lti-tool and start its container.



## Add the tool to the moodle site

* Click on 'Site Home' in the moodle left-hand navigation pane
* Click the gear icon on the right side of the page
* Select 'Turn editing on'
* Click 'Add an activity or resource'
* Click 'External Tool'
* Enter 'Tool 1' for the Activity name
* Select 'Tool 1' from the Preconfigured tool select list
* Click 'Save and return to course'
* Click the gear icon gain and turn editing off

## Launch the tool

* Click on 'Tool 1'

## Shutdown

Shutdown and remove the docker containers. 

```
./shutdown.sh
```

Note that because the data directories of moodle, mariadb, and mongodb are mounted from local directories, the moodle and LTI configurations are persistent.  If you want to start over from scratch, then run the cleanup.sh script too.

## lti-tool2

I added lti-tool2 which is based on [Ltijs-simple-react-full-stack](https://github.com/Cvmcosta/Ltijs-simple-react-full-stack).  This tool is an LTI-launchable react app that displays the token and context information passed by moodle.

















