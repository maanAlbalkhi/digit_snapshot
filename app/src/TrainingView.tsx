import { clear } from 'console'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Subject, concat, of } from 'rxjs'
import { takeUntil, switchMap, map, pairwise } from 'rxjs/operators'
import { Api } from './api'
import { CanvasView } from './CanvasView'
import { ProgressBar } from './ProgressBar'
import './styles/TrainingView.scss'

type TouchEvent = React.TouchEvent<HTMLCanvasElement>

type CanvasTouchEvent = {
  x: number
  y: number
  force: number
}

function mapTouchEvent(e : TouchEvent, canvas: HTMLCanvasElement|null) : CanvasTouchEvent|undefined {
  if (e.touches.length < 1) return 
  const offsetTop = canvas?.offsetTop || 0
  const offsetLeft = canvas?.offsetLeft || 0
  const touch =  e.touches[0] as any
  return { x: touch.pageX - offsetLeft, y: touch.pageY - offsetTop, force: touch.force} as CanvasTouchEvent
}

function TrainingView() {
  const [ digit, setDigit ] = useState<number>()
  const [ clearCanvas, setClearCanvas ] = useState(false)

  const { username } = useParams<{ username: string}>()

  async function requestNextDigit(user: string) {
    try {
      const digit = await Api.getNumber(user)
      setDigit(digit)
    } catch (err) {
      console.error(err)
    }
  }

  async function submitCanvas(img: string) {
    try {
      await Api.postImage(img, username, digit ? digit : -1)
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
      <h1>Training</h1>
      <div className='flex-center'>
        <ProgressBar total={100} finished={67}/>
        <p>Draw Digit: {digit}</p>
        <CanvasView clear={clearCanvas} onSubmitCanvas={submitCanvas}/>
      </div>
    </div>
  )
}

export { TrainingView }
