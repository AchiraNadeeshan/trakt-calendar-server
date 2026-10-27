// api/cron.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllUsers, type User } from "../../src/utils/authentication";
import { refreshDataForUser, type DataEntry } from "../../src/utils/fetch";


interface Data {
  [key: string]: DataEntry
}

async function refreshDataForAllUsers(days: number): Promise<Data> {

  const users = await getAllUsers()

  const result: [User, DataEntry][] = await Promise.all(users.map(async (user): Promise<[User, DataEntry]> => {
    const data = await refreshDataForUser(user, days);
    return [user, data]
  }))

  const data: Data = {}

  for (const [user, d] of result) {
    data[user.user_id] = d
  }

  return data
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.CRON_SECRET) {
      throw new Error("Missing CRON_SECRET")
    }


    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).send('Unauthorized');
    }


    const { days = '30' } = req.query


    const daysNum = Number(days)
    if (Number.isNaN(daysNum) || daysNum <= 0) {
      return res.status(400).send('Invalid days parameter')
    }

    const data = await refreshDataForAllUsers(daysNum)

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    return res.status(200).send(data)
  } catch (err) {
    console.error(err)
    res.setHeader('X-ERROR', `${err}`)
    return res.status(500).send('Internal Server Error')
  }
}


//TODO: somehow we need to delete old aut state in some itervals, if a user doesn't finish the state, the code expires after 5 minutes!
