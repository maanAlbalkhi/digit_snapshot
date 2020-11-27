import React, { useEffect, useRef, useState } from 'react'
import { Subject, concat, of } from 'rxjs'
import { takeUntil, switchMap, map, pairwise, take } from 'rxjs/operators'

import { ReactComponent as SubmitImage } from './assets/done-24px.svg'
import { ReactComponent as ClearImage } from './assets/clear-24px.svg'

import './styles/CanvasView.scss'

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

const CanvasView = ({ clear = false, onSubmitCanvas } : { clear?: boolean, onSubmitCanvas: (imgUri: string) => void}) => {

  const [ $touchStart ] = useState(new Subject<TouchEvent>())
  const [ $touchEnd ] = useState(new Subject<TouchEvent>())
  const [ $touchMove ] = useState(new Subject<TouchEvent>())

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ dataCanvas, setDataCanvas ] = useState<HTMLCanvasElement>()

  const [ resetTime, setResetTime ] = useState<boolean>(false)

  // subscribe to touchEvents
  useEffect( () => {
    if (!canvasRef.current)
      return

    // transform events
    const $canvasTouchStart = $touchStart.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))
    const $canvasTouchEnd = $touchEnd.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))
    const $canvasTouchMove = $touchMove.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))

    const h = canvasRef.current?.height || 0
    const w = canvasRef.current?.width || 0

    // get drawing canvas and clear it
    const ctx = canvasRef.current?.getContext('2d')
    ctx?.clearRect(0, 0, w, h)
    
    // create invisible canvas
    const canvas = document.createElement('canvas')
    canvas.width = h
    canvas.height = w
    setDataCanvas(canvas)

    const dataCtx = canvas.getContext('2d')

    var startTime = 0

    const moveSubscription = $canvasTouchStart.pipe(
      switchMap((start) => {
        if (startTime == 0) startTime = Date.now()
        return concat(
          of(start), // take the last touchstart event
          $canvasTouchMove // then take all move events
        ).pipe(pairwise(), takeUntil($canvasTouchEnd))
      }),
    ).subscribe( ([prev, curr]) => {
      if (!ctx || !dataCtx || !prev || !curr) return
      const elapsed = Date.now() - startTime 
      drawTouchLine(prev, curr, elapsed, ctx, dataCtx)
    })
    return () => {
      moveSubscription.unsubscribe()
    }
  }, [canvasRef, resetTime])

  function drawTouchLine(
    prev: CanvasTouchEvent, 
    curr: CanvasTouchEvent, 
    time: number, 
    drawCtx: CanvasRenderingContext2D, 
    dataCtx: CanvasRenderingContext2D 
  ) {
    const force = 255 - curr.force * 255
    const [ r, g, b ] = [ force, time % 256, Math.floor(time / 256) ]
    
    // draw dataCtx
    dataCtx.beginPath()
    dataCtx.lineWidth = 4
    dataCtx.strokeStyle = `rgb(${r},${g},${b})`
    dataCtx.moveTo(prev.x, prev.y)
    dataCtx.lineTo(curr.x, curr.y)
    dataCtx.stroke()

    // draw visible canvas
    drawCtx.beginPath()
    drawCtx.lineWidth = 4
    drawCtx.strokeStyle = `rgb(${r},${r},${r})`
    drawCtx.moveTo(prev.x, prev.y)
    drawCtx.lineTo(curr.x, curr.y)
    drawCtx.stroke()
  }

  function clearCanvas() {
    setResetTime(!resetTime)
  }

  function submitCanvas() {
    const canvas = dataCanvas
    if (!canvas)
      throw new Error('Data Canvas does not exist')

    onSubmitCanvas(canvas.toDataURL())
  }

  // clear canvas when clear changed
  useEffect(() => {
    clearCanvas()
  },[clear])

  return(
    <div className='canvas-view'>
      <canvas id='canvas' ref={canvasRef} width={256} height={256}
        onTouchStart={(e) => $touchStart.next(e)}
        onTouchEnd={(e) => $touchEnd.next(e)}
        onTouchMove={(e) => $touchMove.next(e)}
        onContextMenu={() => false}>
      </canvas>

      <button className='clear-button' onClick={() => clearCanvas()}><ClearImage/></button>
      <button className='submit-button' onClick={() => submitCanvas()}><SubmitImage/></button>
    </div>
  )
}

export { CanvasView }