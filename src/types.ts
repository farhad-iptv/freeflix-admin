export interface GithubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  eventsPath: string;
  categoriesPath: string;
}

export interface Stream {
  name: string;
  url: string;
  isPrimary: boolean;
}

export interface Event {
  id: string;
  matchName: string;
  sportType: string;
  league: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  isLive: boolean;
  isHot: boolean;
  startTime: string;
  link: string;
  streams: Stream[];
}

export interface Category {
  id: string;
  name: string;
  logoUrl: string;
  playlistUrl: string;
}

export interface RepoFile<T> {
  data: T[];
  sha: string;
}
