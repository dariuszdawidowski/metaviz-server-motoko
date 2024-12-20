// Packet queue system for Undo/Redo with WebSockets sync

/*
    History packet base:
    {
        timestamp: ...,
        action: ...,
        instance: ..., // Generated tabID (better than session ID because user can browse in many tabs)
        board: ..., // Board ID
        layer: ..., // Layer ID
        ...other params...
    }

    History packet add/del:
    {
        action: 'add' | 'del',
        nodes: [serialized MetavizNode, ...], (optional)
        links: [serialized MetavizLink, ...], (optional)
        layers: [serialized MetavizLayer, ...], (optional)
    }

    History packet move:
    {
        action: 'move',
        nodes: [id, ...],
        offset: {x: ..., y: ...}
        or
        position: {x: ..., y: ...}
        positionPrev: {x: ..., y: ...}
    }

    History packet resize:
    {
        action: 'resize',
        nodes: [id, ...],
        size: {w: ..., h: ...}
        sizePrev: {w: ..., h: ...}
    }

    History packet param:
    {
        action: 'param',
        node: {id: ...},
        params: {...},
        prev: {...}
    }

    History packet parent:
    {
        action: 'parent',
        node: {id: ..., parent: ..., parentPrev: ..., position: {x: ..., y: ...}, positionPrev: {x: ..., y: ...}},
    }

    History packet board:
    {
        action: 'board',
        name: ...,
        namePrev: ...
    }

    History packet chat:
    {
        action: 'chat',
        datetime: ...,
        avatar: ...,
        user: ...,
        body: ...
    }
*/

export default class MetavizHistorySync {

    /**
     * Constructor
     */

    constructor() {

        // Unsaved change
        this.dirty = false;

        // Undo
        this.history = [];

        // Redo
        this.future = [];

        // Last added node (for dblclick)
        this.last = {type: null};

        // List of recently added nodes
        // [{icon: "...", name: "...", type: '...'}, ...]
        this.recent = [];
    }

    /**
     * Store state into history
     */

    store(args) {

        // Anything really changed?
        if ('params' in args && 'prev' in args && (JSON.stringify(args.params) === JSON.stringify(args.prev))) return;

        // Timestamp
        args['timestamp'] = Date.now();

        // Remember last node created and add to recent
        if (args.action == 'add' && 'nodes' in args) {
            const node = args.nodes[args.nodes.length - 1];
            this.last.type = node.type;
            if (!this.recent.find(item => item.type === global.registry.nodes[node.type].type)) this.recent.push({
                icon: global.registry.nodes[node.type].icon,
                name: global.registry.nodes[node.type].name,
                type: global.registry.nodes[node.type].type
            });
            if (this.recent.length > 5) this.recent.shift();
        }

        // Sync to server
        metaviz.events.call('on:saving');
        metaviz.editor.sync.send(args);

        // Push state
        this.history.push(args);
        metaviz.events.call('add:history', args);

    }

    /**
     * Restore state from history
     */

    restore(args) {

        // Add -> remove
        if (args.action == 'add') {

            // Nodes
            if ('nodes' in args) {
                let nodesToDelete = structuredClone(args.nodes);
                while (nodesToDelete.length) {
                    const node = nodesToDelete.pop();
                    metaviz.render.nodes.del(metaviz.render.nodes.get(node.id))
                }
            }

            // Links
            if ('links' in args) {
                let linksToDelete = structuredClone(args.links);
                while (linksToDelete.length) {
                    const link = linksToDelete.pop();
                    const fullLink = metaviz.render.links.get(link.id);
                    if (fullLink) metaviz.render.links.del(fullLink);
                }
            }

            // Layers
            if ('layers' in args) {
                for (const layer of args.layers) metaviz.render.layers.del(layer.id);
            }
        }

        // Del -> recreate
        else if (args.action == 'del') {

            // Nodes
            if ('nodes' in args) {
                let newNodes = [];
                for (const node of args.nodes) {
                    const newNode = metaviz.render.nodes.add(node);
                    for (const [param, value] of Object.entries(node.params)) {
                        newNode.params.set(param, value);
                    }
                    newNode.render();
                    newNode.update();
                    newNodes.push(newNode);
                }
                // Call start on all recreated nodes
                for (const node of newNodes) {
                    node.start();
                }
            }

            // Links
            if ('links' in args) {
                for (const link of args.links) metaviz.render.links.add(link);
            }

            // Layers
            if ('layers' in args) {
                for (const layer of args.layers) metaviz.render.layers.add(layer);
            }
        }

        // Move -> move back
        else if (args.action == 'move') {
            for (const nodeID of args.nodes) {
                const node = metaviz.render.nodes.get(nodeID);
                if ('offset' in args) {
                    node.subPosition(args.offset);
                }
                else if ('position' in args) {
                    node.setPosition(args.positionPrev);
                }
                // Update node
                node.update();
            }
        }

        // New size -> old size
        else if (args.action == 'resize') {
            const node = metaviz.render.nodes.get(args.nodes[0]);
            const vnode = metaviz.render.layers.current.getNode(args.nodes[0]);
            node.transform.w = args.sizePrev.w;
            node.transform.h = args.sizePrev.h;
            vnode.w = args.sizePrev.w;
            vnode.h = args.sizePrev.h;
            node.update();
            metaviz.render.layers.current.update([node]);
        }

        // Param new value -> param old value
        else if (args.action == 'param') {
            const node = metaviz.render.nodes.get(args.node.id);
            for (const [param, value] of Object.entries(args.prev)) {
                node.params.set(param, value);
            }
            metaviz.render.layers.current.update([node]);
        }

        // Parent -> old parent
        else if (args.action == 'parent') {
            const node = metaviz.render.nodes.get(args.node.id);
            node.setParent(args.node.parentPrev);
            node.setPosition(args.node.positionPrev);
            node.render();
            node.update();
            metaviz.render.layers.current.update([node]);
        }

        // Board new name -> board old name
        else if (args.action == 'board') {
            metaviz.editor.setBoardName(args.namePrev);
        }

        // Chat message
        else if (args.action == 'chat') {
            const fullNode = metaviz.render.nodes.get(args.node.id);
            fullNode.recvMessage(args.datetime, args.avatar, args.user, args.body);
        }

    }

    /**
     * Undo to previous state
     * returns true if moved to previous state
     */

    undo() {

        // Revalidate
        this.revalidate();

        // Pop previous state from queue
        const previous = this.history.pop();

        if (previous) {

            // Clear selection
            metaviz.editor.selection.clear();

            // Restore state
            this.restore(previous);

            // Send to server
            metaviz.editor.sync.send(this.mirror(previous));

            // Store for Redo
            this.future.push(this.mirror(previous));

            // Cage update
            metaviz.editor.cage.update();

            // Check for empty
            metaviz.editor.checkEmpty();

            // Moved to previous state
            return true;

        }

        return false;
    }

    /**
     * Any undo on queue
     */

    hasUndo() {
        this.revalidate();
        return this.history.length;
    }

    /**
     * Re-validate outdated history older than 24 hours because it's guaranted time for purging files
     */

    revalidate() {
        this.history = this.history.filter(packet => ((new Date().getTime() - packet.timestamp) / (1000 * 60 * 60 * 24) < 1));
    }

    /**
     * Redo to future state
     * returns true if moved to future state
     */

    redo() {

        // Revalidate
        this.revalidate();

        // Pop next state from queue
        const next = this.future.pop();

        if (next) {

            // Clear selection
            metaviz.editor.selection.clear();

            // Restore state
            this.restore(next);

            // Send to server
            metaviz.editor.sync.send(this.mirror(next));

            // Store for Undo
            this.history.push(this.mirror(next));

            // Cage update
            metaviz.editor.cage.update();

            // Check for empty
            metaviz.editor.checkEmpty();

            // Moved to future state
            return true;

        }

        return false;
    }

    /**
     * Any redo on queue
     */

    hasRedo() {
        this.revalidate();
        return this.future.length;
    }

    /**
     * Recreate history from scratch
     */

    recreate() {
        this.get(true).forEach(args => {

            // Add
            if (args.action == 'add') {

                // Nodes
                if ('nodes' in args) {
                    let newNodes = [];
                    for (const node of args.nodes) {
                        const newNode = metaviz.render.nodes.add(node);
                        for (const [param, value] of Object.entries(node.params)) {
                            newNode.params.set(param, value);
                        }
                        newNode.render();
                        newNode.update();
                        newNodes.push(newNode);
                    }
                    // Call start on all recreated nodes
                    for (const node of newNodes) {
                        node.start();
                    }
                }

                // Links
                if ('links' in args) {
                    for (const link of args.links) metaviz.render.links.add(link);
                }

                // Layers
                if ('layers' in args) {
                    for (const layer of args.layers) metaviz.render.layers.add(layer);
                }

            }

            // Del
            else if (args.action == 'del') {

                // Nodes
                if ('nodes' in args) {
                    for (const id of args.nodes) {
                        metaviz.render.nodes.del(metaviz.render.nodes.get(id));
                    }
                }

                // Links
                if ('links' in args) {
                    for (const id of args.links) {
                        metaviz.render.links.del(metaviz.render.links.get(id));
                    }
                }

                // Layers
                if ('layers' in args) {
                    for (const layer of args.layers) metaviz.render.layers.del(layer.id);
                }

            }

            // Move
            else if (args.action == 'move') {

                for (const nodeID of args.nodes) {

                    const node = metaviz.render.nodes.get(nodeID);

                    // Offset/position
                    if ('offset' in args) {
                        node.addPosition(args.offset);
                    }
                    else if ('position' in args) {
                        node.setPosition(args.position);
                    }

                    // Update node
                    node.update();

                    // Update links
                    node.links.get('*').forEach(link => link.update());
                }

            }

            // Size
            else if (args.action == 'resize') {
                const node = metaviz.render.nodes.get(args.nodes[0]);
                const vnode = metaviz.render.layers.current.getNode(args.nodes[0]);
                node.transform.w = args.size.w;
                node.transform.h = args.size.h;
                vnode.w = args.size.w;
                vnode.h = args.size.h;
                node.update();
                metaviz.render.layers.current.update([node]);
            }

            // Param
            else if (args.action == 'param') {
                const node = metaviz.render.nodes.get(args.node.id);
                for (const [param, value] of Object.entries(args.params)) {
                    node.params.set(param, value);
                }
                metaviz.render.layers.current.update([node]);
            }

            // Parent
            else if (args.action == 'parent') {
                const node = metaviz.render.nodes.get(args.node.id);
                node.setParent(args.node.parent);
                node.setPosition(args.node.position);
                node.render();
                node.update();
                metaviz.render.layers.current.update([node]);
            }

            // Board new name -> Board old name
            else if (args.action == 'board') {
                metaviz.editor.setBoardName(args.name);
            }

            // Chat message
            else if (args.action == 'chat') {
                const fullNode = metaviz.render.nodes.get(args.node.id);
                fullNode.recvMessage(args.datetime, args.avatar, args.user, args.body);
            }

        });
    }

    /**
     * Is dirty (has unsaved changes)
     */

    isDirty() {
        return this.dirty;
    }

    /**
     * Reverse action
     */

    mirror(orgState) {

        // Object copy to avoid change in references
        const state = {...orgState};

        // Add
        if (state.action == 'add') state.action = 'del';

        // Del
        else if (state.action == 'del') state.action = 'add';

        // Move by offset
        else if (state.action == 'move' && 'offset' in state) {
            state.offset.x = -state.offset.x;
            state.offset.y = -state.offset.y;
        }

        // Move to position
        else if (state.action == 'move' && 'position' in state) {
            const temp_x = state.position.x;
            const temp_y = state.position.y;
            state.position.x = state.positionPrev.x;
            state.position.y = state.positionPrev.y;
            state.positionPrev.x = temp_x;
            state.positionPrev.y = temp_y;
        }

        // Param
        else if (state.action == 'param' && 'params' in state && 'prev' in state) {
            const temp = state.params;
            state.params = state.prev;
            state.prev = temp;
        }

        // Resize
        else if (state.action == 'resize' && 'size' in state && 'sizePrev' in state) {
            const temp_size = state.size;
            state.size = state.sizePrev;
            state.sizePrev = temp_size;
        }

        // Parent
        else if (state.action == 'parent' && 'node' in state) {
            const temp_parent = state.node.parent;
            state.node.parent = state.node.parentPrev;
            state.node.parentPrev = temp_parent;
            const temp_position = state.node.position;
            state.node.position.x = state.node.positionPrev.x;
            state.node.position.y = state.node.positionPrev.y;
            state.node.positionPrev.x = temp_position.x;
            state.node.positionPrev.y = temp_position.y;
        }

        // Board
        else if (state.action == 'board') {
            const newName = state.name;
            const oldName = state.namePrev;
            state.name = oldName;
            state.namePrev = newName;
        }

        return state;
    }

    /**
     * Set history records
     */

    set(history) {
        this.history = history;
    }

    /**
     * Get history records
     */

    get(sorted = false) {
        if (sorted) return this.history.sort((a, b) => a.timestamp - b.timestamp);
        else return this.history;
    }

    /**
     * Reset state
     */

    clearHistory() {
        // Undo
        this.history = [];
    }

    clearFuture() {
        // Redo
        this.future = [];
    }

    clear() {
        this.clearHistory();
        this.clearFuture();
    }

}
