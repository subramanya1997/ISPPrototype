class PriorityQueue {
    constructor() {
      this.collection = [];
    }

    enqueue(element){
        if (this.isEmpty()){ 
          this.collection.push(element);
        } else {
          let added = false;
          for (let i = 1; i <= this.collection.length; i++){
            if (element[1] < this.collection[i-1][1]){ 
              this.collection.splice(i-1, 0, element);
              added = true;
              break;
            }
          }
          if (!added){
              this.collection.push(element);
          }
        }
    }

    dequeue() {
        let value = this.collection.shift();
        return value;
    }

    isEmpty() {
        return (this.collection.length === 0) 
    }
}


class Graph {
    constructor() {
      this.nodes = new Set();
      this.adjacencyList = {};
    }

    addNode(node) {
        this.nodes.add(node); 
        this.adjacencyList[node] = [];
    }

    addEdge(node1, node2, weight) {
        this.adjacencyList[node1].push({node:node2, weight: weight});
        this.adjacencyList[node2].push({node:node1, weight: weight});
    }

    findPathWithDijkstra(startNode, endNode){
        let times = {};
        let backtrace = {};
        let pq = new PriorityQueue();
    
        times[startNode] = 0;
      
        this.nodes.forEach(node => {
            if (node !== startNode) {
            times[node] = Infinity
            }
        });
    
        pq.enqueue([startNode, 0]);
    
        while (!pq.isEmpty()) {
            let shortestStep = pq.dequeue();
            let currentNode = shortestStep[0];
            this.adjacencyList[currentNode].forEach(neighbor => {
              let time = times[currentNode] + neighbor.weight;
              if (time < times[neighbor.node]) {
                times[neighbor.node] = time;
                backtrace[neighbor.node] = currentNode;
                pq.enqueue([neighbor.node, time]);
              }
            });
        }
    
        let path = [endNode];
        let lastStep = endNode;
        while(lastStep !== startNode) {
          path.unshift(backtrace[lastStep])
          lastStep = backtrace[lastStep]
        }
        return {
            path : path,
            distance :times[endNode],
        };
    }
}