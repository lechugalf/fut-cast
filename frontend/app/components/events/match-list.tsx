"use client"

import type { Event as Match } from "@/app/lib/types"
import { MatchCard } from "./match-card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface MatchListProps {
    matches: Match[]
    selectedMatchId: string | null
    onSelectMatch: (match: Match) => void
}

export function MatchList({ matches, selectedMatchId, onSelectMatch }: MatchListProps) {
    // Group matches by date
    const groupedMatches = matches.reduce(
        (groups, match) => {
            const date = match.eventDateTime.split("T")[0]
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(match)
            return groups
        },
        {} as Record<string, Match[]>,
    )

    // Sort dates
    const sortedDates = Object.keys(groupedMatches).sort()

    if (matches.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">No matches found for selected leagues.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {sortedDates.map((date) => (
                <div key={date} className="">
                    <h3 className="text-muted-foreground sticky top-0 z-10 bg-background/95 py-1 pl-4 text-md font-medium backdrop-blur-sm">
                        {format(parseISO(date), "EEEE, d MMMM, yyyy", { locale: es })}
                    </h3>
                    <div className="grid gap-4 p-4">
                        {groupedMatches[date].map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                isActive={selectedMatchId === match.id}
                                onClick={() => onSelectMatch(match)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
