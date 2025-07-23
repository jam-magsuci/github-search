"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, GitFork, ExternalLink, Calendar, Code } from "lucide-react"
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a new QueryClient instance
const queryClient = new QueryClient()

// Define the GitHub repository type
type GitHubRepo = {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  html_url: string
  topics: string[]
  owner: {
    login: string
    avatar_url: string
  }
}

const languageColors: { [key: string]: string } = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Shell: "bg-gray-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Java: "bg-red-500",
  Cpp: "bg-purple-500",
}

export default function GitHubRepoExplorerWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <GitHubRepoExplorer />
    </QueryClientProvider>
  )
}

// Main component
function GitHubRepoExplorer() {
  const [username, setUsername] = useState("")
  const [searched, setSearched] = useState(false)

  // Use React Query to fetch GitHub repositories
  const {
    data: repos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GitHubRepo[]>({
    queryKey: ["repos", username],
    queryFn: async () => {
      if (!username.trim()) return []
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      return response.json()
    },
    enabled: false, // Don't fetch automatically, only when the user clicks search
  })

  const handleSearch = async () => {
    if (!username.trim()) return
    setSearched(true)
    refetch()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">GitHub Repository Explorer</h1>
          <p className="text-slate-600">Discover public repositories from any GitHub user</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Enter GitHub username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading || !username.trim()} className="px-6">
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searched && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                <p className="mt-4 text-slate-600">Fetching repositories...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error fetching repositories: {(error as Error)?.message || 'Unknown error'}</p>
                <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={repos && repos.length > 0 ? repos[0].owner.avatar_url : `/placeholder.svg?height=32&width=32&query=github+user+${username}`} />
                    <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-semibold text-slate-800">{username}'s Repositories</h2>
                  <Badge variant="secondary">{repos?.length || 0} repositories</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {repos && repos.map((repo) => (
                    <Card key={repo.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-slate-800 hover:text-blue-600 cursor-pointer">
                            {repo.name}
                          </CardTitle>
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                          </a>
                        </div>
                        <CardDescription className="text-sm text-slate-600 line-clamp-2">
                          {repo.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Topics */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {repo.topics && repo.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {repo.topics && repo.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{repo.topics.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <div className="flex items-center gap-4">
                            {repo.language && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-3 h-3 rounded-full ${languageColors[repo.language] || "bg-gray-400"}`}
                                />
                                <span>{repo.language}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{repo.stargazers_count.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              <span>{repo.forks_count}</span>
                            </div>
                          </div>
                        </div>

                        {/* Updated date */}
                        <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {repos && repos.length === 0 && (
                  <div className="text-center py-12">
                    <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No public repositories found for this user.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="text-center py-16">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to explore?</h3>
            <p className="text-slate-600">Enter a GitHub username above to discover their public repositories</p>
          </div>
        )}
      </div>
    </div>
  )
}
