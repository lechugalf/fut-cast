"use client"

import type { Event as Match } from "@/app/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Thermometer, Wind, Droplets, CloudRain, Info } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface MatchDetailsProps {
    match: Match
}

export function MatchDetails({ match }: MatchDetailsProps) {
    return (
        <ScrollArea className="h-full max-h-[calc(100vh-120px)]">
            <div className="space-y-6 p-1">
                {/* Header Info */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Detalles del Partido</h2>
                    <p className="text-muted-foreground">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                    </p>
                </div>

                {/* Missing Data Placeholder */}
                {!match.weather && !match.analysis && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                            <Info className="mb-2 h-8 w-8 opacity-50" />
                            <p>Solo se obtienen predicciones para partidos dentro de los próximos 10 días</p>
                        </CardContent>
                    </Card>
                )}


                {/* Weather Section */}
                {match.weather && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Thermometer className="h-5 w-5 text-primary" />
                                Condiciones Climáticas Esperadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Thermometer className="h-4 w-4" /> Temperatura
                                    </div>
                                    <span className="text-lg font-semibold">{match.weather.temperature2m}°C</span>
                                    <span className="text-xs text-muted-foreground">
                                        Sensación de {match.weather.apparentTemperature}°C
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Wind className="h-4 w-4" /> Viento
                                    </div>
                                    <span className="text-lg font-semibold">{match.weather.windSpeed10m} km/h</span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Droplets className="h-4 w-4" /> Humedad
                                    </div>
                                    <span className="text-lg font-semibold">{match.weather.relativeHumidity2m}%</span>
                                </div>
                                <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CloudRain className="h-4 w-4" /> Prob. Precipitación
                                    </div>
                                    <span className="text-lg font-semibold">{match.weather.precipitationProbability}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analysis Section */}
                {match.analysis && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Info className="h-5 w-5 text-primary" />
                                Análisis del Partido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
                                {match.analysis.analysis}
                            </div>
                            {match.analysis.favoredTeam && (
                                <div className="flex items-center justify-between rounded-md border p-3">
                                    <span className="text-sm font-medium">Favored Team</span>
                                    <span className="font-bold text-primary">{match.analysis.favoredTeam}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Venue Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5 text-primary" />
                            Estadio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-lg border relative h-48 w-full">
                            <Image
                                src={match.venue.img || "/placeholder.svg"}
                                alt={match.venue.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold">{match.venue.name}</h3>
                            <p className="text-muted-foreground text-sm">{match.venue.location}</p>
                            <p className="text-muted-foreground text-sm">{match.venue.country}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    )
}
