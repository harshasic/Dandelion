import random

GRID_SIZE = 6
DIRECTIONS = [
    (0, -1),   # N
    (1, -1),   # NE
    (1, 0),    # E
    (1, 1),    # SE
    (0, 1),    # S
    (-1, 1),   # SW
    (-1, 0),   # W
    (-1, -1)   # NW
]
DIRECTION_NAMES = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

class Game:
    def __init__(self):
        self.grid = [['empty' for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
        self.dandelions = []
        self.used_directions = []
        self.empty_count = GRID_SIZE * GRID_SIZE

    def get_empty_cells(self):
        cells = []
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                if self.grid[y][x] == 'empty':
                    cells.append((x, y))
        return cells

    def place_dandelion(self, x, y):
        if self.grid[y][x] != 'empty':
            return False
        self.grid[y][x] = 'dandelion'
        self.dandelions.append((x, y))
        self.empty_count -= 1
        return True

    def apply_wind(self, dir_idx):
        dx, dy = DIRECTIONS[dir_idx]
        self.used_directions.append(dir_idx)
        filled_in_turn = 0
        
        # Wind blows from ALL dandelions
        for (dx_flower, dy_flower) in self.dandelions:
            cx, cy = dx_flower + dx, dy_flower + dy
            while 0 <= cx < GRID_SIZE and 0 <= cy < GRID_SIZE:
                if self.grid[cy][cx] == 'empty':
                    self.grid[cy][cx] = 'filled'
                    self.empty_count -= 1
                    filled_in_turn += 1
                cx += dx
                cy += dy
        return filled_in_turn

def run_simulation(p1_strategy="random", num_games=10000):
    wins_strict = 0   # 0 empty cells
    wins_relaxed = 0  # <= 3 empty cells
    total_empty_sum = 0
    min_empty = GRID_SIZE * GRID_SIZE
    
    for _ in range(num_games):
        game = Game()
        available_dirs = list(range(8))
        
        for turn in range(8):
            # Player 1 Move
            empty_cells = game.get_empty_cells()
            if not empty_cells:
                break 
            
            if p1_strategy == "random":
                move = random.choice(empty_cells)
            elif p1_strategy == "greedy":
                # Center Heuristic
                empty_cells.sort(key=lambda p: (p[0]-2.5)**2 + (p[1]-2.5)**2)
                move = empty_cells[0] 
            
            game.place_dandelion(move[0], move[1])
            
            # Player 2 Move (Random Wind)
            if not available_dirs: break
            wind = random.choice(available_dirs)
            available_dirs.remove(wind)
            game.apply_wind(wind)
            
        total_empty_sum += game.empty_count
        if game.empty_count < min_empty:
            min_empty = game.empty_count
            
        if game.empty_count == 0:
            wins_strict += 1
        if game.empty_count <= 3:
            wins_relaxed += 1
            
    print(f"--- Strategy: {p1_strategy} ({num_games} games) ---")
    print(f"Avg Empty Cells Left: {total_empty_sum / num_games:.2f}")
    print(f"Best Game (Min Empty): {min_empty}")
    print(f"Wins (Strict 0 left): {wins_strict} ({wins_strict/num_games*100:.2f}%)")
    print(f"Wins (Relaxed <=3 left): {wins_relaxed} ({wins_relaxed/num_games*100:.2f}%)")
    print("")

def find_perfect_game():
    print("Searching for a PERFECT GAME sequence...")
    attempts = 0
    while True:
        attempts += 1
        game = Game()
        available_dirs = list(range(8))
        move_history = []
        
        for turn in range(8):
            # Player 1 Move
            empty_cells = game.get_empty_cells()
            if not empty_cells:
                break 
            
            # Pure random search for a win
            move = random.choice(empty_cells)
            if not game.place_dandelion(move[0], move[1]):
                break

            # Player 2 Move
            if not available_dirs: break
            wind_idx = random.choice(available_dirs)
            available_dirs.remove(wind_idx)
            filled = game.apply_wind(wind_idx)

            move_history.append({
                "turn": turn + 1,
                "place": move,
                "wind": DIRECTION_NAMES[wind_idx],
                "filled": filled,
                "remaining": game.empty_count
            })
            
        if game.empty_count == 0:
            print(f"\nFOUND PERFECT GAME after {attempts} attempts!")
            print("Here is the winning sequence (1-BASED coordinates matches Game Log):")
            for m in move_history:
                col = m['place'][0] + 1
                row = m['place'][1] + 1
                print(f"Turn {m['turn']}: Place at ({col}, {row}) [Col {col}, Row {row}] -> Wind {m['wind']} (Filled {m['filled']} cells, {m['remaining']} left)")
            return

if __name__ == "__main__":
    print("Simulating Win Probability...")
    run_simulation(p1_strategy="random", num_games=100000)
    find_perfect_game()
