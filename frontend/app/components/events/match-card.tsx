"use client"

import type { Event as Match } from "@/app/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface MatchCardProps {
    match: Match
    isActive?: boolean
    onClick?: () => void
}

export function MatchCard({ match, isActive, onClick }: MatchCardProps) {
    const isLive = match.status === "LIVE"
    const isFinished = match.status === "MATCH_FINISHED"

    const homeScore = match.score.homeTeamScore
    const awayScore = match.score.awayTeamScore

    const homeWinner = isFinished && homeScore !== null && awayScore !== null && homeScore > awayScore
    const awayWinner = isFinished && homeScore !== null && awayScore !== null && awayScore > homeScore

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isActive ? "ring-4 ring-primary/10 border-primary/30" : "hover:border-primary/30",
            )}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onClick?.()
                }
            }}
            tabIndex={0}
            role="button"
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <Badge
                        variant={isLive ? "destructive" : isFinished ? "secondary" : "outline"}
                        className={cn(isLive && "animate-pulse")}
                    >
                        {isLive ? "EN VIVO" : isFinished ? "FT" : format(new Date(match.eventDateTime), "HH:mm")}
                    </Badge>
                    <span className="text-muted-foreground text-xs font-medium">{match.league.name}</span>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="grid gap-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full p-1">
                                {/* Placeholder for team logo since not in data snippet, using first letter */}
                                <span className="font-bold">{match.homeTeam.name.charAt(0)}</span>
                            </div>
                            <span className={cn("font-medium", homeWinner && "font-bold text-primary")}>{match.homeTeam.name}</span>
                        </div>
                        <span className={cn("text-lg font-semibold", homeWinner && "text-primary")}>
                            {match.score.homeTeamScore ?? "-"}
                        </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full p-1">
                                <span className="font-bold">{match.awayTeam.name.charAt(0)}</span>
                            </div>
                            <span className={cn("font-medium", awayWinner && "font-bold text-primary")}>{match.awayTeam.name}</span>
                        </div>
                        <span className={cn("text-lg font-semibold", awayWinner && "text-primary")}>
                            {match.score.awayTeamScore ?? "-"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
