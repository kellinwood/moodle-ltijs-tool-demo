const Lti = require('ltijs').Provider

const path = require('path')
require('dotenv').config()

// Setup
const lti = new Lti(process.env.LTI_KEY,
  {
    url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_DATABASE + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, {
    staticPath: path.join(__dirname, '../../dist'), // Path to static files
    cookies: { secure: false } // Cookies can be passed through insecure connections (http), allows for local testing
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res, next) => {
  return res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

// When receiving deep linking request redirects to deep link React screen
lti.onDeepLinking(async (connection, request, response) => {
  return lti.redirect(response, '/deeplink', { isNewResource: true })
})

// Grading route
lti.app.post('/grade', async (req, res) => {
  try {
    const lineItem = {
      scoreMaximum: 100,
      label: 'Grade',
      tag: 'grade'
    }

    const grade = {
      scoreGiven: req.body.grade,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }
    await lti.Grade.scorePublish(res.locals.token, grade, { resourceLinkId: true, autoCreate: lineItem })
    return res.sendStatus(201)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Names and Roles route
lti.app.get('/members', async (req, res) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token)
    if (result) return res.send(result.members)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err)
    return res.status(500).send(err.message)
  }
})

// Deep linking route
lti.app.post('/deeplink', async (req, res) => {
  try {
    const resource = req.body

    const items = {
      type: 'ltiResourceLink',
      title: 'Ltijs Demo',
      custom: {
        name: resource.name,
        value: resource.value
      }
    }

    const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully Registered' })
    if (form) return res.send(form)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Available resources for deep linking route
lti.app.get('/resources', async (req, res) => {
  const resources = [
    {
      name: 'parameter1',
      value: 'value1'
    },
    {
      name: 'parameter2',
      value: 'value2'
    },
    {
      name: 'parameter3',
      value: 'value3'
    }
  ]
  return res.send(resources)
})

// Get user and context information route
lti.app.get('/info', async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context

  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (token.roles) info.roles = token.roles
  if (context.context) info.context = context.context

  return res.send(info)
})

// Wildcard route to deal with redirecting to routes that are actually React routes
lti.app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../dist/index.html')))

// Setup function
const setup = async () => {
  // Deploying provider, connecting to the database and starting express server.
  await lti.deploy()

  const clientId = 'ccgMlSWsvbW5SwE';

  console.log('Registring LTI platform with clientId: ' + clientId);

  const plat = await lti.registerPlatform({
    url: process.env.MOODLE_URL,
    name: 'Tool 2',
    clientId: clientId,
    authenticationEndpoint: process.env.MOODLE_URL + '/mod/lti/auth.php',
    accesstokenEndpoint: process.env.MOODLE_URL + '/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: process.env.MOODLE_URL + '/mod/lti/certs.php' }
  })
  
  console.log(await plat.platformPublicKey())
  console.log('Deployed!')
}

setup()
