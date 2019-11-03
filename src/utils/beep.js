import Pizzicato from 'pizzicato'

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

export const beepRest = async () => {
  beepRestSound.play()
  await new Promise(resolve => setTimeout(resolve, 300))
  beepRestSound.stop()
  await new Promise(resolve => setTimeout(resolve, 200))
  beepRestSound.play()
  await new Promise(resolve => setTimeout(resolve, 300))
  beepRestSound.stop()
}

export const beepStart = async () => {
  beepStartSound.play()
  await new Promise(resolve => setTimeout(resolve, 500))
  beepStartSound.stop()
}
