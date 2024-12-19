/**
 * WebSockets gateway server
 */

// require('dotenv').config();
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });


/*** ICP canister actor ***/

const { Actor, HttpAgent } = require('@dfinity/agent');

const idlFactory = ({ IDL }) => {
    const MsgArgs = IDL.Record({
      'room' : IDL.Text,
      'text' : IDL.Text,
      'user' : IDL.Text,
    });
    const MsgOk = IDL.Record({ 'status' : IDL.Nat });
    const MsgError = IDL.Variant({ 'General' : IDL.Null });
    const MsgResult = IDL.Variant({ 'ok' : MsgOk, 'err' : MsgError });
    return IDL.Service({
      'get' : IDL.Func([], [IDL.Text], ['query']),
      'ping' : IDL.Func([], [IDL.Text], ['query']),
      'set' : IDL.Func([MsgArgs], [MsgResult], []),
    });
};
  
class ICPCanister {
    
    constructor() {
        this.agent = null;
        this.dbActor = null;
    }

    async initialize() {
        // Agent
        this.agent = HttpAgent.createSync({ host: `${process.env.CANISTER_HOST}:${process.env.CANISTER_PORT}` });
        console.log(`ICP AGENT CREATED`);

        // Fetch rootkey only on localhost
        if (process.env.HOST === 'localhost') {
            await this.agent.fetchRootKey();
        }

        // Actor
        this.dbActor = Actor.createActor(idlFactory, { agent: this.agent, canisterId: process.env.CANISTER_ID_BACKEND });
        console.log('ICP ACTOR CREATED');
    }

    async ping() {
        if (this.dbActor) {
            const response = await this.dbActor.ping();
            console.log('PING: ', response);
            return response;
        } else {
            console.error('Actor not initialized');
        }
    }

    async send(message) {
        if (this.dbActor) {
            const response = await this.dbActor.set(message);
            console.log('SET: ', response);
            return response;
        } else {
            console.error('Actor not initialized');
        }
    }    
}
/*
const icpCanister = new ICPCanister();
icpCanister.initialize().then(() => {
    icpCanister.ping();
});
*/
/*** WebSockets ***/

// Requirements
const uws = require('uWebSockets.js'); // https://github.com/uNetworking/uWebSockets.js

// App
const app = uws.App();

// Connections
const connections = [];

/**
 * WebSocket send
 */

function send(ws, message) {

    // Encode
    const encodeString = JSON.stringify(message);
    const encodeBuffer = Buffer.from(encodeString, 'utf8');
    const arrayBuffer = encodeBuffer.buffer.slice(encodeBuffer.byteOffset, encodeBuffer.byteOffset + encodeBuffer.byteLength);

    // Send back
    ws.send(arrayBuffer);
}

/**
 * WebSocket broadcast
 */

function broadcast(message) {

    // Encode
    const encodeString = JSON.stringify(message);
    const encodeBuffer = Buffer.from(encodeString, 'utf8');
    const arrayBuffer = encodeBuffer.buffer.slice(encodeBuffer.byteOffset, encodeBuffer.byteOffset + encodeBuffer.byteLength);

    // Iterate all connections
    connections.forEach(connection => {
        connection.send(arrayBuffer);
    });
}

/**
 * WebSocket endpoint
 */

app.ws('/*', {

    // New connection
    open(ws) {
        console.log('CONN', ws);
        connections.push(ws);
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

        console.log('JSON:', json);
/*
        if (json && json?.action) {

            // Fetch data from canister
            if (json.action == 'fetch') {
                console.log('Fetching data from canister...');
                icpCanister.dbActor.get().then(response => {
                    console.log('Data fetched from canister:', response);
                    ws.send(response);
                }).catch(error => {
                    console.error('Error fetching data from canister:', error);
                });
            }
            // Send message to canister
            else if (json.action == 'send' && json?.user && json?.text) {
                icpCanister.dbActor.set(json).then(response => {
                    console.log('Message sent to ICP canister:', response);
                }).catch(error => {
                    console.error('Error sending message to ICP canister:', error);
                });
                // Broadcast to all
                broadcast(json);
            }

        }
*/
    },

    // End connection
    close(ws, code, message) {
        console.log('CLOSE:', code, message);
        const index = connections.indexOf(ws);
        if (index !== -1) {
            connections.splice(index, 1);
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