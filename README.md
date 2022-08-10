Its a prototype for map viewer which can be modified to integrated with any IPS system inside warehouse to navigate to get invetory from current location to counter or end location.

## Features

1. Create Nodes across warehouse 
2. Create Path across warehouse 
3. Add inventory for each node
4. Display the shortest path from start to end nodes alon selected inventories 

## Screenshot 
Edit the nodes, path, inventory in the floorplan
![edit page](edit.png?raw=true)
Shortest path while picking along the selected invntories
![Shortest path page](shortestPath.png?raw=true)

### Requirements

 Install via requirements:

 ```bash
 pip install -r requirements.txt
 ```

### Run

```bash
    python setup.py
```

 Development Mode

 ```bash
 python app.py -d
 ```

 Production Mode

 ```bash
 python app.py
 ```