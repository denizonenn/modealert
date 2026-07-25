import { Event } from "@/types/event"

export async function getEvents():Promise<Event[]>{

    const res = await fetch("http://localhost:3000/api/mock/events",{

        cache:"no-store"

    })

    return res.json()

}