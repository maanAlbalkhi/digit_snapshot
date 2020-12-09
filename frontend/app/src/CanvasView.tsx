import React, { useEffect, useRef, useState } from 'react'
import { Subject, concat, of } from 'rxjs'
import { takeUntil, switchMap, map, pairwise } from 'rxjs/operators'

import { ReactComponent as SubmitImage } from './assets/done-24px.svg'
import { ReactComponent as ClearImage } from './assets/clear-24px.svg'

import './styles/CanvasView.scss'
import _ from 'lodash'

type TouchEvent = React.TouchEvent<HTMLCanvasElement>

type CanvasTouchEvent = {
  x: number
  y: number
  force: number,
  time: number
}

type TouchPointDataObject = {
  canvas: { width: number, height: number}
  segments: CanvasTouchEvent[][]
  digit?: number
  name?: string
}

class TouchPointData {
  data : CanvasTouchEvent[][] = []

  add(p : CanvasTouchEvent) {
    _.last(this.data)?.push(p)
  }

  newSegment() {
    this.data.push([])
  }

  toJSON(canvasWidth : number, canvasHeight: number) : TouchPointDataObject {
    const startTime = this.data.length > 0 && this.data[0].length > 0 ? this.data[0][0].time : 0
    this.data.map( (segment) => {
      return segment.map((point) => {
        point.time -= startTime
        return point
      })
    })
    return {
      canvas : { width : canvasWidth, height: canvasHeight},
      segments: this.data
    }
  }
}

function mapTouchEvent(e : TouchEvent, canvas: HTMLCanvasElement|null) : CanvasTouchEvent|undefined {
  if (e.touches.length < 1) return 
  const offsetTop = canvas?.offsetTop || 0
  const offsetLeft = canvas?.offsetLeft || 0
  const touch =  e.touches[0] as any
  return { x: touch.pageX - offsetLeft, y: touch.pageY - offsetTop, force: touch.force, time: Date.now()} as CanvasTouchEvent
}

const CanvasView = ({ clear = false, onSubmitCanvas, width = 256, height = 256 } 
  : { clear?: boolean, width? : number, height? : number, onSubmitCanvas: (data: TouchPointDataObject) => void}) => {

  const [ $touchStart ] = useState(new Subject<TouchEvent>())
  const [ $touchEnd ] = useState(new Subject<TouchEvent>())
  const [ $touchMove ] = useState(new Subject<TouchEvent>())

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ touchPoints, setTouchPoints ] = useState<TouchPointData>()

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

    const moveSubscription = $canvasTouchStart.pipe(
      switchMap((start) => {
        touchPoints?.newSegment()
        if (start) touchPoints?.add(start)
        return concat(
          of(start), // take the last touchstart event
          $canvasTouchMove.pipe() // then take all move events
        ).pipe(pairwise(), takeUntil($canvasTouchEnd))
      }),
    ).subscribe( ([prev, curr]) => {
      if (!ctx || !prev || !curr) return
      drawTouchLine(prev, curr, ctx)
      touchPoints?.add(curr)
    })
    return () => {
      moveSubscription.unsubscribe()
    }
  }, [canvasRef, touchPoints])

  function drawTouchLine(
    prev: CanvasTouchEvent, 
    curr: CanvasTouchEvent,
    drawCtx: CanvasRenderingContext2D
  ) {
    const force = 255 - curr.force * 255

    // draw visible canvas
    drawCtx.beginPath()
    drawCtx.lineWidth = 4
    drawCtx.strokeStyle = `rgb(${force},${force},${force})`
    drawCtx.moveTo(prev.x, prev.y)
    drawCtx.lineTo(curr.x, curr.y)
    drawCtx.stroke()
  }

  function clearCanvas() {
    setTouchPoints(new TouchPointData())
  }

  function submitCanvas() {
    if (touchPoints) {
      const data = touchPoints.toJSON(width, height)
      onSubmitCanvas(data)
    }
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
export type { TouchPointDataObject }
