// arguably depth first search is a stupid algorithm to modularize -
// there are many, many interesting moments to insert a behavior
// and those end up being almost bigger than the function itself

// this is an argument for providing a graph API which could make it
// easy to just write a recursive function instead of using this
dc_graph.depth_first_traversal = function(callbacks) { // {init, root, row, tree, place, sib, push, pop, skip, finish, nodeid, sourceid, targetid}
    return function(nodes, edges) {
        callbacks.init && callbacks.init();
        if(callbacks.tree)
            edges = edges.filter(function(e) { return callbacks.tree(e); });
        var indegree = {};
        var outmap = edges.reduce(function(m, e) {
            var tail = callbacks.sourceid(e),
                head = callbacks.targetid(e);
            if(!m[tail]) m[tail] = [];
            m[tail].push(e);
            indegree[head] = (indegree[head] || 0) + 1;
            return m;
        }, {});
        var nmap = nodes.reduce(function(m, n) {
            var key = callbacks.nodeid(n);
            m[key] = n;
            return m;
        }, {});

        var rows = [];
        var placed = {};
        function place_tree(n, r) {
            var key = callbacks.nodeid(n);
            if(placed[key]) {
                callbacks.skip && callbacks.skip(n, indegree[key]);
                return;
            }
            if(!rows[r])
                rows[r] = [];
            callbacks.place && callbacks.place(n, r, rows[r]);
            rows[r].push(n);
            placed[key] = true;
            if(outmap[key])
                outmap[key].forEach(function(e, ei) {
                    var target = nmap[callbacks.targetid(e)];
                    if(ei && callbacks.sib)
                        callbacks.sib(false, outmap[key][ei-1].target, target);
                    callbacks.push && callbacks.push();
                    place_tree(target, r+1);
                });
            callbacks.pop && callbacks.pop(n);
        }

        var roots;
        if(callbacks.root)
            roots = nodes.filter(function(n) { return callbacks.root(n.orig); });
        else {
            roots = nodes.filter(function(n) { return !indegree[callbacks.nodeid(n)]; });
        }
        roots.forEach(function(n, ni) {
            if(ni && callbacks.sib)
                callbacks.sib(true, roots[ni-1], n);
            callbacks.push && callbacks.push();
            place_tree(n, callbacks.row ? callbacks.row(n.orig) : 0);
        });
        callbacks.finish(rows);
    };
};
