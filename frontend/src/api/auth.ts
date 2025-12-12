import { getDefaultStore } from "jotai";
import { HOST } from "./constants";
import { tokenAtom } from "../atoms/token";

export async function login(username: string, password: string): Promise<string> {
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

export interface User {
  _id: string;
  username: string;
  password: string;
  email: string;
  registration_date: string;
}

export async function getMe(): Promise<User> {
  const response = await fetch(HOST + "/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getDefaultStore().get(tokenAtom)}`
    },
  });

  const json = await response.json() as (
    | { error: string }
    | { user: User }
  );

  if ("error" in json)
    throw new Error(json.error)

  return json.user
}


export async function register(username: string, email: string, password: string): Promise<void> {
  const response = await fetch(HOST + "/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  });

  const json = await response.json() as (
    | { error: string }
    | { message: string }
  );

  if ("error" in json) {
    throw new Error(json.error);
  }

  return;
}
