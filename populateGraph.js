const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

function Graph() {
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

  this.addEdge = function (u, v) {
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push(v);
    //Uncomment this section for undirected graph 
   // if (neighbors[v] === undefined) {  // Also add the edge v -> u in order
     // neighbors[v] = [];               // to implement an undirected graph.
    //}                                  // For a directed graph, delete
    //neighbors[v].push(u);              // these four lines.
  };

  return this;
}

//Breadth First Retrieval implementation
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

//Determine the shortest path between two given location
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
          distance++;    
          u = predecessor[u];
        }
        path.push(u);
        distance++;
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


//Print path for debugging
function print(s) {  // A quick and dirty way to display output.
  s = s || '';
  console.log(s);
}


//Main Lambda function entry point
exports.handler = async (event) => {
    var parsedBody = JSON.parse(event.body);
    console.log("parsedBody###"+parsedBody.graph);
    //parse json body and build the graph 
    var chars = parsedBody.graph.split(',');
    var graph = new Graph();
    var locList = [];
    var filteredLocList = [];
    var i;
    //build the graph
    for (i = 0; i < chars.length; i++) { 
            console.log("array "+i+" is =" +chars[i]);
            var nodeSplit = chars[i].split('->');
            var source = nodeSplit[0];
            var destination = nodeSplit[1];
            graph.addEdge(source, destination);
            locList.push(source);
            locList.push(destination);
     }
     
    //remove duplicates from cities   
    filteredLocList = locList.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
    
      //Iterate through each source in the loop and within that loop , iterate through destionation loop
      //If it is a valid route, compute distance and add it to the DynamoDB table 
      for(let i = 0; i < filteredLocList.length; i++){
          console.log("filteredlist###"+filteredLocList[i]);
          for(let j = 0; j < filteredLocList.length; j++){
              console.log("source####"+filteredLocList[i]);
              console.log("destination####"+filteredLocList[j]);
              //if source and destination are different alone , calculate the shortest distance 
               if(filteredLocList[i]!=filteredLocList[j]){
                 try{
                    var distance = shortestPath(graph, filteredLocList[i], filteredLocList[j]);
                    console.log("valid path, adding to dynamodb distance###"+distance);
                     var params = {
                        TableName : "distance_graph",
                        Item: { 
                              sourceCity :filteredLocList[i], 
                              targetCity: filteredLocList[j], 
                              distance: distance
                            }
                     };
        
                  const result = await docClient.put(params).promise();
                  console.log("record added for "+[i]+result);
                  
                 }
                  catch(error){
                    console.log("valid path does not exist, so not adding them");
                }
              }
          }
      }
    
  //bfs(graph, 'Logan');
  //print();
  //var distanceret = shortestPath(graph, 'SaltLakeCity', 'Provo');
  //console.log("shortest path returned ###"+distanceret);
  //print();
  



    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
