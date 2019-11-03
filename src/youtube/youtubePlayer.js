import ReactPlayer from 'react-player'
import React from 'react'
import './youtubePlayer.css'

export const YoutubePlayer = ({youtubePlayerRef, isPaused, url}) => {
  return (
    <div className='player-wrapper'>
      <ReactPlayer
        className='react-player'
        url={url}
        width='100%'
        height='100%'
        controls
        volume={0.1}
        playing={!isPaused}
        ref={youtubePlayerRef}
      />
    </div>
  )
}
