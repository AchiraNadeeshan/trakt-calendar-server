// src/utils/dbs/blob.ts

import { get, put } from "@vercel/blob";
import type { Movie, Show } from "../services/trakt";
import type { User } from "./authentication";

function getFilenames(user: User) {
    return {
        episodesFile: `user_${user.user_id}/episodes.json`,
        moviesFile: `user_${user.user_id}/movies.json`,
    }
}

async function getJSONBlobOr<T>(pathname: string, def: T): Promise<T> {
    const result = await get(pathname, { access: "private" })

    if (result == null) {
        return def
    }

    return await new Response(result.stream).json() as T;
}

type ID = string | number

async function updateArrayBlob<T>(pathname: string, array: T[], idFn: (entry: T) => ID | null | undefined): Promise<number> {
    const previous = await getJSONBlobOr<T[]>(pathname, [])

    const newData = []
    const ids: Set<ID> = new Set()

    //NOTE: use newer ones first, so that updates to the data get used first, and than the old data gets added
    for (const data of [...array, ...previous]) {
        const id = idFn(data)
        if (id === null || id === undefined) {
            continue;
        }

        if (!ids.has(id)) {
            newData.push(data)
            ids.add(id)
        }
    }

    const _result = await put(pathname, JSON.stringify(newData), { access: "private", allowOverwrite: true, contentType: 'application/json', })

    const addedAmount = newData.length - previous.length;

    return addedAmount

}


export async function getAllEntries(user: User): Promise<[Show[], Movie[]]> {

    const { episodesFile, moviesFile } = getFilenames(user);

    return await Promise.all([
        getJSONBlobOr<Show[]>(episodesFile, []),
        getJSONBlobOr<Movie[]>(moviesFile, [])
    ])
}


function getMovieId(movie: Movie): ID | null | undefined {
    return movie.movie.ids.trakt
}

function getShowId(show: Show): ID | null | undefined {
    return show.episode?.ids?.trakt
}

export async function addNewEntries(user: User, entries: [Show[], Movie[]]): Promise<[number, number]> {
    const [shows, movies] = entries
    const { episodesFile, moviesFile } = getFilenames(user);

    const result = await Promise.all([
        updateArrayBlob<Show>(episodesFile, shows, getShowId),
        updateArrayBlob<Movie>(moviesFile, movies, getMovieId)
    ])

    return result

}
