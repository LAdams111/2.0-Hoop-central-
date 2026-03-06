export interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
  height: string;
  weight: string;
  jerseyNumber: number;
  headshotUrl: string;
  bio: string;
  profileViews: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  birth_place?: string;
  college?: string;
  draft_year?: number;
  draft_round?: number;
  draft_pick?: number;
  sr_player_id?: string;
}

export interface PlayerStats {
  id: number;
  playerId: number;
  season: string;
  team: string;
  league: string;
  gamesPlayed: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg_pct: number;
  traded?: boolean;
}

export interface Team {
  id: number;
  name: string;
  abbreviation?: string;
  league?: string;
  logoUrl?: string;
}

export interface League {
  id: number;
  name: string;
  type?: string;
  description?: string;
  region?: string;
  logoUrl?: string;
}
