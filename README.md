# Dandelion

A two-player strategy game based on wind and seeds.

## How to Play

1.  **Start the Game**: Run the command below to start the server.
2.  **Player 1 (The Planter)**: Click any empty cell on the 6x6 grid to place a Dandelion (✳️).
3.  **Player 2 (The Wind)**: Choose a direction from the Compass on the right.
4.  **Reaction**: The wind blows from the Dandelion, filling all cells in that path with red seeds (•).
5.  **Loop**: Players take turns—placing a new Dandelion and choosing a new Wind Direction—until all 8 directions are used.
6.  **Victory**:
    *   **Player 1 Wins** if *all* cells are filled.
    *   **Player 2 Wins** if *any* cell remains empty.

## Running the Game

To play the game on your localhost:

```bash
npm run dev
```

Then open the URL shown (usually `http://localhost:5173`).
