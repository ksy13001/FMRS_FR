"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ChevronDown, User, Zap, Brain, Dumbbell, Layout, ArrowRight, Star } from "lucide-react"
import Header from "@/components/layout/header"
import ImageWithFallback from "@/components/image-with-fallback"
import Footer from "@/components/layout/footer"
import TeamSearchInput from "@/components/team-search-input"

interface SearchCondition {
  ageMin?: number
  ageMax?: number
  nationName?: string
  teamId?: number // teamName 대신 teamId 사용
  // Technical attributes
  corners?: number
  crossing?: number
  dribbling?: number
  finishing?: number
  firstTouch?: number
  freeKickTaking?: number
  heading?: number
  longShots?: number
  longThrows?: number
  marking?: number
  passing?: number
  penaltyTaking?: number
  tackling?: number
  technique?: number
  // Mental attributes
  aggression?: number
  anticipation?: number
  bravery?: number
  composure?: number
  concentration?: number
  decisions?: number
  determination?: number
  flair?: number
  leadership?: number
  offTheBall?: number
  positioning?: number
  teamwork?: number
  vision?: number
  workRate?: number
  // Physical attributes
  acceleration?: number
  agility?: number
  balance?: number
  jumpingReach?: number
  naturalFitness?: number
  pace?: number
  stamina?: number
  strength?: number
  // Position ratings
  GK?: number
  LB?: number
  CB?: number
  RB?: number
  LWB?: number
  RWB?: number
  DM?: number
  LM?: number
  CM?: number
  RM?: number
  LAM?: number
  CAM?: number
  RAM?: number
  ST?: number
}

interface Player {
  id: number
  name: string
  teamName: string
  teamLogoUrl?: string
  nationName: string
  age: number
  currentAbility?: number
  imageUrl: string
  topAttributes: string[] // Top 3 능력치 추가
}

interface SearchResponse {
  players?: Player[]
  totalElements: number
  totalPages: number
}

interface CollapsibleSectionProps {
  id: string
  title: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  isCollapsed: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleSection({
  id,
  title,
  icon,
  bgColor,
  textColor,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="form-section mb-4">
      <div
        className={`section-header flex items-center justify-between ${bgColor} p-3 md:p-2 rounded-lg cursor-pointer`}
        onClick={onToggle}
      >
        <h2 className={`text-sm font-semibold ${textColor} flex items-center`}>
          {icon}
          {title}
        </h2>
        <ChevronDown
          className={`toggle-icon ${textColor} transition-transform duration-300 ${isCollapsed ? "-rotate-90" : ""}`}
          size={16}
        />
      </div>
      {!isCollapsed && <div className="section-content mt-2 p-2">{children}</div>}
    </div>
  )
}

interface AttributeInputProps {
  label: string
  field: keyof SearchCondition
  value: number | undefined
  onChange: (field: keyof SearchCondition, value: number | undefined) => void
  min?: number
  max?: number
}

function AttributeInput({ label, field, value, onChange, min = 1, max = 20 }: AttributeInputProps) {
  const [showError, setShowError] = useState(false)
  const [inputValue, setInputValue] = useState(value?.toString() || "")

  // value prop이 변경될 때 inputValue 동기화
  useEffect(() => {
    setInputValue(value?.toString() || "")
  }, [value])

  return (
    <div className="relative">
      <label htmlFor={field} className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        id={field}
        value={inputValue}
        onChange={(e) => {
          const newInputValue = e.target.value.trim()
          setInputValue(newInputValue)

          if (newInputValue === "") {
            onChange(field, undefined)
            setShowError(false)
            return
          }

          const numValue = Number(newInputValue)
          if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            onChange(field, numValue)
            setShowError(false)
          } else {
            setInputValue("") // 잘못된 값 입력 시 입력창 비우기
            onChange(field, undefined)
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
          }
        }}
        onBlur={() => {
          setShowError(false)
        }}
        className={`w-full px-2 py-2 md:py-1 text-xs border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          showError ? "border-red-300 bg-red-50" : "border-gray-300"
        }`}
      />
      {showError && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg">
          <div className="text-xs text-red-700 font-medium">
            Please enter a number between {min} and {max}
          </div>
        </div>
      )}
    </div>
  )
}

interface NationDto {
  nationName: string
}

export default function PlayerDetailSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 기본값 설정: ageMin=15, ageMax=50
  const [searchCondition, setSearchCondition] = useState<SearchCondition>({
    ageMin: 15,
    ageMax: 50,
  })

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [sortBy, setSortBy] = useState("name")

  // Section collapse states
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    technical: true,
    mental: true,
    physical: true,
    position: true,
  })

  // Selected positions for the interactive map
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set())

  // 숫자 필드 목록 정의 (teamId 추가)
  const numericFields = [
    "ageMin",
    "ageMax",
    "teamId",
    "corners",
    "crossing",
    "dribbling",
    "finishing",
    "firstTouch",
    "freeKickTaking",
    "heading",
    "longShots",
    "longThrows",
    "marking",
    "passing",
    "penaltyTaking",
    "tackling",
    "technique",
    "aggression",
    "anticipation",
    "bravery",
    "composure",
    "concentration",
    "decisions",
    "determination",
    "flair",
    "leadership",
    "offTheBall",
    "positioning",
    "teamwork",
    "vision",
    "workRate",
    "acceleration",
    "agility",
    "balance",
    "jumpingReach",
    "naturalFitness",
    "pace",
    "stamina",
    "strength",
    "GK",
    "LB",
    "CB",
    "RB",
    "LWB",
    "RWB",
    "DM",
    "LM",
    "CM",
    "RM",
    "LAM",
    "CAM",
    "RAM",
    "ST",
  ]

  const [nations, setNations] = useState<NationDto[]>([])
  const [isLoadingNations, setIsLoadingNations] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())

    // URL에 파라미터가 없으면 기본값만 설정하고 리턴
    if (Object.keys(params).length === 0) {
      return
    }

    // 기본값 설정: ageMin=15, ageMax=50
    const newCondition: SearchCondition = { ageMin: 15, ageMax: 50 }

    Object.entries(params).forEach(([key, value]) => {
      if (key === "page" || key === "size" || key === "sort") return

      if (numericFields.includes(key)) {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          ;(newCondition as any)[key] = numValue
        }
      } else if (value && value !== "") {
        ;(newCondition as any)[key] = value
      }
    })

    // 현재 상태와 다를 때만 업데이트
    const currentConditionStr = JSON.stringify(searchCondition)
    const newConditionStr = JSON.stringify(newCondition)

    if (currentConditionStr !== newConditionStr) {
      setSearchCondition(newCondition)
    }

    setCurrentPage(Number.parseInt(params.page || "0"))
    setSortBy(params.sort || "name")

    // Update selected positions
    const positions = ["GK", "LB", "CB", "RB", "LWB", "RWB", "DM", "LM", "CM", "RM", "LAM", "CAM", "RAM", "ST"]
    const selected = new Set<string>()
    positions.forEach((pos) => {
      if (params[pos] && Number.parseInt(params[pos]) >= 15) {
        selected.add(pos)
      }
    })
    setSelectedPositions(selected)

    // Perform search if there are search parameters
    if (Object.keys(params).some((key) => !["page", "size", "sort"].includes(key))) {
      performSearch(newCondition, Number.parseInt(params.page || "0"), params.sort || "name")
    }
  }, [searchParams])

  // Load nations on component mount
  useEffect(() => {
    const fetchNations = async () => {
      setIsLoadingNations(true)
      try {
        const response = await fetch("/api/nations")
        if (response.ok) {
          const data: NationDto[] = await response.json()
          setNations(data)
        } else {
          console.error("Failed to fetch nations")
        }
      } catch (error) {
        console.error("Error fetching nations:", error)
      } finally {
        setIsLoadingNations(false)
      }
    }

    fetchNations()
  }, [])

  const performSearch = async (condition: SearchCondition, page = 0, sort = "name") => {
    setSearchResults(null)
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("ageMin", (condition.ageMin || 15).toString())
      params.append("ageMax", (condition.ageMax || 50).toString())
      Object.entries(condition).forEach(([key, value]) => {
        if (key !== "ageMin" && key !== "ageMax" && value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
      params.append("page", page.toString())
      params.append("size", "10")
      if (sort) params.append("sort", sort)
      const response = await fetch(`/api/search/detail-player?${params}`)
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }
      const data = await response.json()
      setSearchResults({
        players: Array.isArray(data.players) ? data.players : [],
        totalElements: typeof data.totalElements === "number" ? data.totalElements : 0,
        totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
      })
    } catch (error) {
      setSearchResults({
        players: [],
        totalElements: 0,
        totalPages: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    performSearch(searchCondition, 0, sortBy)
    updateURL(searchCondition, 0, sortBy)
  }

  const updateURL = (condition: SearchCondition, page: number, sort: string) => {
    const params = new URLSearchParams()

    // 항상 ageMin과 ageMax 포함
    params.append("ageMin", (condition.ageMin || 15).toString())
    params.append("ageMax", (condition.ageMax || 50).toString())

    // 나머지 조건들 추가
    Object.entries(condition).forEach(([key, value]) => {
      if (key !== "ageMin" && key !== "ageMax" && value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    params.append("page", page.toString())
    params.append("size", "10")
    if (sort) params.append("sort", sort)

    const newUrl = `/players/detail-search?${params.toString()}`
    router.push(newUrl)
  }

  const handleReset = () => {
    const resetCondition = { ageMin: 15, ageMax: 50 }
    setSearchCondition(resetCondition)
    setSelectedPositions(new Set())
  }

  const handleConditionChange = (field: keyof SearchCondition, value: any) => {
    // 값이 실제로 변경되었을 때만 업데이트
    if (searchCondition[field] === value) {
      return
    }

    const newCondition = {
      ...searchCondition,
      [field]: value,
    }
    setSearchCondition(newCondition)
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const togglePosition = (position: string) => {
    const newSelected = new Set(selectedPositions)
    if (newSelected.has(position)) {
      newSelected.delete(position)
      handleConditionChange(position as keyof SearchCondition, undefined)
    } else {
      newSelected.add(position)
      handleConditionChange(position as keyof SearchCondition, 15)
    }
    setSelectedPositions(newSelected)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    performSearch(searchCondition, page, sortBy)
    updateURL(searchCondition, page, sortBy)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(0)
    performSearch(searchCondition, 0, newSort)
    updateURL(searchCondition, 0, newSort)
  }

  // 검색 결과가 있는지 안전하게 확인하는 함수
  const hasSearchResults = () => {
    return (
      searchResults && searchResults.players && Array.isArray(searchResults.players) && searchResults.players.length > 0
    )
  }

  // 페이지네이션이 필요한지 확인하는 함수
  const hasPagination = () => {
    return searchResults && typeof searchResults.totalPages === "number" && searchResults.totalPages > 1
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col text-sm">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-6">
        <div className="w-full max-w-7xl mx-auto px-2">
          <h1 className="text-2xl font-bold mb-2">Advanced Player Search</h1>
          <p className="text-base text-slate-300">Find players with specific attributes and characteristics</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-2 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-20 md:top-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
                className="p-4"
              >
                {/* Basic Information Section */}
                <CollapsibleSection
                  id="basic"
                  title="Basic Information"
                  icon={<User className="mr-2" size={16} />}
                  bgColor="bg-blue-50"
                  textColor="text-blue-800"
                  isCollapsed={collapsedSections.basic}
                  onToggle={() => toggleSection("basic")}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="ageMin" className="block text-xs font-medium text-gray-700 mb-1">
                          Min Age
                        </label>
                        <select
                          id="ageMin"
                          value={searchCondition.ageMin || 15}
                          onChange={(e) => handleConditionChange("ageMin", Number(e.target.value))}
                          className="w-full px-2 py-2 md:py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Array.from({ length: 36 }, (_, i) => i + 15).map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ageMax" className="block text-xs font-medium text-gray-700 mb-1">
                          Max Age
                        </label>
                        <select
                          id="ageMax"
                          value={searchCondition.ageMax || 50}
                          onChange={(e) => handleConditionChange("ageMax", Number(e.target.value))}
                          className="w-full px-2 py-2 md:py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Array.from({ length: 36 }, (_, i) => i + 15).map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="nationName" className="block text-xs font-medium text-gray-700 mb-1">
                        Nation Name
                      </label>
                      <select
                        id="nationName"
                        value={searchCondition.nationName || ""}
                        onChange={(e) => handleConditionChange("nationName", e.target.value || undefined)}
                        disabled={isLoadingNations}
                        className="w-full px-2 py-2 md:py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="">All Nations</option>
                        {nations.map((nation) => (
                          <option key={nation.nationName} value={nation.nationName}>
                            {nation.nationName}
                          </option>
                        ))}
                      </select>
                      {isLoadingNations && <div className="text-xs text-gray-500 mt-1">Loading nations...</div>}
                    </div>
                    {/* 팀 검색 - teamId 전달 */}
                    <div>
                      <TeamSearchInput
                        value={searchCondition.teamId}
                        onChange={(teamId) => handleConditionChange("teamId", teamId)}
                        placeholder="Search teams (min 2 characters)..."
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Technical Attributes Section */}
                <CollapsibleSection
                  id="technical"
                  title="Technical Attributes"
                  icon={<Zap className="mr-2" size={16} />}
                  bgColor="bg-green-50"
                  textColor="text-green-800"
                  isCollapsed={collapsedSections.technical}
                  onToggle={() => toggleSection("technical")}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <AttributeInput
                      label="Corners"
                      field="corners"
                      value={searchCondition.corners}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Crossing"
                      field="crossing"
                      value={searchCondition.crossing}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Dribbling"
                      field="dribbling"
                      value={searchCondition.dribbling}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Finishing"
                      field="finishing"
                      value={searchCondition.finishing}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="First Touch"
                      field="firstTouch"
                      value={searchCondition.firstTouch}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Free Kicks"
                      field="freeKickTaking"
                      value={searchCondition.freeKickTaking}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Heading"
                      field="heading"
                      value={searchCondition.heading}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Long Shots"
                      field="longShots"
                      value={searchCondition.longShots}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Long Throws"
                      field="longThrows"
                      value={searchCondition.longThrows}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Marking"
                      field="marking"
                      value={searchCondition.marking}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Passing"
                      field="passing"
                      value={searchCondition.passing}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Penalties"
                      field="penaltyTaking"
                      value={searchCondition.penaltyTaking}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Tackling"
                      field="tackling"
                      value={searchCondition.tackling}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Technique"
                      field="technique"
                      value={searchCondition.technique}
                      onChange={handleConditionChange}
                    />
                  </div>
                </CollapsibleSection>

                {/* Mental Attributes Section */}
                <CollapsibleSection
                  id="mental"
                  title="Mental Attributes"
                  icon={<Brain className="mr-2" size={16} />}
                  bgColor="bg-yellow-50"
                  textColor="text-yellow-800"
                  isCollapsed={collapsedSections.mental}
                  onToggle={() => toggleSection("mental")}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <AttributeInput
                      label="Aggression"
                      field="aggression"
                      value={searchCondition.aggression}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Anticipation"
                      field="anticipation"
                      value={searchCondition.anticipation}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Bravery"
                      field="bravery"
                      value={searchCondition.bravery}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Composure"
                      field="composure"
                      value={searchCondition.composure}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Concentration"
                      field="concentration"
                      value={searchCondition.concentration}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Decisions"
                      field="decisions"
                      value={searchCondition.decisions}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Determination"
                      field="determination"
                      value={searchCondition.determination}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Flair"
                      field="flair"
                      value={searchCondition.flair}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Leadership"
                      field="leadership"
                      value={searchCondition.leadership}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Off The Ball"
                      field="offTheBall"
                      value={searchCondition.offTheBall}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Positioning"
                      field="positioning"
                      value={searchCondition.positioning}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Teamwork"
                      field="teamwork"
                      value={searchCondition.teamwork}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Vision"
                      field="vision"
                      value={searchCondition.vision}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Work Rate"
                      field="workRate"
                      value={searchCondition.workRate}
                      onChange={handleConditionChange}
                    />
                  </div>
                </CollapsibleSection>

                {/* Physical Attributes Section */}
                <CollapsibleSection
                  id="physical"
                  title="Physical Attributes"
                  icon={<Dumbbell className="mr-2" size={16} />}
                  bgColor="bg-red-50"
                  textColor="text-red-800"
                  isCollapsed={collapsedSections.physical}
                  onToggle={() => toggleSection("physical")}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <AttributeInput
                      label="Acceleration"
                      field="acceleration"
                      value={searchCondition.acceleration}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Agility"
                      field="agility"
                      value={searchCondition.agility}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Balance"
                      field="balance"
                      value={searchCondition.balance}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Jumping"
                      field="jumpingReach"
                      value={searchCondition.jumpingReach}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Fitness"
                      field="naturalFitness"
                      value={searchCondition.naturalFitness}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Pace"
                      field="pace"
                      value={searchCondition.pace}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Stamina"
                      field="stamina"
                      value={searchCondition.stamina}
                      onChange={handleConditionChange}
                    />
                    <AttributeInput
                      label="Strength"
                      field="strength"
                      value={searchCondition.strength}
                      onChange={handleConditionChange}
                    />
                  </div>
                </CollapsibleSection>

                {/* Position Attributes Section */}
                <CollapsibleSection
                  id="position"
                  title="Position Ratings"
                  icon={<Layout className="mr-2" size={16} />}
                  bgColor="bg-purple-50"
                  textColor="text-purple-800"
                  isCollapsed={collapsedSections.position}
                  onToggle={() => toggleSection("position")}
                >
                  <div className="mb-4">
                    <h3 className="text-xs font-medium text-gray-700 mb-2">
                      Click on positions to set minimum rating to 15:
                    </h3>
                    <div className="flex justify-center items-center">
                      <div
                        className="bg-black rounded-md relative overflow-hidden"
                        style={{ width: "100%", maxWidth: "400px", aspectRatio: "2/1" }}
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
                          { pos: "GK", left: "5%", top: "50%", label: "GK" },
                          { pos: "LB", left: "25%", top: "25%", label: "LB" },
                          { pos: "LWB", left: "40%", top: "25%", label: "LWB" },
                          { pos: "LM", left: "55%", top: "25%", label: "LM" },
                          { pos: "LAM", left: "70%", top: "25%", label: "LAM" },
                          { pos: "CB", left: "25%", top: "50%", label: "CB" },
                          { pos: "DM", left: "40%", top: "50%", label: "DM" },
                          { pos: "CM", left: "55%", top: "50%", label: "CM" },
                          { pos: "CAM", left: "70%", top: "50%", label: "CAM" },
                          { pos: "ST", left: "85%", top: "50%", label: "ST" },
                          { pos: "RB", left: "25%", top: "75%", label: "RB" },
                          { pos: "RWB", left: "40%", top: "75%", label: "RWB" },
                          { pos: "RM", left: "55%", top: "75%", label: "RM" },
                          { pos: "RAM", left: "70%", top: "75%", label: "RAM" },
                        ].map(({ pos, left, top, label }) => (
                          <div
                            key={pos}
                            className={`absolute w-8 h-8 md:w-6 md:h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-all duration-300 border-2 border-transparent ${
                              selectedPositions.has(pos)
                                ? "bg-emerald-500 border-emerald-600 shadow-lg"
                                : "bg-gray-500 hover:bg-gray-400"
                            }`}
                            style={{ left, top }}
                            onClick={() => togglePosition(pos)}
                          >
                            <span className="text-white text-[9px] font-bold text-shadow">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-center text-xs text-slate-500">
                      <span className="inline-block px-1 mx-1">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-sm mr-1"></span> Selected (Min 15)
                      </span>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Submit Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-xs"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center text-xs disabled:opacity-50"
                  >
                    <Search className="mr-1" size={12} />
                    {isLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Search Results Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Search Results</h2>

                {/* Results Count and Sort Options */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-slate-600">
                    {searchResults ? `${searchResults.totalElements || 0} players found` : "0 players found"}
                    {searchResults && searchResults.totalPages > 0 && (
                      <span className="ml-1">
                        (Page {currentPage + 1} of {searchResults.totalPages})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sortBy" className="text-xs text-slate-600">
                      Sort by:
                    </label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="name">Name</option>
                      <option value="age">Age</option>
                      <option value="currentAbility">Current Ability</option>
                      <option value="teamName">Team</option>
                      <option value="nationName">Nation</option>
                    </select>
                  </div>
                </div>

                {/* No Results Message */}
                {!isLoading && !hasSearchResults() && searchResults !== null && (
                  <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <Search className="text-gray-400 mx-auto mb-2" size={48} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Players Found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria to find more players.</p>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">Searching players...</p>
                  </div>
                )}

                {/* Results Grid */}
                {!isLoading && hasSearchResults() && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults!.players!.map((player) => (
                      <div
                        key={player.id}
                        className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition duration-300"
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="relative group">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-sm transition-transform duration-300 transform group-hover:scale-105">
                                <ImageWithFallback
                                  src={player.imageUrl || "/placeholder.svg"}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-sm font-semibold mb-0.5">
                                <Link
                                  href={`/players/${player.id}`}
                                  className="text-slate-800 hover:text-blue-600 transition duration-300"
                                >
                                  {player.name}
                                </Link>
                              </h3>
                              <div className="flex flex-col text-xs">
                                <div className="flex items-center">
                                  {player.teamLogoUrl && (
                                    <ImageWithFallback
                                      src={player.teamLogoUrl || "/placeholder.svg"}
                                      alt="Team logo"
                                      className="w-4 h-4 mr-1"
                                    />
                                  )}
                                  <span className="text-slate-600">{player.teamName}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {player.age && player.age > 0 && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 rounded-full text-xs text-blue-800">
                                      Age: {player.age}
                                    </span>
                                  )}
                                  {player.currentAbility && (
                                    <span className="px-1.5 py-0.5 bg-green-100 rounded-full text-xs text-green-800">
                                      CA: {player.currentAbility}
                                    </span>
                                  )}
                                </div>
                                {/* Top 3 능력치 표시 */}
                                {player.topAttributes && player.topAttributes.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="text-yellow-500" size={10} />
                                    <span className="text-xs text-slate-600">
                                      {player.topAttributes.slice(0, 3).join(", ")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-600">{player.nationName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 px-3 py-1.5 flex justify-between items-center">
                          <div className="text-xs text-slate-600">
                            <span>Player Details</span>
                          </div>
                          <Link
                            href={`/players/${player.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 transition duration-300 flex items-center"
                          >
                            View Profile
                            <ArrowRight className="ml-1" size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!isLoading && hasPagination() && (
                  <div className="mt-6 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-4 py-3 md:px-3 md:py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="rotate-90" size={16} />
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(7, searchResults!.totalPages) }, (_, i) => {
                        let pageNum: number
                        if (searchResults!.totalPages <= 7) {
                          pageNum = i
                        } else if (currentPage <= 3) {
                          pageNum = i
                        } else if (currentPage >= searchResults!.totalPages - 4) {
                          pageNum = searchResults!.totalPages - 7 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === currentPage
                                ? "bg-blue-50 text-blue-600 border-blue-300"
                                : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        )
                      })}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(Math.min(searchResults!.totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= searchResults!.totalPages - 1}
                        className="relative inline-flex items-center px-4 py-3 md:px-3 md:py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronDown className="-rotate-90" size={16} />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
