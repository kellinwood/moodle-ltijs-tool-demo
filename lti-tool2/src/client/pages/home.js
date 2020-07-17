import React, { useState, useEffect } from 'react'
import ky from 'ky'
import ObjectInspector from 'react-object-inspector';


export default function App () {
  const [info, setInfo] = useState()

  const errorPrompt = async (message) => {
    console.log(message);
  }

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const ltik = searchParams.get('ltik')
    if (!ltik) throw new Error('Missing lti key.')
    return ltik
  }


  useEffect(() => {
    const getInfo = async () => {
      try {
        const launchInfo = await ky.get('/info', { headers: { Authorization: 'Bearer ' + getLtik() } }).json()
        console.log(launchInfo)
        setInfo(launchInfo)
      } catch (err) {
        console.log(err)
        errorPrompt('Failed trying to retrieve custom parameters! ' + err)
      }
    }
    getInfo()
  }, [])

  return (
    <>
      <p>Welcome to the LTI-launched react app!</p>
      {info ? 
        <>
          <p>The following token and context info is available to this app</p>
          <ObjectInspector data={info}/>
        </> : <><p>Oops, no info available to show!</p></>
      }
    </>
  )
}
