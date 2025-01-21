// Editor

import MetavizContextMenuIC from './menu.js';
import MetavizHistorySync from './history.js';
import MetavizSync from '../net/sync.js';

class MetavizEditorIC extends MetavizEditorBrowser {

    constructor(app) {

        // Viewer constructor (also init events)
        super();

        // App reference
        this.app = app;

        // Get Board ID from URL param
        const getParams = window.location.search.uriToDict();
        if ('board' in getParams) this.id = getParams.board;

        // Overwrite history
        this.history = new MetavizHistorySync();

        // Network Data Synchronization
        this.sync = new MetavizSync();

        // Create menu
        this.menu = new MetavizContextMenuIC({projectName: this.name});

        // Focus on canvas
        metaviz.render.container.focus();

    }

    /**
     * Open diagram file
     */

    async open() {

        if (this.id) {

            // Spinner
            this.busy();

            // Read board data
            const data = await this.app.actor.getBoardData(this.id);
            if (data.length > 0) {

                // Parse JSON
                const json = JSON.parse(data[0]);

                // Deserialize
                metaviz.format.deserialize('text/metaviz+json', json);

                // Connect to Websocket Sync Server
                this.sync.connect();

                // Ready
                this.idle();

                // Empty folder?
                this.checkEmpty();

                // Centre
                metaviz.render.focusBounds();

                // Launch start
                for (const node of metaviz.render.nodes.get('*')) node.start();

                // Update
                metaviz.render.update();
                
                // Dispatch final event
                metaviz.events.call('on:loaded');
            }

            // Empty board
            else {
                // Connect to Websocket Sync Server
                this.sync.connect();

                // Ready
                this.idle();

                // Empty folder?
                this.checkEmpty();

                // Centre
                metaviz.render.focusBounds();

                // Update
                metaviz.render.update();

                // Dispatch final event
                metaviz.events.call('on:loaded');
            }

        }
    }

    /**
     * Save diagram file
     */

    async save() {

        // Spinner
        this.busy();

        // Collect JSON data
        const json = metaviz.format.serialize('text/metaviz+json', metaviz.render.nodes.get('*'));
        console.log('save', json);

        // Send
        await this.app.actor.setBoardData(this.id, JSON.stringify(json));

        // Purge old media files
        await this.purge();

        // Clear
        this.history.dirty = false;

        // Spinner
        this.idle();

    }

    /**
     * Delete old media+files
     */

    async purge() {

        // Collect media nodes
        const nodes = [];
        metaviz.render.nodes.get('*').forEach(node => {
            if (['MetavizNodeImage', 'MetavizNodeFile'].includes(node.constructor.name)) nodes.push(node);
        });

        // Collect media files
        // TODO: list all media files
/*
        // Delete expired files
        const second = 1000;
        const hour = 3600 * second;
        const expired = 3 * hour * 24;
        const now = new Date().getTime();
        const toDelete = [];
        files.assets.forEach(file => {
            // Is it the same board?
            let json = null;
            try {
                json = JSON.parse(file.description || '{}');
            }
            catch {}
            
            // Find reference in nodes
            if (json && ('board' in json) && json.board == metaviz.editor.id) {
                const referenced = nodes.some(node => node.params.uri.includes(file.downloadUrl));
                if (!referenced) {
                    // Expired
                    if (now - Number(file.updated_at / 1000000n) > expired) {
                        toDelete.push({
                            collection: 'files',
                            fullPath: file.fullPath
                        });
                    }
                }
            }
        });
        if (toDelete.length) await deleteManyAssets({ assets: toDelete });
        */
    }

    /**
     * Create node (copy)
     * nodeType: <string> class name
     * transform: {x: ..., y: ...}
     * params: {param1: ..., param2: ...} [optional]
     */

    nodeAdd(nodeType, transform, params = {}) {

        // Position
        let position = metaviz.render.screen2World(transform);
        if (metaviz.config.snap.grid.enabled) position = this.snapToGrid(position.x, position.y);

        // Create node
        const newNode = metaviz.render.nodes.add({id: crypto.randomUUID(), parent: metaviz.render.nodes.parent, type: nodeType, ...position, params});

        // Update
        newNode.render();
        newNode.update();
        newNode.start();

        // Store
        this.history.clearFuture();
        this.history.store({action: 'add', nodes: [newNode.serialize('transform')]});

        // Link if node chaining is active
        if (this.interaction.chainNode) {
            this.dragLinkEnd(newNode);
            this.interaction.clear();
        }

        // Show info
        this.checkEmpty();

        // Return fres created node
        return newNode;
    }

}

export default MetavizEditorIC;
