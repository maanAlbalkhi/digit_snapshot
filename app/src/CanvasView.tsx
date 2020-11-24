import React, { useEffect, useRef, useState } from 'react'
import { Subject, concat, of } from 'rxjs'
import { takeUntil, switchMap, map, pairwise, take } from 'rxjs/operators'

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

const CanvasView = ({ clear = false, onSubmitCanvas } : { clear?: boolean, onSubmitCanvas: (img: string) => void}) => {

  const [ $touchStart ] = useState(new Subject<TouchEvent>())
  const [ $touchEnd ] = useState(new Subject<TouchEvent>())
  const [ $touchMove ] = useState(new Subject<TouchEvent>())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [ resetTime, setResetTime ] = useState<boolean>(false)

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
      if (!ctx || !prev || !curr) return
      const elapsed = Date.now() - startTime 
      drawTouchLine(prev, curr, elapsed, ctx)
    })
    return () => {
      moveSubscription.unsubscribe()
    }
  }, [canvasRef, resetTime])

  function drawTouchLine(prev: CanvasTouchEvent, curr: CanvasTouchEvent, time: number, ctx: CanvasRenderingContext2D) {
    const force = 255 - curr.force * 255
    const [ r, g, b ] = [ force, time % 256, Math.floor(time / 256) ]
    ctx.beginPath()
    ctx.lineWidth = 4
    ctx.strokeStyle = `rgb(${r},${g},${b})`
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(curr.x, curr.y)
    ctx.stroke()
  }

  function clearCanvas() {
    const ctx = canvasRef.current?.getContext('2d')
    const h = canvasRef.current?.height || 0
    const w = canvasRef.current?.width || 0
    ctx?.clearRect(0, 0, w, h)
    setResetTime(!resetTime)
  }

  function submitCanvas() {
    const canvas = canvasRef.current
    if (!canvas)
      throw new Error('Canvas does not exist')

    const w = canvasRef.current?.width || 0
    const h = canvasRef.current?.height || 0

    // create temporay canvas
    const tmpCanvas = document.createElement('canvas')
    const ctx = tmpCanvas.getContext('2d')
    tmpCanvas.width = w
    tmpCanvas.height = h
    ctx?.drawImage(canvas, 0, 0, w, h, 0, 0, w, h)

    onSubmitCanvas(tmpCanvas.toDataURL())
  }

  // clear canvas when clear changed
  useEffect(() => {
    clearCanvas()
  },[clear])

  return(
    <div>
      <canvas id='canvas' ref={canvasRef} width={256} height={256}
        onTouchStart={(e) => $touchStart.next(e)}
        onTouchEnd={(e) => $touchEnd.next(e)}
        onTouchMove={(e) => $touchMove.next(e)}
        onContextMenu={() => false}>
      </canvas>

      <button onClick={() => clearCanvas()}>Clear</button>
      <button onClick={() => submitCanvas()}>Submit</button>
    </div>
  )
}

export { CanvasView }