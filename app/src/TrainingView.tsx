import React, { RefObject, useEffect, useRef, useState } from 'react'
import { Subject, concat, of } from 'rxjs'
import { takeUntil, switchMap, map, pairwise } from 'rxjs/operators'
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
  const [ pressure , setPressure] = useState(0)
  const [ $touchStart ] = useState(new Subject<TouchEvent>())
  const [ $touchEnd ] = useState(new Subject<TouchEvent>())
  const [ $touchMove ] = useState(new Subject<TouchEvent>())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // subscribe to touchEvents
  useEffect( () => {
    if (!canvasRef.current)
      return

    // transform events
    const $canvasTouchStart = $touchStart.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))
    const $canvasTouchEnd = $touchEnd.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))
    const $canvasTouchMove = $touchMove.pipe(map((e) => mapTouchEvent(e, canvasRef.current)))

    // get drawing canvas
    const ctx = canvasRef.current?.getContext('2d')

    const moveSubscription = $canvasTouchStart.pipe(
      switchMap((e) => {
        return concat(
          of(e),
          $canvasTouchMove
        ).pipe(pairwise(), takeUntil($touchEnd))
      }),
    ).subscribe( ([prev, curr]) => {
      if (!ctx || !prev || !curr) return
      const force = 255 - curr.force * 255
      ctx.beginPath()
      ctx.lineWidth = 4
      ctx.strokeStyle = `rgb(${force},${force},${force})`
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(curr.x, curr.y)
      ctx.stroke()
      setPressure(curr.force)
    })
    return () => {
      moveSubscription.unsubscribe()
    }
  }, [canvasRef])

  return (
    <div className="training-view">
      <h1>Training</h1>
      <canvas id='canvas' ref={canvasRef} width={200} height={200}
        onTouchStart={(e) => $touchStart.next(e)}
        onTouchEnd={(e) => $touchEnd.next(e)}
        onTouchMove={(e) => $touchMove.next(e)}
        onContextMenu={() => false}>
      </canvas>
      <p>{pressure}</p>
    </div>
  )
}

export { TrainingView }
