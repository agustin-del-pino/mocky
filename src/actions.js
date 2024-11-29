import { response } from "express";
import db from "./db.js";

export function getAllEndpoint() {
    return Object.values(db.data.endpoints);
}

export async function addEndpoint(req, res) {
    const { method, path, responses } = req.body;

    if (!(method instanceof String)) {
        return res.status(400).type("text").send("'method' field must be a string")
    }
    if (!(path instanceof String)) {
        return res.status(400).type("text").send("'path' field must be a string")
    }
    if (!(responses instanceof Array)) {
        return res.status(400).type("text").send("'responses' field must be an array")
    }


    await db.update(data => data.endpoints[`${method}#${path}`] = {
        method, path, responses, current: 0, used: response.length > 0 ? [0] : []
    })

    return res.sendStatus(201)
}

export async function updateEndpointResponses(req, res) {
    let { method, path, responses } = req.body;

    if (!(method instanceof String)) {
        return res.status(400).type("text").send("'method' field must be a string")
    }
    if (!(path instanceof String)) {
        return res.status(400).type("text").send("'path' field must be a string")
    }
    if (!(responses instanceof Array)) {
        return res.status(400).type("text").send("'responses' field must be an array")
    }

    const end = `${method}#${path}`

    await db.update(data => data.endpoints[end].responses.push(...responses))

    return res.sendStatus(204);
}

export async function deleteEndpoints(req, res) {
    let { method, path } = req.body;

    if (!(method instanceof String)) {
        return res.status(400).type("text").send("'method' field must be a string")
    }
    if (!(path instanceof String)) {
        return res.status(400).type("text").send("'path' field must be a string")
    }


    if (method === "*" && path === "*") {
        await db.update(data => data.endpoints = {})
    } else if (method === "*" && path !== "*") {
        const all = []
        for (const m of ["POST", "PUT", "GET", "DELETE"]) {
            const end = `${m}#${path}`
            all.push(db.update(data => delete data.endpoints[end]))
        }
        await Promise.all(all);
    } else {
        const end = `${method}#${path}`
        await db.update(data => delete data.endpoints[end])
    }

    return res.sendStatus(204);
}


export async function deleteEndpointResponses(req, res) {
    let { method, path } = req.body;

    if (!(method instanceof String)) {
        return res.status(400).type("text").send("'method' field must be a string")
    }
    if (!(path instanceof String)) {
        return res.status(400).type("text").send("'path' field must be a string")
    }

    const end = `${method}#${path}`

    await db.update(data => data.endpoints[end].responses = [])

    return res.sendStatus(204);
}

export async function exectuteMock(req, res) {
    const end = `${req.method}#${req.path}`

    if (!Object.hasOwn(db.data.endpoints, end)) {
        return res.status(404).type("text").send(`Cannot ${req.method} ${req.path}`);
    }

    const { responses, current, used } = db.data.endpoints[end]

    if (responses.length === 0) {
        return res.sendStatus(200)
    }

    if (used[current] >= responses[current].times) {
        current++;
    }

    used.push(1)

    if (responses[current].script) {
        eval(`function responseScript(req, res) {
            ${responses[current]}
        }
        responseScript(req, res)`)
        return;
    }

    const { status, type, headers, body } = responses;
    if (!(body instanceof String)) {
        body = JSON.stringify(body);
    }
    
    await db.update(data=>data.endpoints[end] = {...data.endpoints[end], current})

    return res.status(status).type(type).setHeaders(new Headers(headers)).send(body);
}