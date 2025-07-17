"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, MapPin, Calendar, Users, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PlayerData {
  id: string
  name: string
  position: string
  age: number
  nationality: string
  team: string
  league: string
  attributes: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
  }
  stats: {
    appearances: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
  }
  bio: {
    height: string
    weight: string
    preferredFoot: string
    marketValue: string
  }
}

export default function PlayerContent() {
  const params = useParams()
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/players/${params.id}`)
        if (!response.ok) {
          throw new Error("Player not found")
        }
        const data = await response.json()
        setPlayer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load player")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The requested player could not be found."}</p>
          <Button asChild>
            <Link href="/players/detail-search">Back to Search</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/players/detail-search">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Image and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <Image
                    src={`/placeholder.svg?height=192&width=192&text=${player.name}`}
                    alt={player.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-bold mb-2">{player.name}</h1>
                <Badge variant="secondary" className="mb-4">
                  {player.position}
                </Badge>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {player.age} years old
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {player.nationality}
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="mr-2 h-4 w-4" />
                    {player.team}
                  </div>
                  <div className="flex items-center justify-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    {player.league}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="attributes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="bio">Biography</TabsTrigger>
            </TabsList>

            <TabsContent value="attributes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Player Attributes</CardTitle>
                  <CardDescription>Key performance indicators and skills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(player.attributes).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">{key}</span>
                        <span className="font-bold">{value}/100</span>
                      </div>
                      <Progress value={value} className="w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Season Statistics</CardTitle>
                  <CardDescription>Current season performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{player.stats.appearances}</div>
                      <div className="text-sm text-gray-600">Appearances</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{player.stats.goals}</div>
                      <div className="text-sm text-gray-600">Goals</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{player.stats.assists}</div>
                      <div className="text-sm text-gray-600">Assists</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{player.stats.yellowCards}</div>
                      <div className="text-sm text-gray-600">Yellow Cards</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{player.stats.redCards}</div>
                      <div className="text-sm text-gray-600">Red Cards</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Player Information</CardTitle>
                  <CardDescription>Physical attributes and market information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Height</label>
                        <p className="text-lg">{player.bio.height}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Weight</label>
                        <p className="text-lg">{player.bio.weight}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Preferred Foot</label>
                        <p className="text-lg">{player.bio.preferredFoot}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Market Value</label>
                        <p className="text-lg font-bold text-green-600">{player.bio.marketValue}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
