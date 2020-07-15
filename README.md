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
* Login with username: User, and password: bitnami

## Configure lti-tool1 as an external tool

* Click on 'Site administration' in the left-hand navigation pane
* Click on the 'Plugins' tab
* Under 'Activity Modules', click on 'Manage Tools'
* Click 'Configure a tool manually'
* Enter 'Class Summary' for the tool name
* Enter 'http://lti-tool1:3000' for the tool URL
* Change the LTI version to 'LTI 1.3'
* Change the 'Public Key Type' to 'RSA key'
* Leave the 'Public Key' field blank for now
* Enter 'http://lti-tool1:3000/login' in the 'Initiate Login URL' field
* Enter 'http://lti-tool1:3000' in the 'Redirection URI(s)' field
* Confirm or change 'Tool configuration usage' to 'Show as preconfigured tool...'
* Click 'Save'

## Determine the Client ID assigned to the tool

* Click the settings/gear icon in the tool that was just created.
* Copy the Client ID value  (the lti-tool code needs this ID)
* Leave the settings screen open

## Update lti-tool1 with the Client ID

* Edit lti-tool1/index.js and find the line that looks like this:

```
const clientId = 'oizoyHSkYHvnzav';
```

IMPORTANT: Change the clientId value shown above to the one that you copied from the moodle tool settings page.

## Rebuild and start the tool

```
./startup_phase2.sh
```

This will re-build the lti-tool and start its container.

## Cofigure the tools' public key in moodle

The tool outputs its public key to the logs

```
docker logs lti-tool1
```

* Copy the base64-encoded public key from the log output
* Go back to the VNC window and in the settings for the moodle external tool created in the prior steps, paste the public key into the 'Public Key' field.
* Click 'Save'


## Add the tool to the moodle site

* Click on 'Site Home' in the moodle left-hand navigation pane
* Click the gear icon on the right side of the page
* Select 'Turn editing on'
* Click 'Add an activity or resource'
* Click 'Eternal Tool'
* Enter 'Class Summary' for the Activity name
* Select 'Class Summary' from the Preconfigured tool select list
* Click 'Save and return to course'
* Click the gear icon gain and turn editing off

## Launch the tool

* Click on 'Class Summary'
















