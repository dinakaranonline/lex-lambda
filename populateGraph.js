const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

function Graph() {
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

  this.addEdge = function (u, v) {
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push(v);
    if (neighbors[v] === undefined) {  // Also add the edge v -> u in order
      neighbors[v] = [];               // to implement an undirected graph.
    }                                  // For a directed graph, delete
    neighbors[v].push(u);              // these four lines.
  };

  return this;
}

function bfs(graph, source) {
  var queue = [ { vertex: source, count: 0 } ],
      visited = { source: true },
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail].vertex,
        count = queue[tail++].count;  // Pop a vertex off the queue.
    print('distance from ' + source + ' to ' + u + ': ' + count);
    graph.neighbors[u].forEach(function (v) {
      if (!visited[v]) {
        visited[v] = true;
        queue.push({ vertex: v, count: count + 1 });
      }
    });
  }
}

function shortestPath(graph, source, target) {
  var distance=0;
  if (source == target) {   // Delete these four lines if
    print(source);          // you want to look for a cycle
    //console.log("distance###"+distance);
    return distance;                 // when the source is equal to
  }                         // the target.
  var queue = [ source ],
      visited = { source: true },
      predecessor = {},
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail++],  // Pop a vertex off the queue.
        neighbors = graph.neighbors[u];
    for (var i = 0; i < neighbors.length; ++i) {
      var v = neighbors[i];
      if (visited[v]) {
         
        continue;
      }
      visited[v] = true;
     
      if (v === target) {   // Check if the path is complete.
        var path = [ v ];   // If so, backtrack through the path.
        while (u !== source) {
            
          path.push(u);
          distance++    
          u = predecessor[u];
        }
        path.push(u);
        distance++
        path.reverse();
        print(path.join(' > '));
        console.log("distance###"+distance);
        return distance;
      }
      predecessor[v] = u;
      queue.push(v);
    }
  }
  print('there is no path from ' + source + ' to ' + target);
}

function print(s) {  // A quick and dirty way to display output.
  s = s || '';
  console.log(s);
}




exports.handler = async (event) => {
    //console.log("event header"+event.header)
   // console.log("eneted here");
    //console.log("event body"+event.body["graph"]);
    var parsedBody = JSON.parse(event.body);
    console.log("parsedBody###"+parsedBody.graph);
    var chars = parsedBody.graph.split(',');
    
    var graph = new Graph();
    var i;
    for (i = 0; i < chars.length; i++) { 
            console.log("array "+i+" is =" +chars[i]);
            var nodeSplit = chars[i].split('->');
            var source = nodeSplit[0];
            var destination = nodeSplit[1];
            graph.addEdge(source, destination);
     }
     

 
  //graph.addEdge('Logan', 'SaltLakeCity');
  //graph.addEdge('Logan', 'CiderCity');
  //graph.addEdge('SaltLakeCity', 'Provo');


  //bfs(graph, 'Logan');
  print();
  var distanceret = shortestPath(graph, 'SaltLakeCity', 'Provo');
  console.log("shortest path returned ###"+distanceret);
  print();
  shortestPath(graph, 'Logan', 'Provo');
  print();
  shortestPath(graph, 'Provo', 'CiderCity');
  print();
  shortestPath(graph, 'SaltLakeCity', 'Logan');
  print();
  
    
    var distanceArray= [ ]; 
    var record1 = {sourceCity:"sourceCity1", targetCity:"targetCity1", distance:"1000"};
    var record2 = {sourceCity:"sourceCity2", targetCity:"targetCity2", distance:"2000"};
    var record3 = {sourceCity:"sourceCity3", targetCity:"targetCity3", distance:"3000"};
    var record4 = {sourceCity:"sourceCity4", targetCity:"targetCity4", distance:"4000"};
    
    distanceArray.push(record1); 
    distanceArray.push(record2); 
    distanceArray.push(record3); 
    distanceArray.push(record4);
    
    for(let i = 0; i < distanceArray.length; i++){
        
        //console.log("source city####"+distanceArray[i].sourceCity);
        //console.log("target city####"+distanceArray[i].targetCity);
        //console.log("distance####"+distanceArray[i].distance);
        
        var params = {
            TableName : "distance_graph",
            Item: { 
                sourceCity : distanceArray[i].sourceCity, 
                targetCity: distanceArray[i].targetCity, 
                distance: distanceArray[i].distance 
             
            }
        };
        
         //const result = await docClient.put(params).promise();
         //console.log("record added for "[i]);
        
    }
    
  
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
