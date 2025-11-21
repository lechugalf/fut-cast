"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { LeagueFilter } from "./league-filter"
import { MatchDetails } from "./match-details"
import { MatchList } from "./match-list"
import { useMediaQuery } from "@/app/hooks/use-mobile"
import type { League, Event as Match } from "@/app/lib/types"
import { CloudSunRain } from "lucide-react"

interface SoccerDashboardProps {
    leagues: League[]
    matches: Match[]
    selectedMatch: Match | null
}

export function SoccerDashboard({ leagues, matches, selectedMatch }: SoccerDashboardProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const toggleLeague = (leagueId: string) => {
        setSelectedLeagues((prev) => (prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId]))
    }

    const filteredMatches = useMemo(() => {
        if (selectedLeagues.length === 0) return matches
        return matches.filter((match) => selectedLeagues.includes(match.league.id))
    }, [selectedLeagues, matches])

    const handleSelectMatch = (match: Match) => {
        const currentId = searchParams.get("matchId")
        if (currentId === match.id) {
            router.push("/")
        } else {
            router.push(`/?matchId=${match.id}`)
        }
    }

    const handleCloseMatch = () => {
        router.push("/")
    }

    if (leagues.length === 0 && matches.length === 0) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Unable to load data</h1>
                <p className="text-muted-foreground">Please check your connection or try again later.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="pt-2 flex line-height-[1] items-center gap-2 text-3xl font-bold tracking-tight"><CloudSunRain size={34} />FutCast</h1>
                    <LeagueFilter leagues={leagues} selectedLeagues={selectedLeagues} onToggleLeague={toggleLeague} />
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <div className="container mx-auto grid h-full grid-cols-1 gap-6 px-4 py-6 md:grid-cols-12">
                    {/* Match List Column */}
                    <div className="h-full overflow-y-auto md:col-span-5 lg:col-span-4">
                        <MatchList
                            matches={filteredMatches}
                            selectedMatchId={selectedMatch?.id || null}
                            onSelectMatch={handleSelectMatch}
                        />
                    </div>

                    {/* Desktop Details Column */}
                    <div className="hidden h-full overflow-hidden rounded-xl border bg-muted/10 md:col-span-7 md:block lg:col-span-8">
                        {selectedMatch ? (
                            <div className="h-full p-6">
                                <MatchDetails match={selectedMatch} />
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                <p>Select a match to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Details Drawer */}
            {!isDesktop && (
                <Drawer open={!!selectedMatch} onOpenChange={(open) => !open && handleCloseMatch()}>
                    <DrawerContent className="h-[85vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle>Match Details</DrawerTitle>
                            <DrawerDescription>
                                {selectedMatch?.homeTeam.name} vs {selectedMatch?.awayTeam.name}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 pb-8 overflow-y-auto">{selectedMatch && <MatchDetails match={selectedMatch} />}</div>
                    </DrawerContent>
                </Drawer>
            )}
        </div>
    )
}
