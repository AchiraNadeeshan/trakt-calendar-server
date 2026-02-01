import ical from 'ical-generator'
import dayjs from 'dayjs'

export function generateCalendar(shows: any[], movies: any[]) {
  const calendar = ical({
    name: 'Trakt Calendar',
    timezone: 'UTC',
  })

  for (const item of shows) {
    if (!item.episode?.first_aired) continue

    calendar.createEvent({
      start: dayjs(item.episode.first_aired).toDate(),
      summary: `${item.show.title} S${item.episode.season}E${item.episode.number}`,
      description: item.episode.title ?? '',
      uid: `trakt-show-${item.episode.ids.trakt}`,
    })
  }

  for (const item of movies) {
    if (!item.movie?.released) continue

    calendar.createEvent({
      start: dayjs(item.movie.released).toDate(),
      summary: item.movie.title,
      uid: `trakt-movie-${item.movie.ids.trakt}`,
    })
  }

  return calendar.toString()
}
