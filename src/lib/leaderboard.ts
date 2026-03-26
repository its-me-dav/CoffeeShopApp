export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  isFriend: boolean
}

const WEEKLY_KEY = 'grnd_weekly_best'

// Dummy weekly players — fixed cast of competitors
const DUMMY_PLAYERS: LeaderboardEntry[] = [
  { id: 'p1', name: 'Jordan',  score: 9200, isFriend: true  },
  { id: 'p2', name: 'Taylor',  score: 7650, isFriend: true  },
  { id: 'p3', name: 'Sam',     score: 6400, isFriend: false },
  { id: 'p4', name: 'Casey',   score: 5100, isFriend: false },
  { id: 'p5', name: 'Megan',   score: 4300, isFriend: true  },
  { id: 'p6', name: 'Riley',   score: 3200, isFriend: false },
  { id: 'p7', name: 'Morgan',  score: 2600, isFriend: false },
  { id: 'p8', name: 'Jamie',   score: 1800, isFriend: false },
]

export function getUserWeeklyBest(userId: string): number {
  return parseInt(localStorage.getItem(`${WEEKLY_KEY}_${userId}`) || '0', 10)
}

export function saveUserWeeklyBest(userId: string, score: number): boolean {
  const current = getUserWeeklyBest(userId)
  if (score > current) {
    localStorage.setItem(`${WEEKLY_KEY}_${userId}`, String(score))
    return true // new weekly best
  }
  return false
}

export function getWeeklyLeaderboard(userId: string, userName: string) {
  const userScore = getUserWeeklyBest(userId)
  const entries = [
    ...DUMMY_PLAYERS,
    { id: userId, name: userName, score: userScore, isFriend: false },
  ]
  return entries
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1, isCurrentUser: e.id === userId }))
}

export function getFriendsLeaderboard(userId: string, userName: string) {
  return getWeeklyLeaderboard(userId, userName).filter(e => e.isCurrentUser || e.isFriend)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

export function getCompetitors() {
  return [...DUMMY_PLAYERS]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ name: e.name, score: e.score, rank: i + 1 }))
}

export function getWeeklyTopScore(): number {
  // Returns the highest score among all players (dummy + any saved user scores)
  return Math.max(...DUMMY_PLAYERS.map(p => p.score))
}
