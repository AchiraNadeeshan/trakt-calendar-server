// api/user.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { addUser, deleteState, getAuthState } from "../../../src/utils/authentication";
import { getTokenFromCode, getTraktUserInfo } from "../../../src/services/trakt";
import { fixDate } from "../../../src/utils/date";
import { NeonDbError } from "@neondatabase/serverless";
import { AxiosError } from "axios";

function getUserSecret(): string {

  function generateRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(length));

    return Array.from(randomValues, value => chars[value % chars.length]).join("");
  }

  const secret = generateRandomString(16);

  return secret
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  try {

    if (!process.env.HOSTNAME) {
      throw new Error("Missing HOSTNAME")
    }

    const { code, state } = req.query

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing or invalid code')
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).send('Missing or invalid state')
    }


    const auth_state = await getAuthState(state)
    if (auth_state == null) {
      return res.status(401).send("Invalid state, this means this url was called twice, as the state is not valid anymore")
    }

    //TODO: should i use another one?
    const redirect_url = `https://${process.env.HOSTNAME}/api/v2/auth/callback`

    const result = await getTokenFromCode(code, { verifier: auth_state.code_verifier }, redirect_url)

    const expires_at = new Date(fixDate(result.expires_at))

    const user_secret = getUserSecret()

    const trakt_user = await getTraktUserInfo(result.access_token)

    const user = await addUser(user_secret, { access_token: result.access_token, refresh_token: result.refresh_token, expires_at }, trakt_user.user.ids.uuid)

    await deleteState(auth_state)

    const ical_url = `https://${process.env.HOSTNAME}/api/v2/ical?user_id=${user.user_id}&secret=${user.secret}`

    return res.status(200).send(`Your Trakt Calendar URL is: ${ical_url}`)

  } catch (err) {
    console.error(err)
    try {
      res.setHeader('X-ERROR', JSON.stringify(err))
    } catch (_err) {
      res.setHeader('X-ERROR', `${err}`)
    }

    if (err instanceof NeonDbError) {
      if (err.code == "23505") {
        return res.status(400).send('An User with this trakt ID already exists')
      }
    } else if (err instanceof AxiosError) {
      if (err.code == "ERR_BAD_REQUEST") {
        return res.status(400).send('An API request to trakt failed, this means this url was called twice, as the code is not valid anymore!')
      }
    }
    return res.status(500).send('Internal Server Error')
  }
}
