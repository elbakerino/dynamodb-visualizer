export function fetcher(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, token?: string, headers?: HeadersInit,): Promise<{ status: number, data: any }> {
    return fetch(url, {
        method: method,
        ...(data && (method === 'PUT' || method === 'POST') ? {body: JSON.stringify(data)} : {}),
        headers: {
            //...((method === 'PUT' || method === 'POST') ? {'Content-Type': 'application/json'} : {}),
            'Content-Type': 'application/json',
            ...(token ? {'Authorization': 'Bearer ' + token} : {}),
            ...(headers || {}),
        }
    })
        .then(async(r) => {
                try {
                    return {
                        status: r.status,
                        data: await r.json(),
                    }
                } catch(e) {
                    console.log(e)
                    return Promise.reject({
                        status: r.status,
                        data: e,
                    })
                }
            }
        )
        .then(data => {
            return data
        })
}
