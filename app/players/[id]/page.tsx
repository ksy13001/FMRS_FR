"use client"
import PlayerDetailContent from "./player-content"
import { Suspense } from "react"

interface PlayerPosition {
  goalkeeper: number
  defenderCentral: number
  defenderLeft: number
  defenderRight: number
  wingBackLeft: number
  wingBackRight: number
  defensiveMidfielder: number
  midfielderLeft: number
  midfielderRight: number
  midfielderCentral: number
  attackingMidCentral: number
  attackingMidLeft: number
  attackingMidRight: number
  striker: number
}

interface PersonalityAttributes {
  adaptability: number
  ambition: number
  loyalty: number
  pressure: number
  professional: number
  sportsmanship: number
  temperament: number
  controversy: number
}

interface TechnicalAttributes {
  corners: number
  crossing: number
  dribbling: number
  finishing: number
  firstTouch: number
  freeKicks: number
  heading: number
  longShots: number
  longThrows: number
  marking: number
  passing: number
  penaltyTaking: number
  tackling: number
  technique: number
}

interface MentalAttributes {
  aggression: number
  anticipation: number
  bravery: number
  composure: number
  concentration: number
  decisions: number
  determination: number
  flair: number
  leadership: number
  offTheBall: number
  positioning: number
  teamwork: number
  vision: number
  workRate: number
}

interface PhysicalAttributes {
  acceleration: number
  agility: number
  balance: number
  jumpingReach: number
  naturalFitness: number
  pace: number
  stamina: number
  strength: number
}

interface GoalkeeperAttributes {
  aerialAbility: number
  commandOfArea: number
  communication: number
  eccentricity: number
  handling: number
  kicking: number
  oneOnOnes: number
  reflexes: number
  rushingOut: number
  tendencyToPunch: number
  throwing: number
}

interface HiddenAttributes {
  consistency: number
  dirtiness: number
  importantMatches: number
  injuryProneness: number
  versatility: number
}

interface FMPlayerDetails {
  name: string
  currentAbility: number
  potentialAbility: number
  position: PlayerPosition
  personalityAttributes: PersonalityAttributes
  technicalAttributes: TechnicalAttributes
  mentalAttributes: MentalAttributes
  physicalAttributes: PhysicalAttributes
  goalKeeperAttributes: GoalkeeperAttributes
  hiddenAttributes: HiddenAttributes
}

interface PlayerDetails {
  teamName: string
  teamLogoUrl?: string
  currentAbility: number
  id: number
  playerApiId: number
  name: string
  birth: string
  age: number
  height: number
  weight: number
  nationName: string
  nationLogoUrl?: string
  imageUrl: string
  mappingStatus: string
  isGK: boolean
}

interface PlayerStats {
  gamesPlayed: number
  substitutes: number
  goal: number
  pk: number
  assist: number
  rating: string
  yellowCards: number
  redCards: number
}

interface PlayerOverview {
  playerDetailsDto: PlayerDetails
  fmPlayerDetailsDto?: FMPlayerDetails | null
  playerStatDto: PlayerStats
}

interface AttributeItemProps {
  name: string
  value: number
}

function AttributeItem({ name, value }: AttributeItemProps) {
  const getBarColor = (val: number) => {
    if (val <= 5) return "bg-gray-500"
    if (val <= 10) return "bg-yellow-400"
    if (val <= 15) return "bg-orange-500"
    return "bg-emerald-500"
  }

  return (
    <div className="stat-item flex justify-between items-center rounded-lg text-xs transition-all duration-200 p-1 hover:bg-slate-50">
      <span className="text-slate-700 font-bold">{name}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold w-5 text-right text-slate-900">{value}</span>
        <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${getBarColor(value)}`} style={{ width: `${value * 5}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function PlayerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-100 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PlayerDetailContent />
    </Suspense>
  )
}
