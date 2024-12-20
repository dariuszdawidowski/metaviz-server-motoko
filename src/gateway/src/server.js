/**
 * WebSockets gateway server
 */

// require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

/*** ICP canister ***/

/*
import { ICPCanister } from './conn-backend-icp.js';

const icpCanister = new ICPCanister();
icpCanister.initialize().then(() => {
    icpCanister.ping();
});
*/

/*** WebSockets ***/

// Import
const uws = require('uWebSockets.js'); // https://github.com/uNetworking/uWebSockets.js

// App
const app = uws.App();

// Connections splitted to groups per boards {boardId: [ws1, ws2, ...]}
const boards = {};

/**
 * WebSocket send
 */
/*
function send(ws, message) {

    // Encode
    const encodeString = JSON.stringify(message);
    const encodeBuffer = Buffer.from(encodeString, 'utf8');
    const arrayBuffer = encodeBuffer.buffer.slice(encodeBuffer.byteOffset, encodeBuffer.byteOffset + encodeBuffer.byteLength);

    // Send back
    ws.send(arrayBuffer);
}
*/
/**
 * WebSocket broadcast to group
 */

function broadcast(message, boardId) {

    if (boardId in boards) {

        // Encode
        const encodeString = JSON.stringify(message);
        const encodeBuffer = Buffer.from(encodeString, 'utf8');
        const arrayBuffer = encodeBuffer.buffer.slice(encodeBuffer.byteOffset, encodeBuffer.byteOffset + encodeBuffer.byteLength);

        // Iterate all connections
        boards[boardId].forEach(ws => {
            ws.send(arrayBuffer);
        });

    }

}

/**
 * WebSocket endpoint
 */

app.ws('/*', {

    // Pre-connection
    upgrade: (res, req, context) => {
        res.upgrade(
            {
                path: req.getUrl()
            },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context
        );
    
    },

    // New connection
    open(ws) {
        const boardId = ws.path.replace(/\//g, '');
        console.log('CONN', ws.getRemoteAddressAsText(), boardId);
        if (!(boardId in boards)) boards[boardId] = [];

        // Check duplicate
        const remoteAddress = ws.getRemoteAddressAsText();
        const isDuplicate = boards[boardId].some(existingWs => existingWs.getRemoteAddressAsText() === remoteAddress);
        if (isDuplicate) {
            console.log('Duplicate connection detected:', remoteAddress);
            ws.close();
            return;
        }

        // Add to group
        boards[boardId].push(ws);
    },

    // Incoming message
    message(ws, message, isBinary) {

        // Decode
        const decodeBuffer = Buffer.from(message);
        const decodeString = decodeBuffer.toString('utf8');
        let json = null;
        try {
            json = JSON.parse(decodeString);
        }
        catch (error) {
            console.error('JSON error:', error);
        }

        // console.log('JSON:', json);

        if (json) {
            // Broadcast to all in the group
            broadcast(json, ws.path.replace(/\//g, ''));
        }

    },

    // End connection
    close(ws, code, message) {
        console.log('CLOSE:', code, message);
        const boardId = ws.path.replace(/\//g, '');
        const index = boards[boardId].indexOf(ws);
        if (index !== -1) {
            boards[boardId].splice(index, 1);
        }
        if (boards[boardId].length === 0) {
            delete boards[boardId];
        }
    }

});

/**
 * Start listen
 */

app.listen(Number(process.env.GATEWAY_PORT), (token) => {
    if (token) {
        console.info(`WS Server started @ ${process.env.GATEWAY_PROTOCOL}://${process.env.GATEWAY_HOST}:${process.env.GATEWAY_PORT}`);
    } else {
        console.error('Failed to start WS server');
    }
});