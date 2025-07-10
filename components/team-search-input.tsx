"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import ImageWithFallback from "@/components/image-with-fallback"

interface TeamDetailsDto {
  id: number
  teamName: string
  teamLogo: string
}

interface TeamSearchInputProps {
  value: string | undefined // teamName을 받음
  onChange: (teamName: string | undefined) => void
  placeholder?: string
}

export default function TeamSearchInput({ value, onChange, placeholder = "Search teams..." }: TeamSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [teams, setTeams] = useState<TeamDetailsDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamDetailsDto | undefined>(undefined)
  const [hasSearched, setHasSearched] = useState(false) // 검색 실행 여부 추적
  const [isLoadingTeamInfo, setIsLoadingTeamInfo] = useState(false) // 팀 정보 로딩 상태

  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 외부에서 value(teamName)가 변경될 때 처리
  useEffect(() => {
    if (value && value !== searchQuery) {
      // teamName이 있고 현재 검색어와 다르면 검색어 업데이트
      setSearchQuery(value)
      // 해당 팀명으로 팀을 찾아서 설정
      findTeamByName(value)
    } else if (!value) {
      setSelectedTeam(undefined)
      setSearchQuery("")
      setHasSearched(false)
    }
  }, [value])

  // teamName으로 팀 찾기
  const findTeamByName = async (teamName: string) => {
    setIsLoadingTeamInfo(true)
    try {
      console.log(`Finding team by name: ${teamName}`)

      const response = await fetch(`/api/teams?q=${encodeURIComponent(teamName)}`)

      if (response.ok) {
        const data: TeamDetailsDto[] = await response.json()
        const exactMatch = data.find((team) => team.teamName === teamName)

        if (exactMatch) {
          setSelectedTeam(exactMatch)
          console.log(`Found exact match: ${exactMatch.teamName}`)
        } else {
          // 정확한 매치가 없으면 임시로 팀명만 표시
          setSelectedTeam({
            id: 0,
            teamName: teamName,
            teamLogo: "",
          })
        }
      }
    } catch (error) {
      console.error("Error finding team by name:", error)
      // 에러 발생 시 임시로 팀명만 표시
      setSelectedTeam({
        id: 0,
        teamName: teamName,
        teamLogo: "",
      })
    } finally {
      setIsLoadingTeamInfo(false)
    }
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  // 팀 검색
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    // 선택된 팀이 있고 검색어가 팀명과 같으면 검색하지 않음
    if (selectedTeam && searchQuery === selectedTeam.teamName) {
      setShowDropdown(false)
      return
    }

    if (searchQuery.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => {
        searchTeams(searchQuery.trim())
      }, 200)
    } else if (searchQuery.trim().length === 0) {
      setTeams([])
      setShowDropdown(false)
      setHasSearched(false)
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery, selectedTeam])

  const searchTeams = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data: TeamDetailsDto[] = await response.json()
        setTeams(data.slice(0, 20)) // 최대 20개만 표시
        setHasSearched(true) // 검색 실행됨을 표시
        setShowDropdown(true)

        // 만약 현재 선택된 팀이 임시 팀이고, 검색 결과에 실제 팀 정보가 있다면 업데이트
        if (selectedTeam && selectedTeam.teamName.startsWith("Team ID:") && value) {
          const foundTeam = data.find((team) => team.id === value)
          if (foundTeam) {
            setSelectedTeam(foundTeam)
            setSearchQuery(foundTeam.teamName)
          }
        }
      } else {
        console.error("Failed to fetch teams")
        setTeams([])
        setHasSearched(true)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setTeams([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamSelect = (team: TeamDetailsDto) => {
    setSelectedTeam(team)
    setSearchQuery(team.teamName)
    onChange(team.teamName) // teamName 전달
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)

    // 입력값이 변경되면 선택된 팀 초기화
    if (selectedTeam && newValue !== selectedTeam.teamName) {
      setSelectedTeam(undefined)
      onChange(undefined)
    }

    // 선택된 팀이 있고 입력값이 팀명과 같으면 드롭다운 숨기기
    if (selectedTeam && newValue === selectedTeam.teamName) {
      setShowDropdown(false)
    }
  }

  const handleClear = () => {
    setSelectedTeam(undefined)
    setSearchQuery("")
    onChange(undefined)
    setShowDropdown(false)
    setTeams([])
    setHasSearched(false)
  }

  const handleInputFocus = () => {
    // 선택된 팀이 없고 검색어가 2글자 이상이면 항상 드롭다운 표시 시도
    if (!selectedTeam && searchQuery.trim().length >= 2) {
      // 이미 검색한 결과가 있으면 바로 표시
      if (hasSearched && teams.length > 0) {
        setShowDropdown(true)
      }
      // 검색한 결과가 없으면 새로 검색
      else {
        searchTeams(searchQuery.trim())
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1">Team Name</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={isLoadingTeamInfo}
          className={`w-full pl-10 ${selectedTeam || isLoading || isLoadingTeamInfo ? "pr-10" : "pr-3"} py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {(isLoading || isLoadingTeamInfo) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        {selectedTeam && !isLoading && !isLoadingTeamInfo && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 선택된 팀 표시 (팀 로고와 함께) */}
      {selectedTeam && (
        <div className="mt-1 flex items-center gap-2">
          {selectedTeam.teamLogo && (
            <div className="w-4 h-4 rounded overflow-hidden bg-slate-200 flex-shrink-0">
              <ImageWithFallback
                src={selectedTeam.teamLogo || "/placeholder.svg"}
                alt={`${selectedTeam.teamName} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="text-xs text-green-600 font-medium">
            Selected: {selectedTeam.teamName}
            {isLoadingTeamInfo && " (Loading...)"}
          </div>
        </div>
      )}

      {/* 드롭다운 - 완전히 새로운 스크롤 구현 */}
      {showDropdown && teams.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
          <div
            className="overflow-auto"
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => handleTeamSelect(team)}
                className="w-full text-left px-3 py-3 md:py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 active:bg-blue-50 transition-colors"
                style={{ minHeight: "48px" }}
              >
                <div className="flex items-center gap-2">
                  {team.teamLogo && (
                    <div className="w-5 h-5 rounded overflow-hidden bg-slate-200 flex-shrink-0">
                      <ImageWithFallback
                        src={team.teamLogo || "/placeholder.svg"}
                        alt={`${team.teamName} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="font-medium text-gray-800 flex-grow">{team.teamName}</div>
                </div>
              </button>
            ))}
            {teams.length === 20 && (
              <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                Showing first 20 results. Type more to narrow down.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 없음 */}
      {showDropdown && teams.length === 0 && !isLoading && searchQuery.trim().length >= 2 && hasSearched && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-3">
          <div className="text-xs text-gray-500 text-center">No teams found for "{searchQuery}"</div>
        </div>
      )}
    </div>
  )
}
