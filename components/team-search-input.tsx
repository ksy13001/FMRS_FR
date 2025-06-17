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
  value: number | undefined // teamId를 받음
  onChange: (teamId: number | undefined) => void
  placeholder?: string
}

export default function TeamSearchInput({ value, onChange, placeholder = "Search teams..." }: TeamSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [teams, setTeams] = useState<TeamDetailsDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamDetailsDto | undefined>(undefined)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 외부에서 value(teamId)가 변경될 때 처리
  useEffect(() => {
    if (value && !selectedTeam) {
      // teamId가 있지만 selectedTeam이 없는 경우, 팀 정보를 찾아야 함
      // 실제로는 별도 API로 팀 정보를 가져와야 하지만, 여기서는 간단히 처리
      setSearchQuery("")
    } else if (!value) {
      setSelectedTeam(undefined)
      setSearchQuery("")
    }
  }, [value, selectedTeam])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 팀 검색
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => {
        searchTeams(searchQuery.trim())
      }, 200)
    } else if (searchQuery.trim().length === 0) {
      setTeams([])
      setShowDropdown(false)
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery])

  const searchTeams = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data: TeamDetailsDto[] = await response.json()
        setTeams(data.slice(0, 20)) // 최대 20개만 표시
        setShowDropdown(true)
      } else {
        console.error("Failed to fetch teams")
        setTeams([])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)

    // 입력값이 변경되면 선택된 팀 초기화
    if (selectedTeam && newValue !== selectedTeam.teamName) {
      setSelectedTeam(undefined)
      onChange(undefined)
    }
  }

  const handleTeamSelect = (team: TeamDetailsDto) => {
    setSelectedTeam(team)
    setSearchQuery(team.teamName)
    onChange(team.id) // teamId 전달
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSelectedTeam(undefined)
    setSearchQuery("")
    onChange(undefined)
    setShowDropdown(false)
  }

  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2 && teams.length > 0) {
      setShowDropdown(true)
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
          className={`w-full pl-10 ${selectedTeam || isLoading ? "pr-10" : "pr-3"} py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        {selectedTeam && !isLoading && (
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
          <div className="text-xs text-green-600 font-medium">Selected: {selectedTeam.teamName}</div>
        </div>
      )}

      {/* 드롭다운 */}
      {showDropdown && teams.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => handleTeamSelect(team)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
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
      )}

      {/* 검색 결과 없음 */}
      {showDropdown && teams.length === 0 && !isLoading && searchQuery.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-3">
          <div className="text-xs text-gray-500 text-center">No teams found for "{searchQuery}"</div>
        </div>
      )}
    </div>
  )
}
