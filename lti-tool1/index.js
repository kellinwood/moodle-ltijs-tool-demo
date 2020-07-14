// Requiring LTIJS provider
const Lti = require('ltijs').Provider
// Requiring path
const path = require('path')
// Loading environment variables
require('dotenv').config()

// Creating a provider instance
const lti = new Lti(process.env.LTI_KEY,
  // Setting up database configurations
  { url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_DATABASE,
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS } })

// Main route
lti.app.get('/main', async (req, res) => {
  return res.sendFile(path.join(__dirname, '/public/index.html'))
})

// Grading route
lti.app.post('/grade', async (req, res) => {
  try {
    const grade = {
      scoreGiven: 70,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }

    // Sends a grade to a platform's grade line
    lti.Grade.ScorePublish(res.locals.token, grade)
    return res.send('Grade Succesfully Created')
  } catch (err) {
    return res.status(500).send(err.message)
  }
})

async function setup () {
  // Deploying provider, connecting to the database and starting express server.
  await lti.deploy()

  const clientId = 'oizoyHSkYHvnzav';

  console.log('Registring LTI platform with clientId: ' + clientId);

  const plat = await lti.registerPlatform({
    url: process.env.MOODLE_URL,
    name: 'Local Moodle',
    clientId: clientId,
    authenticationEndpoint: process.env.MOODLE_URL + '/mod/lti/auth.php',
    accesstokenEndpoint: process.env.MOODLE_URL + '/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: process.env.MOODLE_URL + '/mod/lti/certs.php' }
  })

  
  console.log(await plat.platformPublicKey())

  lti.onConnect((connection, request, response) => {
    lti.redirect(response, '/main', { ignoreRoot: true, isNewResource: true })
  }, { secure: false })

  console.log('Deployed!')
}

setup()
