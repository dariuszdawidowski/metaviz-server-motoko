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

/*** ICP canister class ***/

export class ICPCanister {
    
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
