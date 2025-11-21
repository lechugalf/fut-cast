"use client"

import type { League } from "@/app/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Image from "next/image"

interface LeagueFilterProps {
    leagues: League[]
    selectedLeagues: string[]
    onToggleLeague: (leagueId: string) => void
}

export function LeagueFilter({ leagues, selectedLeagues, onToggleLeague }: LeagueFilterProps) {
    return (
        <div className="w-full py-4">
            <div className="w-full whitespace-nowrap">
                <div className="flex flex-wrap gap-2 p-1">
                    {leagues.map((league) => {
                        const isSelected = selectedLeagues.includes(league.id)
                        return (
                            <Button
                                key={league.id}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "rounded-full border-2 transition-all",
                                    isSelected ? "border-primary pl-3 pr-4" : "border-transparent bg-muted hover:bg-primary/10 pl-3 pr-4",
                                )}
                                onClick={() => onToggleLeague(league.id)}
                            >
                                <div className="mr-2 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 relative">
                                    {league.logoImageUrl ? (
                                        <Image
                                            src={league.logoImageUrl}
                                            alt={league.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200" />
                                    )}
                                </div>
                                <span className="text-md font-medium">{league.alternateName || league.name}</span>
                                {isSelected && <Check className="ml-2 h-3 w-3" />}
                            </Button>
                        )
                    })}
                </div>
                {/* <ScrollBar orientation="horizontal" /> */}
            </div>
        </div>
    )
}
