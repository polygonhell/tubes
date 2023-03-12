import { useEffect, useRef } from 'react'
import { anodeCurves, maxAnodePowerDissipation, Point, Parameters, anodeCurrent } from '../calculate/tube'

class Scale {
  x: number = 1
  y: number = 100
}

class Offset {
  x: number = 10
  y: number = 10
}

function toGraph(pos: Point, scale: Scale, offset: Offset): Point {
  return { x: pos.x * scale.x + offset.x, y: pos.y * scale.y + offset.y }
}

function drawCurve(context: CanvasRenderingContext2D, points: Point[], scale: Scale, offset: Offset): void {
  context.lineWidth = 2
  context.beginPath()
  const [head, ...tail] = points
  context.moveTo(head.x * scale.x + offset.x, head.y * scale.y + offset.y)
  tail.forEach((p) => {
    context.lineTo(p.x * scale.x + offset.x, p.y * scale.y + offset.y)
  })
  context.stroke()
}

function findClosestXOnGraph(points: Point[], y: number): number {
  // Basically a binary search
  var l = 0
  var r = points.length - 1
  var candidate: number
  while (l <= r) {
    candidate = Math.floor((l + r) / 2)
    var cp = points[candidate]
    if (cp.y < y) l = candidate + 1
    else if (cp.y > y) r = candidate - 1
    else break
  }

  // Lerp between the point above and the one below
  var p0 = points[candidate! - 1]
  var p1 = points[candidate!]
  var x = p0.x + (y - p0.y) * ((p1.x - p0.x) / (p1.y - p0.y))

  return x
}

function drawAnodeCurves(context: CanvasRenderingContext2D, tube: Parameters, scale: Scale, offset: Offset): void {
  var curves = anodeCurves(tube)

  context.strokeStyle = 'blue'
  // context.strokeStyle = '#000000'
  context.fillStyle = 'blue'
  var labelFont = '14px sansserif'

  context.textAlign = 'right'
  context.textBaseline = 'middle'
  context.font = labelFont

  curves.forEach((curve) => {
    drawCurve(context, curve.points, scale, offset)

    var labelY = Number(curve.gridVolts).toFixed(0)
    // Pick a point about 75% through the curve
    var Ia = tube.maxI_A * 0.5
    var Va = findClosestXOnGraph(curve.points, Ia)
    var pos = toGraph({ x: Va, y: Ia }, scale, offset)

    context.save()
    context.translate(pos.x - 10, pos.y)
    context.scale(1, -1) // Reverse out the mirror
    context.fillText(labelY, 0, 0)
    context.restore()
  })
}

function drawMaxAnodePowerDissipation(context: CanvasRenderingContext2D, points: Point[], scale: Scale, offset: Offset): void {
  context.strokeStyle = 'red'
  context.setLineDash([10, 10])
  drawCurve(context, points, scale, offset)
}

function computeScales(width: number, height: number, params: Parameters): Scale {
  return { x: width / params.maxV_A, y: height / params.maxI_A }
}

function drawScales(context: CanvasRenderingContext2D, params: Parameters, scale: Scale, offset: Offset): void {
  context.strokeStyle = '#000000'
  context.fillStyle = 'black'

  var scaleFont = '12px sansserif'
  var labelFont = '14px sansserif'

  // Y Axis
  context.textAlign = 'right'
  context.textBaseline = 'middle'
  context.font = scaleFont

  context.lineWidth = 1
  context.beginPath()
  context.moveTo(offset.x, offset.y)
  context.lineTo(offset.x, offset.y + scale.y * params.maxI_A)
  context.stroke()

  context.lineWidth = 0.25
  context.beginPath()
  var stepY = params.maxI_A / 10
  for (var tickY = 0; tickY <= 10; tickY++) {
    var valueY = tickY * stepY
    var vpos = offset.y + scale.y * valueY
    context.moveTo(offset.x - 5, vpos)
    context.lineTo(offset.x + scale.x * params.maxV_A, vpos)

    // And the Labels
    var labelY = Number(valueY * 1000).toFixed(0)
    context.save()
    context.translate(offset.x - 5 - 1, vpos)
    context.scale(1, -1) // Reverse out the mirror
    context.fillText(labelY, 0, 0)
    context.restore()
  }
  context.stroke()

  context.textAlign = 'center'
  context.textBaseline = 'bottom'
  context.font = labelFont
  context.save()
  context.translate(offset.x - 30, offset.y + (scale.y * params.maxI_A) / 2)
  context.scale(1, -1) // Reverse out the mirror
  context.rotate(-1.54)
  context.fillText('Ia(ma)', 0, 0)
  context.restore()

  // X Axis
  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.font = scaleFont

  context.lineWidth = 0.25
  context.beginPath()
  context.moveTo(offset.x, offset.y)
  context.lineTo(offset.x + scale.x * params.maxV_A, offset.y)
  context.stroke()

  context.lineWidth = 0.25
  context.beginPath()
  var stepX = params.maxV_A / 10
  for (var tickX = 0; tickX <= 10; tickX++) {
    var valueX = tickX * stepX
    var hpos = offset.x + scale.x * valueX
    context.moveTo(hpos, offset.y - 5)
    context.lineTo(hpos, offset.y + scale.y * params.maxI_A)

    // And the Labels
    var labelX = Number(valueX).toFixed(0)
    context.save()
    context.translate(hpos, offset.y - 5 - 1)
    context.scale(1, -1) // Reverse out the mirror
    // context.rotate(0)
    context.fillText(labelX, 0, 0)
    context.restore()
  }
  context.stroke()

  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.font = labelFont
  context.save()
  context.translate(offset.x + (scale.x * params.maxV_A) / 2, offset.y - 25)
  context.scale(1, -1) // Reverse out the mirror
  context.fillText('Va(V)', 0, 0)
  context.restore()
}

function drawLoadLine(context: CanvasRenderingContext2D, tube: Parameters, Va: number, Ia: number, IaMax: number, scale: Scale, offset: Offset) {
  // Draw the point
  context.lineWidth = 1
  context.fillStyle = 'green'
  context.strokeStyle = 'green'
  context.setLineDash([])

  context.beginPath()
  var pos = toGraph({ x: Va, y: Ia }, scale, offset)
  context.ellipse(pos.x, pos.y, 5, 5, 0, 0, 6.28)
  var posIaM = toGraph({ x: 0, y: IaMax }, scale, offset)
  context.ellipse(posIaM.x, posIaM.y, 5, 5, 0, 0, 6.28)
  context.fill()
  context.beginPath()
  var dx = Va * scale.x
  var dy = (Ia - IaMax) * scale.y
  context.moveTo(posIaM.x, posIaM.y)
  var length = dy > dx ? (IaMax * scale.y) / dy : (tube.maxV_A * scale.x) / dx
  context.lineTo(posIaM.x + dx * length, posIaM.y + dy * length)
  context.stroke()
}

type AnodeGraphProps = React.HTMLProps<HTMLCanvasElement> & { tube: Parameters; Va: number; Ia?: number; Vg?: number; Ra: number }

export function AnodeGraph(props: AnodeGraphProps) {
  var canvasRef = useRef<HTMLCanvasElement>(null)
  var Ia = props.Ia ?? (props.Vg ? anodeCurrent(props.Vg, props.Va, props.tube) : props.tube.maxI_A * 0.1)
  var Va = props.Va
  var IaMax = Va / props.Ra + Ia

  useEffect(() => {
    var canvas = canvasRef.current
    var context = canvas?.getContext('2d')
    if (context) {
      context.fillStyle = '#FFFFFF'
      context.fillRect(0, 0, context.canvas.width, context.canvas.height)

      context.save()
      var offset = { x: 50, y: 50 }
      var border = { x: 30, y: 30 }
      var graphW = canvas!.width - offset.x - border.x
      var graphH = canvas!.height - offset.y - border.y
      var scale = computeScales(graphW, graphH, props.tube)
      context.scale(1, -1)
      context.translate(0, -canvas!.height)

      drawScales(context, props.tube, scale, offset)

      let squarePath = new Path2D()
      squarePath.rect(offset.x, offset.y, graphW, graphH)
      context.clip(squarePath, 'evenodd')

      var maxPower = maxAnodePowerDissipation(props.tube)
      drawAnodeCurves(context, props.tube, scale, offset)
      drawMaxAnodePowerDissipation(context, maxPower, scale, offset)

      drawLoadLine(context, props.tube, Va, Ia, IaMax, scale, offset)

      context.restore()
    }
  })

  return <canvas ref={canvasRef} width={props.width} height={props.height}></canvas>
}
