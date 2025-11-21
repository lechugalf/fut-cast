"use server";

import { Event, League } from "./lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getLeagues(): Promise<League[]> {
    try {
        const res = await fetch(`${API_URL}/leagues`, {
            cache: "no-store", // Ensure fresh data
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch leagues: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching leagues:", error);
        return [];
    }
}

export async function getEvents(leagueId?: string): Promise<Event[]> {
    try {
        const url = leagueId
            ? `${API_URL}/events?leagueId=${leagueId}`
            : `${API_URL}/events`;
        const res = await fetch(url, {
            cache: "no-store",
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch events: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export async function getEvent(id: string): Promise<Event | null> {
    try {
        const res = await fetch(`${API_URL}/events/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch event: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}
