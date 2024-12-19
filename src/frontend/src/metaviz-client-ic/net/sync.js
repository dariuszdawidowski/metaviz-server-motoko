// WebSockets Data Synchronization

export default class MetavizSync {

    /**
     * Constructor
     */

    constructor() {

        // Generate tabID (because SessionID is not good enough - user can open same page in two tabs)
        this.tabID = crypto.randomUUID();

        // Last change on server (isodate)
        this.updated = 0;

        // Queue with packets to send
        this.queue = new MetavizSyncQueue();

        // Websocket for asynchronous synchronization ;)
        this.websocket = null;

        // System sleep counter
        this.lastTime = (new Date()).getTime();

        // System sleep detector
        setInterval(() => {
            const currentTime = (new Date()).getTime();
            if (currentTime > (this.lastTime + 8000)) {
                logging.info('System sleep.');
                this.pull();
            }
            this.lastTime = currentTime;
        }, 4000);
    }

    /**
     * (Re)connect websocket
     */

    connect(reconnect=false) {
        logging.info('WS:CONNECT');

        // Close if exists
        if (this.websocket) this.websocket.close();

        // New connection
        const protocol = location.protocol == 'http:' ? 'ws:' : 'wss:';
        this.websocket = new WebSocket(`${process.env.GATEWAY_PROTOCOL}://${process.env.GATEWAY_HOST}:${process.env.GATEWAY_PORT}/${metaviz.editor.id}/`);

        // AJAX Pull if reconnected
        if (reconnect) this.pull();

        // Open
        this.websocket.onopen = (event) => {
            logging.info('WS:Connection established.');

            // Resend pending packets if any
            this.flush('WS:Rohr');

            // Ready on toolbar
            metaviz.events.call('on:connected');
        };

        // Recv
        this.websocket.onmessage = (event) => {

            // Get data
            const data = JSON.parse(event.data);
            logging.info('WS:Recv', data);

            // Compare and clean packet
            const find = this.queue.find(data);
            if (find != -1) {
                logging.info('WS:Recv:Confirmed');
                this.queue.del(find);
                // Saved on toolbar
                metaviz.events.call('on:saved');
            }

            // Don't mirror in the sender browser tab
            if (this.tabID != data.instance.id) metaviz.editor.history.restore(metaviz.editor.history.mirror(data));
        };

        // Error handler
        this.websocket.onerror = (event) => {

            // Close websocket
            logging.info('WS:Connection error:', event);
            this.websocket.close();
        };

        // Close
        this.websocket.onclose = (event) => {
            logging.info('WS:Closed.', event.code);

            // Reconnect after 1 second
            setTimeout(() => {
                logging.info('WS:Reconnecting... Queue:', this.queue.queue);
                // Reconnect event for toolbar
                metaviz.events.call('on:reconnect');
                this.connect(true);
            }, 1000);
        };

    }

    /**
     * Pull last changes
     */

    pull() {
        logging.info('AJX:Pulling changes...');
        metaviz.ajax.in.recv({params: {'fetch': 'Pull', 'board': metaviz.editor.id, 'updated': this.updated}}).then(data => {
            if (data != 'error') {
                // JSON Data
                let json = null;
                try {
                    json = JSON.parse(data);
                }
                catch(error) {
                    logging.info('AJX:Pulled corrupted data', data);
                }
                if (json && json.status == 200) {
                    const clientTime = new Date(this.updated).getTime();
                    const serverTime = new Date(json.updated).getTime();
                    if (clientTime != serverTime) {
                        logging.info(`AJX:Desync!!!: clientTime:${clientTime} serverTime:${serverTime}`);
                        this.refetch();
                    }
                    else {
                        logging.info(`AJX:Nothing: clientTime:${clientTime} serverTime:${serverTime}`);
                    }
                }
            }
            else {
                logging.info('AJX:Pulling connection error');
            }
        });
    }

    /**
     * Fetch fresh data from server
     */

    refetch() {
        logging.info('AJX:Refetch...');

        metaviz.events.call('on:sync');

        // ?board=.. in GET params
        const get_params = window.location.search.uriToDict();
        let recv_params = {'fetch': 'MetavizJSON'};
        if ('board' in get_params) recv_params['board'] = get_params.board;
        if ('folder' in get_params) recv_params['folder'] = get_params.folder;
        if ('key' in get_params) recv_params['key'] = get_params.key;

        // Receive data
        metaviz.ajax.in.recv({params: recv_params}).then(data => {
            if (data != 'error') {
                // JSON Data
                let json = null;
                try {
                    json = JSON.parse(data);
                }
                catch(error) {
                    logging.info('AJX:Fetched corrupted data', data);
                }
                if (json) {
                    // If error - show alert
                    if ('error' in json) {
                        alert(json.error);
                    }
                    // Data ok
                    else {
                        logging.info('AJX:Refetched.');

                        // Clear board
                        metaviz.render.clear();

                        // Decode data
                        metaviz.format.deserialize('text/metaviz+json', json);

                        // Render
                        metaviz.render.layers.current.render();
                        metaviz.render.layers.current.update();

                        // Launch start
                        for (const node of metaviz.render.nodes.get('*')) node.start();

                        // Loaded
                        metaviz.events.call('on:loaded');
                    }

                }
            }
            else {
                logging.info('AJX:Fetching connection error');
            }

        });
    }

    /**
     * Send data to server
     */

    send(json) {

        // Instance ID
        json['instance'] = {'id': this.tabID};

        // Board
        json['board'] = {'id': metaviz.editor.id};

        // Layers
        json['layer'] = {'id': metaviz.render.layers.current.id};

        // Push to queue
        this.queue.add(json);

        // Flush queue
        this.flush('WS:Send');
    }

    /**
     * Flush data queue to server
     */

    flush(debug) {
        // Send data chunk to sync
        switch (this.websocket.readyState) {
            // 0 = Connecting
            case 0:
                // Do nothing - data is queued
                logging.info('WS:readyState 0');
                break;

            // 1 = Open
            case 1:
                logging.info('WS:readyState 1');
                for (const data of this.queue.get()) {
                    logging.info(`${debug}`, data);
                    this.websocket.send(JSON.stringify(data));
                }
                break;

            // 2 = Closing
            case 2:
                // Callback reconnects closed websocket
                logging.info('WS:readyState 2');
                break;

            // 3 = Closed
            case 3:
                // Callback reconnects closed websocket
                logging.info('WS:readyState 3');
                break;
        }
    }

}

class MetavizSyncQueue {

    constructor() {

        // Queue of packets (not sorted, depending on state and time)
        // [first, second, third, ...]
        this.queue = [];

    }

    add(data) {
        this.queue.push(new MetavizSyncPacket(data));
    }

    del(idx) {
        this.queue.splice(idx, 1);
    }

    get() {
        let packets = [];
        for (let nr = 0; nr < this.queue.length; nr++) {
            // Never sent before
            if (this.queue[nr].sent == 0) {
                packets.push(this.queue[nr].data);
                this.queue[nr].sent++;
            }
            // Trying to send stuck packet every second
            else {
                const delta = (new Date()).getTime() - this.queue[nr].timestamp;
                if (delta >= this.queue[nr].sent * 1000) {
                    packets.push(this.queue[nr].data);
                    this.queue[nr].sent++;
                }
            }
        }
        return packets;
    }

    find(data) {
        for (let nr = 0; nr < this.queue.length; nr++) {
            if (this.compare(this.queue[nr].data, data)) {
                return nr;
            }
        }
        return -1;
    }

    compare(data1, data2) {
        return data1.toString() == data2.toString();
    }

}

class MetavizSyncPacket {

    constructor(data) {

        // How many tries to send
        this.sent = 0;

        // Data to send
        this.data = data;

        // Unix Timestamp
        this.timestamp = (new Date()).getTime(); 

    }

}
