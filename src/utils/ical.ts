// src/utils/ical.ts
import ical from "ical-generator"
import dayjs from "dayjs"
import type { Movie, Show } from "../services/trakt"

export function generateCalendar(shows: Show[], movies: Movie[]): string {
  const calendar = ical({ name: "Trakt Calendar", timezone: "UTC" })
  //colors: #9e49c3 (OLD color)
  // or #5135a4   (NEW color)
  //TODO: how to make google calendar use this color?
  // COLOR     Property     RFC 7986 section 5.9. COLOR Property

  for (const item of shows) {
    if (!item.first_aired || !item.episode) continue

    const event = calendar.createEvent({
      start: dayjs(item.first_aired).toDate(),
      summary: `${item.show?.title} S${item.episode.season}E${item.episode.number}`,
      description: item.episode.title ?? "",
    })
    event.uid(`trakt-show-${item.episode.ids?.trakt}`)
  }

  for (const item of movies) {
    if (!item.movie?.released) continue

    const event = calendar.createEvent({
      start: dayjs(item.movie.released).toDate(),
      summary: item.movie.title,
    })
    event.uid(`trakt-movie-${item.movie.ids.trakt}`)
  }

  return calendar.toString()
}
