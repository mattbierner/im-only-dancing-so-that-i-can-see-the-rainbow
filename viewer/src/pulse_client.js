import {ip, beatoffset} from './config'

/**
 * 
 */
export const createPulseClient = (handler) => {
    const ws = new WebSocket(`ws://${ip}:5678/`)
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handler(data);
    }
    return ws
}
