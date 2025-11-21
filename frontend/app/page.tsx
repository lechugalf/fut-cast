import { SoccerDashboard } from "./components/events/dashboard";
import { getEvents, getLeagues, getEvent } from "./actions";

export const dynamic = 'force-dynamic';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const leagues = await getLeagues();
  const matches = await getEvents();

  const { matchId } = await searchParams;
  const selectedMatch = typeof matchId === 'string' ? await getEvent(matchId) : null;

  return (
    <SoccerDashboard
      leagues={leagues}
      matches={matches}
      selectedMatch={selectedMatch}
    />
  );
}
