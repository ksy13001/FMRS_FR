"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface Position {
  name: string
  value: number
  y: number
}

interface PositionMapProps {
  positions: {
    striker?: number
    attackingMidLeft?: number
    attackingMidCentral?: number
    attackingMidRight?: number
    midfielderLeft?: number
    midfielderCentral?: number
    midfielderRight?: number
    defensiveMidfielder?: number
    wingBackLeft?: number
    wingBackRight?: number
    defenderLeft?: number
    defenderCentral?: number
    defenderRight?: number
    goalkeeper?: number
  }
}

const PositionMap: React.FC<PositionMapProps> = ({ positions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with 3:2 aspect ratio
    const containerWidth = canvas.parentElement?.clientWidth || 300
    const canvasHeight = containerWidth * (2 / 3)
    canvas.width = containerWidth
    canvas.height = canvasHeight
    canvas.style.height = `${canvasHeight}px`

    // Draw field background
    ctx.fillStyle = "#000000" // Pure black background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw field markings with very subtle gray lines
    ctx.strokeStyle = "#222222" // Very dark gray for subtle lines
    ctx.lineWidth = 1

    // Field outline
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Center line
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Center circle
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 6, 0, Math.PI * 2)
    ctx.stroke()

    // Goal areas
    const goalAreaWidth = canvas.width / 10
    const goalAreaHeight = canvas.height / 3
    const goalAreaY = canvas.height / 2 - goalAreaHeight / 2

    // Left goal area
    ctx.strokeRect(0, goalAreaY, goalAreaWidth, goalAreaHeight)

    // Right goal area
    ctx.strokeRect(canvas.width - goalAreaWidth, goalAreaY, goalAreaWidth, goalAreaHeight)

    // Position data - all concentrated on the left side
    const positionData: Position[] = [
      { name: "striker", value: positions.striker || 0, y: canvas.height * 0.1 },
      { name: "attackingMidLeft", value: positions.attackingMidLeft || 0, y: canvas.height * 0.2 },
      { name: "attackingMidCentral", value: positions.attackingMidCentral || 0, y: canvas.height * 0.25 },
      { name: "attackingMidRight", value: positions.attackingMidRight || 0, y: canvas.height * 0.3 },
      { name: "midfielderLeft", value: positions.midfielderLeft || 0, y: canvas.height * 0.35 },
      { name: "midfielderCentral", value: positions.midfielderCentral || 0, y: canvas.height * 0.4 },
      { name: "midfielderRight", value: positions.midfielderRight || 0, y: canvas.height * 0.45 },
      { name: "defensiveMidfielder", value: positions.defensiveMidfielder || 0, y: canvas.height * 0.5 },
      { name: "wingBackLeft", value: positions.wingBackLeft || 0, y: canvas.height * 0.55 },
      { name: "wingBackRight", value: positions.wingBackRight || 0, y: canvas.height * 0.6 },
      { name: "defenderLeft", value: positions.defenderLeft || 0, y: canvas.height * 0.65 },
      { name: "defenderCentral", value: positions.defenderCentral || 0, y: canvas.height * 0.7 },
      { name: "defenderRight", value: positions.defenderRight || 0, y: canvas.height * 0.75 },
      { name: "goalkeeper", value: positions.goalkeeper || 0, y: canvas.height * 0.85 },
    ]

    // Draw position indicators - all on the left side
    const squareSize = Math.min(canvas.width, canvas.height) * 0.06
    const leftMargin = 10 // Fixed 10px from the left edge

    positionData.forEach((pos) => {
      if (pos.value > 0) {
        // Determine color based on value
        if (pos.value < 10) {
          ctx.fillStyle = "#6B7280" // gray-500
        } else if (pos.value < 15) {
          ctx.fillStyle = "#FBBF24" // yellow-400
        } else {
          ctx.fillStyle = "#34D399" // green-400
        }

        ctx.fillRect(leftMargin, pos.y - squareSize / 2, squareSize, squareSize)
      }
    })
  }, [positions])

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ aspectRatio: "3/2" }} />
      <div className="mt-2 text-center text-xs text-slate-500">
        <span className="inline-block px-1 mx-1">
          <span className="inline-block w-2 h-2 bg-gray-500 rounded-sm mr-1"></span> &lt;10
        </span>
        <span className="inline-block px-1 mx-1">
          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-sm mr-1"></span> 10-14
        </span>
        <span className="inline-block px-1 mx-1">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-sm mr-1"></span> 15-20
        </span>
      </div>
    </div>
  )
}

export default PositionMap
