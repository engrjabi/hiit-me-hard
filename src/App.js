import React from 'react'
import _get from 'lodash/get'
import _random from 'lodash/random'
import SpotifyWebApi from 'spotify-web-api-node'
import {useTimer} from 'react-timer-hook'
import ReactPlayer from 'react-player'
import Pizzicato from 'pizzicato'
import './App.css'

const spotifyApi = new SpotifyWebApi()

function parseParams(str) {
  var pieces = str.slice(1).split('&'), data = {}, i, parts
  // process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split('=')
    if (parts.length < 2) {
      parts.push('')
    }
    data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1])
  }
  return data
}

const makeNewSpotifyPlayer = (token, globalStateName = 'mainPlayer') => {
  return new Promise(resolve => {

    const player = new window.SpotifyPlayerInstanceMaker({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => {
        cb(token)
      }
    })

    // Error handling
    player.addListener('initialization_error', ({message}) => {
      console.error(message)
    })
    player.addListener('authentication_error', ({message}) => {
      console.error(message)
    })
    player.addListener('account_error', ({message}) => {
      console.error(message)
    })
    player.addListener('playback_error', ({message}) => {
      console.error(message)
    })

    // Playback status updates
    player.addListener('player_state_changed', state => {
      console.log(state)
      window[globalStateName] = state
    })

    // Ready
    player.addListener('ready', ({device_id}) => {
      console.log('Ready with Device ID', device_id)
      resolve({
        player,
        device_id
      })
    })

    // Not Ready
    player.addListener('not_ready', ({device_id}) => {
      console.log('Device ID has gone offline', device_id)
    })

    // Connect to the player!
    player.connect()
  })
}

const dateWithSecOffset = (secondsOffset) => {
  const t = new Date()
  t.setSeconds(t.getSeconds() + secondsOffset)
  return t
}

const beepRestSound = new Pizzicato.Sound({
  source: 'wave',
  options: {
    frequency: 3000
  }
})

const beepStartSound = new Pizzicato.Sound({
  source: 'wave',
  options: {
    frequency: 4000
  }
})

const beepRest = async () => {
  beepRestSound.play()
  await new Promise(resolve => setTimeout(resolve, 300))
  beepRestSound.stop()
  await new Promise(resolve => setTimeout(resolve, 200))
  beepRestSound.play()
  await new Promise(resolve => setTimeout(resolve, 300))
  beepRestSound.stop()
}

const beepStart = async () => {
  beepStartSound.play()
  await new Promise(resolve => setTimeout(resolve, 500))
  beepStartSound.stop()
}

const timeToSeconds = (min, sec) => {
  return (min * 60) + sec
}

const spotifyURILow = 'spotify:playlist:5MiUNFzBc7Y1Ccq7iEtex5'
const spotifyURIHigh = 'spotify:playlist:16zWE2aZ4Y6zUOxEncGcdQ'
const timerWarmUpSec = 21
const timerLowSec = 31
const timerHighSec = 31
const timerRestSec = 11
const timerCoolDownSec = 61
const timeSeekPosMs = () => _random(30000, 60000, false)

const exerciseLabels = [
  {
    high: 'punch with knee up',
    highTime: timeToSeconds(3, 3),
    low: 'arm down and up',
    lowTime: timeToSeconds(6, 20)
  },
  {
    high: 'punches straight',
    highTime: timeToSeconds(7, 44),
    low: 'side knee up',
    lowTime: timeToSeconds(8, 50)
  },
  {
    high: 'arms forward foot side',
    highTime: timeToSeconds(10, 50),
    low: 'arm up and pull up',
    lowTime: timeToSeconds(12, 10)
  }
]

function App() {
  const hashCollection = parseParams(window.location.hash)
  const [deviceId, setDeviceId] = React.useState(null)
  const [timerExpired, setTimerExpired] = React.useState(false)
  const [setNumber, setSetNumber] = React.useState(-1) // -1 so it will be zero on start. Starts at 0 but displayed plus 1
  const [mainPlayer, setMainPlayer] = React.useState(null)
  const [isPaused, setIsPaused] = React.useState(false)
  const [currentMode, setNextMode] = React.useState('warm-up') // "warm-up", "rest-low", "rest-high", "high", "low", "cool-down"
  const youtubePlayer = React.useRef(null)
  const {
    seconds,
    minutes,
    pause,
    resume,
    restart
  } = useTimer({expiryTimestamp: dateWithSecOffset(timerWarmUpSec), onExpire: () => setTimerExpired(true)})

  React.useEffect(() => {
    if (timerExpired) {
      if (currentMode === 'low' && exerciseLabels.length === setNumber + 1) {
        setNextMode('cool-down')
        restart(dateWithSecOffset(timerCoolDownSec))
        return
      }

      if (currentMode === 'high') {
        beepRest()
        setNextMode('rest-low')
        mainPlayer.setVolume(0.3)
        youtubePlayer.current.seekTo(exerciseLabels[setNumber].lowTime);

        (async () => {
          await spotifyApi.play({
            device_id: deviceId,
            context_uri: spotifyURILow
          })
          await spotifyApi.seek(timeSeekPosMs(), {
            device_id: deviceId
          })
        })()

        restart(dateWithSecOffset(timerRestSec))
      }

      if (currentMode === 'low' || currentMode === 'warm-up') {
        beepRest()
        setSetNumber(prev => prev + 1)
        setNextMode('rest-high')
        mainPlayer.setVolume(0.3)
        youtubePlayer.current.seekTo(exerciseLabels[setNumber + 1].highTime);

        (async () => {
          spotifyApi.play({
            device_id: deviceId,
            context_uri: spotifyURIHigh
          })
          await spotifyApi.seek(timeSeekPosMs(), {
            device_id: deviceId
          })
        })()

        restart(dateWithSecOffset(timerRestSec))
      }

      if (currentMode === 'rest-low') {
        beepStart()
        setNextMode('low')
        mainPlayer.setVolume(1)
        restart(dateWithSecOffset(timerLowSec))
      }

      if (currentMode === 'rest-high') {
        beepStart()
        setNextMode('high')
        mainPlayer.setVolume(1)
        restart(dateWithSecOffset(timerHighSec))
      }

      // Reset flag
      setTimerExpired(false)
    }
  }, [timerExpired])

  /***
   * Save access tokens on localstorage for reuse
   * @todo
   * - renew on expire
   * - don't refresh after setting but instead just call the player initialize and remove access token on url
   */
  React.useEffect(() => {
    if (_get(hashCollection, 'access_token')) {
      localStorage.setItem('accessKeys', JSON.stringify({
        ...hashCollection,
        expirationTimeStamp: parseFloat(hashCollection.expires_in) + Date.now()
      }))
      window.location = '/'
    }
  }, [hashCollection])

  /**
   * initially set the spotify player if access token is present
   */
  React.useEffect(() => {
    (async () => {
      const accessKeys = localStorage.getItem('accessKeys')
      const accessKeysParsed = accessKeys ? JSON.parse(accessKeys) : {}

      if (accessKeysParsed) {
        const {device_id, player} = await makeNewSpotifyPlayer(accessKeysParsed.access_token)
        await spotifyApi.setAccessToken(accessKeysParsed.access_token)

        await spotifyApi.play({
          device_id: device_id,
          context_uri: spotifyURILow
        })

        // Wait some time before setting shuffle so it can detect active device
        await new Promise(resolve => setTimeout(resolve, 1000))
        await spotifyApi.setShuffle({
          state: true
        })

        // Skip so it will not always play the first song
        await spotifyApi.skipToNext()

        // Set device id on main state so other functions can use
        setMainPlayer(player)
        setDeviceId(device_id)
      }
    })()
  }, [])

  const exerNameDisplay = React.useMemo(() => {
    if (currentMode.includes('low')) {
      return exerciseLabels[setNumber].low
    }

    if (currentMode.includes('high')) {
      return exerciseLabels[setNumber].high
    }

    return ''
  }, [setNumber, currentMode])

  return (
    <div className="App">
      <div className='player-wrapper'>
        <ReactPlayer
          className='react-player'
          url='https://www.youtube.com/watch?v=VvfVMkWngRM'
          width='100%'
          height='100%'
          controls
          volume={0.1}
          playing={!isPaused}
          ref={youtubePlayer}
        />
      </div>

      <header className="App-header">
        {setNumber > -1 && (
          <h2>SET {setNumber + 1}</h2>
        )}
        <h2>{exerNameDisplay}</h2>
        <h3>{currentMode.toUpperCase()}</h3>
        <p>
          {minutes} : {seconds}
        </p>

        <div
          style={{
            margin: '1rem 0'
          }}
        >
          {_get(window.mainPlayer, 'track_window.current_track.name')}
          <div
            style={{
              fontSize: '1rem'
            }}
          >
            - {_get(window.mainPlayer, 'track_window.current_track.artists.0.name')}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 80,
            justifyContent: 'space-around'
          }}
        >
          <button onClick={() => {
            /**
             * Give user access to generate new token
             */
            const url = new URL('https://accounts.spotify.com/authorize')
            const params = {
              response_type: 'token',
              client_id: '2b410735b67846eda6ef8187775de8ef',
              redirect_uri: 'http://localhost:3000/',
              scope: 'streaming user-read-email user-modify-playback-state user-read-private',
              show_dialog: false
            }

            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
            window.location = url
          }}>
            Get new auth code
          </button>

          <button onClick={() => {
            if (isPaused) {
              mainPlayer.resume()
              resume()
              setIsPaused(false)
            }

            if (!isPaused) {
              mainPlayer.pause()
              pause()
              setIsPaused(true)
            }
          }}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
