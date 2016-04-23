// this naive tree-drawer is paraphrased from memory from dot
dc_graph.tree_positions = function(rootf, rowf, treef, ofsx, ofsy, xgap, ygap) {
    var x = ofsx;
    var dfs = dc_graph.depth_first_traversal(rootf, rowf, treef, function(n, r) {
        n.left_x = x;
        n.hit_ins = 1;
        n.cola.y = r*ygap + ofsy;
    }, function() {
        x += xgap;
    }, null, function(n) {
        n.cola.x = (n.left_x + x)/2;
        delete n.left_x;
    }, function(n, indegree) {
        // rolling average of in-neighbor x positions
        n.cola.x = (n.hit_ins*n.cola.x + x)/++n.hit_ins;
        if(n.hit_ins === indegree)
            delete n.hit_ins;
    });

    return dfs;
};
