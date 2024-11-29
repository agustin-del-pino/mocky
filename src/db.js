import { JSONFilePreset } from 'lowdb/node'

const db = await JSONFilePreset('db.json', {
    endpoints: {
        "GET#/api/v1/mocky/endpoints": {
            "method": "GET",
            "path": "/api/v1/mocky/endpoints",
            "action": [
                {
                    "times": 1,
                    "type": "application/json",
                    "body": "",
                    "status": "",
                    "headers": {},
                    "script": ""
                }
            ],
            "current": 0,
            "used": [0]
        }
    },

})

export default db;