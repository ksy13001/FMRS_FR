"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Ruler,
  Weight,
  Flag,
  Star,
  Activity,
  PlayCircle,
  Target,
  Footprints,
  Square,
  Layout,
  Zap,
  Brain,
  Dumbbell,
  Shield,
  Heart,
  Eye,
} from "lucide-react"
import Header from "@/components/layout/header"
import ImageWithFallback from "@/components/image-with-fallback"
import Footer from "@/components/layout/footer"

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

export default function PlayerDetailContent() {
  const params = useParams()
  const playerId = params.id as string

  const [player, setPlayer] = useState<PlayerOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/players/${playerId}`)

        if (!response.ok) {
          throw new Error("Player not found")
        }

        const data: PlayerOverview = await response.json()
        setPlayer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load player data")
      } finally {
        setIsLoading(false)
      }
    }

    if (playerId) {
      fetchPlayerData()
    }
  }, [playerId])

  if (isLoading) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col text-xs">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading player data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="bg-slate-100 min-h-screen flex flex-col text-xs">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Player Not Found</h1>
            <p className="text-gray-500 mb-4">{error || "The requested player could not be found."}</p>
            <Link
              href="/players/detail-search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Unknown"
    }
  }

  const getPositionColor = (value: number) => {
    if (value >= 2 && value <= 4) return "bg-red-500"
    if (value >= 5 && value <= 8) return "bg-orange-500"
    if (value >= 9 && value <= 11) return "bg-yellow-400"
    if (value >= 12 && value <= 14) return "bg-lime-500"
    if (value >= 15 && value <= 17) return "bg-green-500"
    if (value >= 18 && value <= 20) return "bg-emerald-400"
    return "bg-gray-400"
  }

  const hasFMData = player.fmPlayerDetailsDto && Object.keys(player.fmPlayerDetailsDto).length > 0

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col text-xs">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-6">
        <div className="w-full max-w-7xl mx-auto px-2">
          <h1 className="text-2xl font-bold mb-2">{player.playerDetailsDto?.name || "Player Profile"}</h1>
          <div className="flex items-center gap-2">
            {player.playerDetailsDto?.teamLogoUrl && (
              <ImageWithFallback
                src={player.playerDetailsDto.teamLogoUrl || "/placeholder.svg"}
                alt="Team Logo"
                className="w-5 h-5 object-contain"
              />
            )}
            <p
              className={`text-base ${!player.playerDetailsDto?.teamName ? "text-orange-300 font-semibold" : "text-slate-300"}`}
            >
              {player.playerDetailsDto?.teamName || "FA (Free Agent)"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-2 py-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-3">
            {/* Player Header */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-400 shadow-sm transition-transform duration-300 transform group-hover:scale-105">
                  <ImageWithFallback
                    src={player.playerDetailsDto?.imageUrl || "/placeholder.svg?height=96&width=96"}
                    alt={player.playerDetailsDto?.name || "Player"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-grow">
                <div className="sm:flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-bold mb-0.5 text-slate-800">
                      {(hasFMData ? player.fmPlayerDetailsDto?.name : player.playerDetailsDto?.name) || "Player Name"}
                    </h2>
                  </div>
                  <div className="mt-1 sm:mt-0">
                    <div className="flex gap-2">
                      <div className="px-2 py-1 bg-emerald-100 rounded-lg text-center">
                        <div className="text-xs font-bold text-slate-600">CA</div>
                        <div className="text-sm font-bold text-emerald-600">
                          {player.playerDetailsDto?.currentAbility || 0}
                        </div>
                      </div>
                      {hasFMData && (
                        <div className="px-2 py-1 bg-blue-100 rounded-lg text-center">
                          <div className="text-xs font-bold text-slate-600">PA</div>
                          <div className="text-sm font-bold text-blue-600">
                            {player.fmPlayerDetailsDto?.potentialAbility || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-0.5">
                    {player.playerDetailsDto?.age && player.playerDetailsDto.age > 0 && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <Calendar className="text-emerald-500" size={12} />
                        <span>
                          Age: {player.playerDetailsDto.age}
                          (DOB: {formatDate(player.playerDetailsDto?.birth || "")})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-700">
                      <Ruler className="text-emerald-500" size={12} />
                      <span>Height: {player.playerDetailsDto?.height || 0} cm</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Weight className="text-emerald-500" size={12} />
                      <span>Weight: {player.playerDetailsDto?.weight || 0} kg</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700">
                      <span>Team: </span>
                      <div className="flex items-center gap-1">
                        {player.playerDetailsDto?.teamName && player.playerDetailsDto?.teamLogoUrl && (
                          <ImageWithFallback
                            src={player.playerDetailsDto.teamLogoUrl || "/placeholder.svg"}
                            alt="Team Logo"
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span className={!player.playerDetailsDto?.teamName ? "text-orange-600 font-semibold" : ""}>
                          {player.playerDetailsDto?.teamName || "FA (Free Agent)"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Flag className="text-emerald-500" size={12} />
                      <span>Nationality: {player.playerDetailsDto?.nationName || "Unknown"}</span>
                    </div>
                    {hasFMData && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <Star className="text-emerald-500" size={12} />
                        <span>Potential: {player.fmPlayerDetailsDto?.potentialAbility || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Season Statistics and Position Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Season Statistics */}
              <div className="bg-slate-50 rounded-xl p-2">
                <h3 className="font-semibold mb-1 flex items-center gap-1 text-sm text-slate-800">
                  <Activity className="text-emerald-500" size={16} />
                  Season Statistics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <PlayCircle className="text-emerald-500" size={12} />
                      <span className="text-xs text-slate-600">Games</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {player.playerStatDto?.gamesPlayed || 0}({player.playerStatDto?.substitutes || 0})
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Target className="text-emerald-500" size={12} />
                      <span className="text-xs text-slate-600">Goals</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {player.playerStatDto?.goal || 0}({player.playerStatDto?.pk || 0})
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Footprints className="text-emerald-500" size={12} />
                      <span className="text-xs text-slate-600">Assists</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{player.playerStatDto?.assist || 0}</span>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Star className="text-emerald-500" size={12} />
                      <span className="text-xs text-slate-600">Rating</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {player.playerStatDto?.rating
                        ? Number.parseFloat(player.playerStatDto.rating).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Square className="text-yellow-500" size={12} />
                      <span className="text-xs text-slate-600">Yellow Cards</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{player.playerStatDto?.yellowCards || 0}</span>
                  </div>
                  <div className="bg-white rounded-lg p-1 shadow-sm">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Square className="text-red-500" size={12} />
                      <span className="text-xs text-slate-600">Red Cards</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{player.playerStatDto?.redCards || 0}</span>
                  </div>
                </div>
              </div>

              {/* Position Map - FM 데이터가 있을 때만 표시 */}
              {hasFMData && player.fmPlayerDetailsDto?.position && (
                <div className="bg-slate-50 rounded-xl p-2">
                  <h3 className="font-semibold mb-1 flex items-center gap-1 text-sm text-slate-800">
                    <Layout className="text-blue-500" size={16} />
                    Position
                  </h3>
                  <div className="flex justify-center items-center">
                    <div
                      className="bg-black rounded-md relative overflow-hidden"
                      style={{ width: "100%", maxWidth: "300px", aspectRatio: "2/1" }}
                    >
                      {/* Field markings */}
                      <div className="absolute w-px h-full left-1/2 bg-gray-700"></div>
                      <div className="absolute w-[20%] h-[60%] border border-gray-700 left-0 top-[20%]"></div>
                      <div className="absolute w-[20%] h-[60%] border border-gray-700 right-0 top-[20%]"></div>
                      <div className="absolute w-[10%] h-[40%] border border-gray-700 left-0 top-[30%]"></div>
                      <div className="absolute w-[10%] h-[40%] border border-gray-700 right-0 top-[30%]"></div>
                      <div className="absolute w-[20%] h-[30%] border border-gray-700 rounded-full left-[40%] top-[35%]"></div>

                      {/* Position dots */}
                      {[
                        {
                          key: "goalkeeper",
                          value: player.fmPlayerDetailsDto.position.goalkeeper,
                          left: "5%",
                          top: "50%",
                          label: "GK",
                        },
                        {
                          key: "defenderLeft",
                          value: player.fmPlayerDetailsDto.position.defenderLeft,
                          left: "20%",
                          top: "20%",
                          label: "DL",
                        },
                        {
                          key: "wingBackLeft",
                          value: player.fmPlayerDetailsDto.position.wingBackLeft,
                          left: "35%",
                          top: "20%",
                          label: "WL",
                        },
                        {
                          key: "midfielderLeft",
                          value: player.fmPlayerDetailsDto.position.midfielderLeft,
                          left: "50%",
                          top: "20%",
                          label: "ML",
                        },
                        {
                          key: "attackingMidLeft",
                          value: player.fmPlayerDetailsDto.position.attackingMidLeft,
                          left: "65%",
                          top: "20%",
                          label: "AL",
                        },
                        {
                          key: "defenderCentral",
                          value: player.fmPlayerDetailsDto.position.defenderCentral,
                          left: "20%",
                          top: "50%",
                          label: "DC",
                        },
                        {
                          key: "defensiveMidfielder",
                          value: player.fmPlayerDetailsDto.position.defensiveMidfielder,
                          left: "35%",
                          top: "50%",
                          label: "DM",
                        },
                        {
                          key: "midfielderCentral",
                          value: player.fmPlayerDetailsDto.position.midfielderCentral,
                          left: "50%",
                          top: "50%",
                          label: "CM",
                        },
                        {
                          key: "attackingMidCentral",
                          value: player.fmPlayerDetailsDto.position.attackingMidCentral,
                          left: "65%",
                          top: "50%",
                          label: "AM",
                        },
                        {
                          key: "striker",
                          value: player.fmPlayerDetailsDto.position.striker,
                          left: "80%",
                          top: "50%",
                          label: "ST",
                        },
                        {
                          key: "defenderRight",
                          value: player.fmPlayerDetailsDto.position.defenderRight,
                          left: "20%",
                          top: "80%",
                          label: "DR",
                        },
                        {
                          key: "wingBackRight",
                          value: player.fmPlayerDetailsDto.position.wingBackRight,
                          left: "35%",
                          top: "80%",
                          label: "WR",
                        },
                        {
                          key: "midfielderRight",
                          value: player.fmPlayerDetailsDto.position.midfielderRight,
                          left: "50%",
                          top: "80%",
                          label: "MR",
                        },
                        {
                          key: "attackingMidRight",
                          value: player.fmPlayerDetailsDto.position.attackingMidRight,
                          left: "65%",
                          top: "80%",
                          label: "AR",
                        },
                      ].map(
                        ({ key, value, left, top, label }) =>
                          value > 1 && (
                            <div
                              key={key}
                              className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${getPositionColor(value)}`}
                              style={{ left, top }}
                            >
                              <span className="text-white text-xs font-bold">{label}</span>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attributes Grid - FM 데이터가 있을 때만 표시 */}
            {hasFMData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Technical/Goalkeeper Attributes */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h3 className="font-semibold mb-2 flex items-center gap-1 text-sm text-slate-800">
                    {player.playerDetailsDto?.isGK ? (
                      <Shield className="text-blue-500" size={16} />
                    ) : (
                      <Zap className="text-emerald-500" size={16} />
                    )}
                    <span>{player.playerDetailsDto?.isGK ? "Goalkeeper" : "Technical"}</span>
                  </h3>
                  <div className="space-y-0.5">
                    {player.playerDetailsDto?.isGK && player.fmPlayerDetailsDto.goalKeeperAttributes ? (
                      // Goalkeeper Attributes
                      <>
                        <AttributeItem
                          name="Aerial Ability"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.aerialAbility}
                        />
                        <AttributeItem
                          name="Command of Area"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.commandOfArea}
                        />
                        <AttributeItem
                          name="Communication"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.communication}
                        />
                        <AttributeItem
                          name="Eccentricity"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.eccentricity}
                        />
                        <AttributeItem
                          name="Handling"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.handling}
                        />
                        <AttributeItem name="Kicking" value={player.fmPlayerDetailsDto.goalKeeperAttributes.kicking} />
                        <AttributeItem
                          name="One on Ones"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.oneOnOnes}
                        />
                        <AttributeItem
                          name="Reflexes"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.reflexes}
                        />
                        <AttributeItem
                          name="Rushing Out"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.rushingOut}
                        />
                        <AttributeItem
                          name="Tendency to Punch"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.tendencyToPunch}
                        />
                        <AttributeItem
                          name="Throwing"
                          value={player.fmPlayerDetailsDto.goalKeeperAttributes.throwing}
                        />
                      </>
                    ) : (
                      // Technical Attributes
                      <>
                        <AttributeItem name="Corners" value={player.fmPlayerDetailsDto.technicalAttributes.corners} />
                        <AttributeItem name="Crossing" value={player.fmPlayerDetailsDto.technicalAttributes.crossing} />
                        <AttributeItem
                          name="Dribbling"
                          value={player.fmPlayerDetailsDto.technicalAttributes.dribbling}
                        />
                        <AttributeItem
                          name="Finishing"
                          value={player.fmPlayerDetailsDto.technicalAttributes.finishing}
                        />
                        <AttributeItem
                          name="First Touch"
                          value={player.fmPlayerDetailsDto.technicalAttributes.firstTouch}
                        />
                        <AttributeItem
                          name="Free Kick Taking"
                          value={player.fmPlayerDetailsDto.technicalAttributes.freeKicks}
                        />
                        <AttributeItem name="Heading" value={player.fmPlayerDetailsDto.technicalAttributes.heading} />
                        <AttributeItem
                          name="Long Shots"
                          value={player.fmPlayerDetailsDto.technicalAttributes.longShots}
                        />
                        <AttributeItem
                          name="Long Throws"
                          value={player.fmPlayerDetailsDto.technicalAttributes.longThrows}
                        />
                        <AttributeItem name="Marking" value={player.fmPlayerDetailsDto.technicalAttributes.marking} />
                        <AttributeItem name="Passing" value={player.fmPlayerDetailsDto.technicalAttributes.passing} />
                        <AttributeItem
                          name="Penalty Taking"
                          value={player.fmPlayerDetailsDto.technicalAttributes.penaltyTaking}
                        />
                        <AttributeItem name="Tackling" value={player.fmPlayerDetailsDto.technicalAttributes.tackling} />
                        <AttributeItem
                          name="Technique"
                          value={player.fmPlayerDetailsDto.technicalAttributes.technique}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Mental Attributes */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h3 className="font-semibold mb-2 flex items-center gap-1 text-sm text-slate-800">
                    <Brain className="text-emerald-500" size={16} />
                    Mental
                  </h3>
                  <div className="space-y-0.5">
                    <AttributeItem name="Aggression" value={player.fmPlayerDetailsDto.mentalAttributes.aggression} />
                    <AttributeItem
                      name="Anticipation"
                      value={player.fmPlayerDetailsDto.mentalAttributes.anticipation}
                    />
                    <AttributeItem name="Bravery" value={player.fmPlayerDetailsDto.mentalAttributes.bravery} />
                    <AttributeItem name="Composure" value={player.fmPlayerDetailsDto.mentalAttributes.composure} />
                    <AttributeItem
                      name="Concentration"
                      value={player.fmPlayerDetailsDto.mentalAttributes.concentration}
                    />
                    <AttributeItem name="Decisions" value={player.fmPlayerDetailsDto.mentalAttributes.decisions} />
                    <AttributeItem
                      name="Determination"
                      value={player.fmPlayerDetailsDto.mentalAttributes.determination}
                    />
                    <AttributeItem name="Flair" value={player.fmPlayerDetailsDto.mentalAttributes.flair} />
                    <AttributeItem name="Leadership" value={player.fmPlayerDetailsDto.mentalAttributes.leadership} />
                    <AttributeItem name="Off The Ball" value={player.fmPlayerDetailsDto.mentalAttributes.offTheBall} />
                    <AttributeItem name="Positioning" value={player.fmPlayerDetailsDto.mentalAttributes.positioning} />
                    <AttributeItem name="Teamwork" value={player.fmPlayerDetailsDto.mentalAttributes.teamwork} />
                    <AttributeItem name="Vision" value={player.fmPlayerDetailsDto.mentalAttributes.vision} />
                    <AttributeItem name="Work Rate" value={player.fmPlayerDetailsDto.mentalAttributes.workRate} />
                  </div>
                </div>

                {/* Physical Attributes */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h3 className="font-semibold mb-2 flex items-center gap-1 text-sm text-slate-800">
                    <Dumbbell className="text-emerald-500" size={16} />
                    Physical
                  </h3>
                  <div className="space-y-0.5">
                    <AttributeItem
                      name="Acceleration"
                      value={player.fmPlayerDetailsDto.physicalAttributes.acceleration}
                    />
                    <AttributeItem name="Agility" value={player.fmPlayerDetailsDto.physicalAttributes.agility} />
                    <AttributeItem name="Balance" value={player.fmPlayerDetailsDto.physicalAttributes.balance} />
                    <AttributeItem
                      name="Jumping Reach"
                      value={player.fmPlayerDetailsDto.physicalAttributes.jumpingReach}
                    />
                    <AttributeItem
                      name="Natural Fitness"
                      value={player.fmPlayerDetailsDto.physicalAttributes.naturalFitness}
                    />
                    <AttributeItem name="Pace" value={player.fmPlayerDetailsDto.physicalAttributes.pace} />
                    <AttributeItem name="Stamina" value={player.fmPlayerDetailsDto.physicalAttributes.stamina} />
                    <AttributeItem name="Strength" value={player.fmPlayerDetailsDto.physicalAttributes.strength} />
                  </div>
                </div>

                {/* Personality & Hidden Attributes */}
                <div className="bg-slate-50 rounded-xl p-3">
                  <h3 className="font-semibold mb-2 flex items-center gap-1 text-sm text-slate-800">
                    <Heart className="text-pink-500" size={16} />
                    Personality
                  </h3>
                  <div className="space-y-0.5">
                    <AttributeItem
                      name="Adaptability"
                      value={player.fmPlayerDetailsDto.personalityAttributes.adaptability}
                    />
                    <AttributeItem name="Ambition" value={player.fmPlayerDetailsDto.personalityAttributes.ambition} />
                    <AttributeItem name="Loyalty" value={player.fmPlayerDetailsDto.personalityAttributes.loyalty} />
                    <AttributeItem name="Pressure" value={player.fmPlayerDetailsDto.personalityAttributes.pressure} />
                    <AttributeItem
                      name="Professional"
                      value={player.fmPlayerDetailsDto.personalityAttributes.professional}
                    />
                    <AttributeItem
                      name="Sportsmanship"
                      value={player.fmPlayerDetailsDto.personalityAttributes.sportsmanship}
                    />
                    <AttributeItem
                      name="Temperament"
                      value={player.fmPlayerDetailsDto.personalityAttributes.temperament}
                    />
                    <AttributeItem
                      name="Controversy"
                      value={player.fmPlayerDetailsDto.personalityAttributes.controversy}
                    />
                  </div>
                  <h4 className="font-semibold mt-3 mb-1 flex items-center gap-1 text-xs text-slate-700">
                    <Eye className="text-purple-500" size={14} />
                    Hidden
                  </h4>
                  <div className="space-y-0.5">
                    <AttributeItem name="Consistency" value={player.fmPlayerDetailsDto.hiddenAttributes.consistency} />
                    <AttributeItem name="Dirtiness" value={player.fmPlayerDetailsDto.hiddenAttributes.dirtiness} />
                    <AttributeItem
                      name="Important Matches"
                      value={player.fmPlayerDetailsDto.hiddenAttributes.importantMatches}
                    />
                    <AttributeItem
                      name="Injury Proneness"
                      value={player.fmPlayerDetailsDto.hiddenAttributes.injuryProneness}
                    />
                    <AttributeItem name="Versatility" value={player.fmPlayerDetailsDto.hiddenAttributes.versatility} />
                  </div>
                </div>
              </div>
            )}

            {/* FM 데이터가 없을 때 메시지 표시 */}
            {!hasFMData && (
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="text-slate-400 mb-2">
                  <Layout size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No FM Data Available</h3>
                <p className="text-slate-500">
                  Football Manager attributes and position data are not available for this player.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
