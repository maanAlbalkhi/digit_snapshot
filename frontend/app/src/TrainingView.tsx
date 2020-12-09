import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Api } from './api'
import { CanvasView, TouchPointDataObject } from './CanvasView'
import { ProgressBar } from './ProgressBar'
import './styles/TrainingView.scss'

function TrainingView() {
  const [ digit, setDigit ] = useState<number>()
  const [ clearCanvas, setClearCanvas ] = useState(false)
  const [ progress, setProgress ] = useState({ total: 1, finished: 0 })

  const { username } = useParams<{ username: string}>()  

  async function requestNextDigit(user: string) {
    try {
      const response = await Api.getNumber(user)
      setDigit(response.digit)
      setProgress({ total: response.total, finished: response.current })
    } catch (err) {
      console.error(err)
    }
  }

  async function submitCanvas(data: TouchPointDataObject) {
    try {
      data.name = username
      data.digit = digit ? digit : -1
      await Api.postImage(data)
      setClearCanvas(!clearCanvas)
      setDigit(undefined)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!digit) {
      requestNextDigit(username).then()
    }
  },[digit, username])

  return (
    <div className="training-view">
      <h1>Drawing</h1>
      <div className='flex-center'>
        <ProgressBar total={progress.total} finished={progress.finished}/>
        <p>Draw Digit: {digit}</p>
        <CanvasView clear={clearCanvas} onSubmitCanvas={submitCanvas}/>
      </div>
    </div>
  )
}

export { TrainingView }
