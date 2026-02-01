// src/utils/ical.ts
import ical from 'ical-generator'
import dayjs from 'dayjs'

export function generateCalendar(shows: any[], movies: any[]) {
  const cal = ical({ name: 'Trakt Calendar' })

  for (const item of shows) {
    cal.createEvent({
      start: dayjs(item.first_aired).toDate(),
      summary: `${item.show.title} S${item.episode.season}E${item.episode.number}`,
      description: item.episode.title,
      uid: `trakt-show-${item.episode.ids.trakt}`,
    })
  }

  for (const item of movies) {
    cal.createEvent({
      start: dayjs(item.released).toDate(),
      summary: item.movie.title,
      uid: `trakt-movie-${item.movie.ids.trakt}`,
    })
  }

  return cal.toString()
}
