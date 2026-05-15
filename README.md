# AI Pathfinding Visualizer

A React + Vite application that visualizes pathfinding algorithms on a real-world map. The project includes Dijkstra, A*, Greedy Best-First Search, and Bidirectional Search, and lets users explore how each algorithm finds a path between two points.

## Features

- Interactive map-based pathfinding visualization
- Four pathfinding algorithms:
  - Dijkstra
  - A*
  - Greedy Best-First Search
  - Bidirectional Search
- Real map rendering with Deck.gl, MapLibre, and React
- UI controls for algorithm selection and simulation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sksadiya22/AI-Pathfinding-Visualizer.git
   cd AI-Pathfinding-Visualizer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

To create a production build:

```bash
npm run build
```

## Project Structure

- `src/` — application source files
- `src/components/` — React UI components
- `src/models/algorithms/` — pathfinding implementations
- `src/services/MapService.js` — map helper service
- `public/` — static assets

## Notes

- The project uses `vite` and React 18.
- Map rendering relies on Deck.gl and MapLibre.

## License

This project is available under the terms of the included `LICENSE` file.
