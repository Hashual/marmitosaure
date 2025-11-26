import { HOST } from "./constants";

export async function login (username: string, password: string): Promise<string> {
    const response = await fetch(HOST + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const json = await response.json() as (
      | { error: string }
      | { token: string }
    );

    if ("error" in json)
      throw new Error(json.error)

    return json.token
}
