import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, Database, TrendingUp } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Football Manager Research System</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Comprehensive, up-to-date information about professional soccer players worldwide. Discover detailed player
            statistics, attributes, and career information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input type="text" placeholder="Search for players..." className="pl-10 py-3 text-black" />
            </div>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Player Search</CardTitle>
                <CardDescription>Search for detailed information about football players</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Find players by name, position, team, or any other criteria. Get instant access to comprehensive
                  player profiles.
                </p>
                <Button asChild>
                  <Link href="/players/detail-search">Start Searching</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Use detailed filters to find players by position, age, ability, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Advanced filtering system allows you to narrow down your search with specific criteria and statistical
                  requirements.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/players/detail-search">Detailed Search</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Database className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>About FMRS</CardTitle>
                <CardDescription>Learn more about our comprehensive football player database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access detailed information about thousands of professional football players, including attributes,
                  statistics, and career data.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Database Statistics</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive database contains extensive information about players, teams, and countries from around
              the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-blue-50 p-8 rounded-lg">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-blue-600 mb-2">50,000+</h3>
              <p className="text-gray-600">Players</p>
            </div>

            <div className="bg-green-50 p-8 rounded-lg">
              <Database className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-green-600 mb-2">500+</h3>
              <p className="text-gray-600">Teams</p>
            </div>

            <div className="bg-purple-50 p-8 rounded-lg">
              <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-purple-600 mb-2">100+</h3>
              <p className="text-gray-600">Countries</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
