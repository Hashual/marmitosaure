import { atom } from 'jotai'
export const tokenAtom = atom(localStorage.getItem("token") || "")
