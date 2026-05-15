# Pathfinding Algorithms - Presentation Guide

## Overview
Your project implements **4 different pathfinding algorithms** that find the shortest route between two points on a real-world map. Each algorithm has different characteristics in terms of speed, optimality, and exploration pattern.

---

## 1. DIJKSTRA'S ALGORITHM

### What It Is
A classic **greedy algorithm** that guarantees finding the shortest path. It explores nodes in order of their distance from the start point.

### How It Works
```
1. Start at the starting node (distance = 0)
2. Look at all unvisited neighbors
3. Calculate distance to each neighbor = current distance + edge weight
4. Pick the unvisited node with SMALLEST distance from start
5. Mark it as visited and repeat from step 2
6. Stop when you reach the destination
```

### Key Properties
- **Optimal**: Always finds the shortest path ✓
- **Complete**: Always finds a solution if one exists ✓
- **Speed**: Medium (explores many nodes)
- **Memory**: Stores all nodes in open list
- **Best For**: When you need guaranteed shortest path

### Data Structures Used
- `openList`: Array of unvisited nodes to explore
- `distanceFromStart`: Cost from start to each node
- `visited`: Marks explored nodes

### Visualization
```
Start → [explores all directions equally] → End
        (like ripples in water expanding outward)
```

### Code Logic
```javascript
// Pick node with minimum distance from start
const currentNode = this.openList.reduce((acc, current) => 
    current.distanceFromStart < acc.distanceFromStart ? current : acc
);

// Update neighbors with new distances
for (const neighbor of currentNode.neighbors) {
    const newDistance = currentNode.distanceFromStart + edgeWeight;
    if (newDistance < neighbor.distanceFromStart) {
        neighbor.distanceFromStart = newDistance;
        neighbor.parent = currentNode;
    }
}
```

---

## 2. A* ALGORITHM (A-STAR)

### What It Is
An **optimized version of Dijkstra** that uses a heuristic (educated guess) to guide the search toward the goal. Much faster than Dijkstra while still finding the shortest path.

### How It Works
```
1. Start at the starting node
2. For each node, calculate: f(n) = g(n) + h(n)
   - g(n) = actual distance from start
   - h(n) = estimated distance to goal (straight line)
   - f(n) = total estimated cost
3. Always explore the node with SMALLEST f(n) value
4. This guides search toward the goal
5. Stop when you reach the destination
```

### Key Properties
- **Optimal**: Finds shortest path (with good heuristic) ✓
- **Complete**: Always finds solution if one exists ✓
- **Speed**: Fast (much better than Dijkstra)
- **Memory**: Stores open and closed lists
- **Best For**: Real-world GPS/navigation systems

### Data Structures Used
- `openList`: Nodes to explore
- `closedList`: Already explored nodes
- `distanceFromStart`: g(n) - actual cost
- `distanceToEnd`: h(n) - heuristic estimate
- `totalDistance`: f(n) = g(n) + h(n)

### Heuristic Used
```javascript
// Straight-line distance (Euclidean distance)
distanceToEnd = Math.hypot(
    node.longitude - endNode.longitude,
    node.latitude - endNode.latitude
);
```

### Visualization
```
Start → [focuses search toward goal] → End
        (like a cone pointing at destination)
```

### Code Logic
```javascript
// Pick node with minimum f(n) = g(n) + h(n)
const currentNode = this.openList.reduce((acc, current) => 
    current.totalDistance < acc.totalDistance ? current : acc
);

// If we find a better path, update the node
if (neighborCurrentCost < neighbor.distanceFromStart) {
    neighbor.distanceFromStart = neighborCurrentCost;
    neighbor.parent = currentNode;
}
```

### Why It's Better Than Dijkstra
- Dijkstra explores in all directions (360°)
- A* focuses exploration toward the goal
- A* explores fewer nodes = faster

---

## 3. GREEDY BEST-FIRST SEARCH

### What It Is
A **fast but not always optimal** algorithm that only looks at the straight-line distance to the goal. It greedily picks the node closest to the destination.

### How It Works
```
1. Start at the starting node
2. Look at all unvisited neighbors
3. Calculate straight-line distance to goal for each
4. Pick the neighbor CLOSEST to the goal (ignore actual path cost)
5. Repeat from step 2
6. Stop when you reach the destination
```

### Key Properties
- **Optimal**: NOT guaranteed to find shortest path ✗
- **Complete**: Usually finds a solution ✓
- **Speed**: Very fast (explores fewest nodes)
- **Memory**: Minimal
- **Best For**: When speed matters more than optimality

### Data Structures Used
- `openList`: Nodes to explore
- `distanceToEnd`: Straight-line distance to goal
- `visited`: Marks explored nodes

### Visualization
```
Start → [rushes directly toward goal] → End
        (like a bee flying straight to flower)
```

### Code Logic
```javascript
// Pick node with MINIMUM distance to end (ignores actual path cost)
const currentNode = this.openList.reduce((acc, current) => 
    current.distanceToEnd < acc.distanceToEnd ? current : acc
);

// Only consider distance to goal, not distance from start
neighbor.distanceToEnd = Math.hypot(
    neighbor.longitude - this.endNode.longitude,
    neighbor.latitude - this.endNode.latitude
);
```

### When It Fails
```
Example: If there's a wall between start and goal
- Greedy: Keeps moving toward goal, hits wall, backtracks
- A*: Considers actual path cost, finds way around
- Dijkstra: Explores systematically, finds way around
```

---

## 4. BIDIRECTIONAL SEARCH

### What It Is
A **clever optimization** that searches from BOTH the start and end simultaneously. They meet in the middle, reducing search space significantly.

### How It Works
```
1. Start two searches:
   - Forward search: from start node
   - Backward search: from end node
2. Each search explores neighbors independently
3. When forward search reaches a node already visited by backward search
   → They've met! Path found!
4. Reconstruct path by connecting both searches
```

### Key Properties
- **Optimal**: Finds shortest path ✓
- **Complete**: Always finds solution if one exists ✓
- **Speed**: Very fast (searches from both ends)
- **Memory**: Two open/closed sets
- **Best For**: When you know both start and end points

### Data Structures Used
- `openSetStart`: Nodes to explore from start
- `openSetEnd`: Nodes to explore from end
- `closedSetStart`: Explored nodes from start
- `closedSetEnd`: Explored nodes from end
- `parent` & `prevParent`: Track paths from both directions

### Visualization
```
Start → [search expands] ← End
        [they meet in middle]
        
Much faster than single search!
```

### Code Logic
```javascript
// Forward search
const currentStart = this.getNextFromOpenSet(this.openSetStart);
if (this.closedSetEnd.has(currentStart)) {
    // Backward search already visited this node!
    this.finished = true; // Path found!
}

// Backward search
const currentEnd = this.getNextFromOpenSet(this.openSetEnd);
if (this.closedSetStart.has(currentEnd)) {
    // Forward search already visited this node!
    this.finished = true; // Path found!
}
```

### Why It's Faster
- Single search explores radius r from start
- Bidirectional explores radius r/2 from both ends
- Total nodes explored: 2 × (r/2)² = r²/2 (half the nodes!)

---

## COMPARISON TABLE

| Feature | Dijkstra | A* | Greedy | Bidirectional |
|---------|----------|-----|--------|---------------|
| **Shortest Path** | ✓ Yes | ✓ Yes | ✗ No | ✓ Yes |
| **Speed** | Medium | Fast | Very Fast | Very Fast |
| **Nodes Explored** | Many | Medium | Few | Few |
| **Memory Usage** | High | High | Low | High |
| **Complexity** | O(n²) | O(n log n) | O(n) | O(n) |
| **Best Use Case** | Academic | GPS/Maps | Real-time | Known endpoints |

---

## ALGORITHM SELECTION GUIDE

### Use Dijkstra When:
- You need guaranteed shortest path
- You're learning algorithms
- You want to understand the baseline

### Use A* When:
- You need fast AND optimal results
- You have a good heuristic
- Real-world navigation (GPS, games)

### Use Greedy When:
- Speed is critical
- Approximate solution is acceptable
- Memory is limited

### Use Bidirectional When:
- You know both start and end points
- You want maximum speed
- You have enough memory for two searches

---

## HOW YOUR PROJECT VISUALIZES THEM

### Color Coding
- **Green/Explored**: Nodes the algorithm visited
- **Blue/Path**: The final shortest path found
- **Red**: Start point
- **Yellow**: End point

### Animation
- Each frame advances the algorithm by N steps (based on speed slider)
- You can pause, rewind, and adjust playback speed
- Watch how each algorithm explores differently

### Real-World Data
- Uses actual OpenStreetMap road network
- Nodes = intersections
- Edges = roads with real distances
- Demonstrates algorithms on real geography

---

## KEY TAKEAWAYS FOR PRESENTATION

1. **Dijkstra**: Foundation algorithm, explores uniformly
2. **A***: Dijkstra + heuristic = much faster
3. **Greedy**: Fastest but not always optimal
4. **Bidirectional**: Two searches meet in middle = half the work

Each algorithm trades off between:
- **Speed** (how fast it finds answer)
- **Optimality** (whether answer is best)
- **Memory** (how much storage needed)

Your project beautifully demonstrates these tradeoffs visually!
