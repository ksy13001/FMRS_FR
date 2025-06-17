"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Search, Filter, Calendar, Star } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ImageWithFallback from "@/components/image-with-fallback"

interface Player {
  id: number
  name: string
  teamName: string
  teamLogoUrl?: string
  nationName: string
  age: number
  currentAbility?: number
  mappingStatus?: string
  imageUrl: string
}

interface SearchResponse {
  players: Player[]
  hasNext: boolean
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState("")
  const [lastPlayerId, setLastPlayerId] = useState<number | null>(null)
  const [lastMappingStatus, setLastMappingStatus] = useState<string | null>(null)
  const [lastCurrentAbility, setLastCurrentAbility] = useState<number | null>(null)
  const [lastSearchedQuery, setLastSearchedQuery] = useState("") // 마지막으로 실제 검색한 쿼리

  // 검색 컨테이너 참조
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef<string>("")

  const resetState = () => {
    setCurrentPage(0)
    setLastPlayerId(null)
    setLastMappingStatus(null)
    setLastCurrentAbility(null)
    setHasMore(false)
  }

  const performSearch = useCallback(
    async (query: string, isLoadMore = false) => {
      if (!query.trim()) return

      console.log("Performing search for:", query)

      // 새로운 검색인 경우 상태 초기화
      if (!isLoadMore) {
        setSearchResults([])
        resetState()
        setCurrentSearchQuery(query)
        setLastSearchedQuery(query) // 실제 검색한 쿼리 기록
      }

      if (isLoading) return

      setIsLoading(true)
      try {
        // 한번에 10개 결과로 수정
        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: "10",
        })

        // 커서 파라미터는 currentPage > 0이고 isLoadMore일 때만 추가
        if (isLoadMore && currentPage > 0) {
          if (lastPlayerId !== null) {
            params.append("lastPlayerId", lastPlayerId.toString())
          }
          if (lastMappingStatus !== null) {
            params.append("lastMappingStatus", lastMappingStatus)
          }
          if (lastCurrentAbility !== null) {
            params.append("lastCurrentAbility", lastCurrentAbility.toString())
          }
        }

        const response = await fetch(`/api/search/simple-player/${encodeURIComponent(query)}?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: SearchResponse = await response.json()

        if (!isLoadMore) {
          // 새로운 검색: 결과 교체
          setSearchResults(data.players || [])
        } else {
          // 무한 스크롤: 결과 추가 (중복 제거)
          setSearchResults((prev) => {
            const existingIds = new Set(prev.map((player) => player.id))
            const newPlayers = (data.players || []).filter((player) => !existingIds.has(player.id))
            return [...prev, ...newPlayers]
          })
        }

        // 마지막 플레이어 정보 저장
        if (data.players && data.players.length > 0) {
          const lastPlayer = data.players[data.players.length - 1]
          setLastPlayerId(lastPlayer.id)
          setLastCurrentAbility(lastPlayer.currentAbility || null)
          setLastMappingStatus(lastPlayer.mappingStatus || null)
        }

        // hasNext 값 사용
        setHasMore(data.hasNext || false)

        // 성공적으로 로드했으면 페이지 증가
        if (isLoadMore) {
          setCurrentPage((prev) => prev + 1)
        }

        setShowResults(true)
      } catch (error) {
        console.error("Search error:", error)
        if (!isLoadMore) {
          setSearchResults([])
        }
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, currentPage, lastPlayerId, lastMappingStatus, lastCurrentAbility],
  )

  // 검색어 변화 감지 및 검색 실행
  useEffect(() => {
    const trimmedQuery = searchQuery.trim()

    // 현재 쿼리를 ref에 저장
    lastQueryRef.current = trimmedQuery

    // 기존 타이머 클리어
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }

    if (trimmedQuery && trimmedQuery.length >= 2) {
      // 검색 타이머 설정
      searchTimerRef.current = setTimeout(() => {
        // 타이머 실행 시점에서 현재 검색어와 ref의 검색어가 같은지 확인
        const currentQuery = lastQueryRef.current
        console.log("Timer executed - Current query:", currentQuery, "Last searched:", lastSearchedQuery)

        if (currentQuery && currentQuery.length >= 2 && currentQuery !== lastSearchedQuery) {
          console.log("Executing search for:", currentQuery)
          performSearch(currentQuery, false)
        }
      }, 300) // 300ms 후 검색
    } else {
      setSearchResults([])
      setShowResults(false)
      resetState()
      setLastSearchedQuery("")
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
    }
  }, [searchQuery, lastSearchedQuery, performSearch])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadMore = () => {
    if (!isLoading && hasMore && currentSearchQuery.trim()) {
      performSearch(currentSearchQuery, true) // isLoadMore = true
    }
  }

  const handleResultsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      loadMore()
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const handleEnterSearch = () => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length >= 2) {
      // Enter 키 검색 시 타이머 클리어하고 즉시 검색
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }
      console.log("Enter key search for:", trimmedQuery)
      performSearch(trimmedQuery, false)
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col text-sm">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-12">
        <div className="w-full max-w-7xl mx-auto px-2 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Football Manager Research System</h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        {/* Search Container */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Player Search</h2>
          <div className="relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleInputFocus}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleEnterSearch()
                  }
                }}
                placeholder="Enter player name (min 2 characters)..."
                className={`w-full pl-12 ${isLoading ? "pr-12" : "pr-4"} py-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-lg`}
              />
            </div>

            {/* Search Results Container */}
            {showResults && (
              <div
                className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto"
                onScroll={handleResultsScroll}
              >
                {searchResults.length === 0 && !isLoading ? (
                  <div className="p-4 text-center text-slate-500">No players found</div>
                ) : (
                  <div>
                    {searchResults.map((player) => (
                      <Link
                        key={`player-${player.id}`}
                        href={`/players/${player.id}`}
                        className="block p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-sm">
                            <ImageWithFallback
                              src={player.imageUrl || "/placeholder.svg"}
                              alt={player.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-slate-800">{player.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <div className="flex items-center gap-1">
                                {player.teamLogoUrl && (
                                  <ImageWithFallback
                                    src={player.teamLogoUrl || "/placeholder.svg"}
                                    alt="Team logo"
                                    className="w-4 h-4"
                                  />
                                )}
                                <span>{player.teamName}</span>
                              </div>
                              {player.age && player.age > 0 && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Age: {player.age}</span>
                                  </div>
                                </>
                              )}
                              {player.currentAbility && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Star size={12} />
                                    <span>CA: {player.currentAbility}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-600">{player.nationName}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {isLoading && (
                      <div className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                          <span>Loading more results...</span>
                        </div>
                      </div>
                    )}

                    {hasMore && !isLoading && (
                      <div className="p-2 text-center text-xs text-slate-500">
                        <div className="flex items-center justify-center">
                          <span>Scroll for more results</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advanced Search Button */}
          <div className="mt-4 text-center">
            <Link
              href="/players/detail-search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Filter className="mr-2" size={16} />
              Detailed Search
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
