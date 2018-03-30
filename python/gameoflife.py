#! /usr/bin/env python3.6
import random
import copy

class Grid:
    grid = []
    width = 0
    height = 0

    def __init__(self, width, height):
        grid = []
        for i in range(0, height):
            grid.append([])
            for _ in range(0, width):
                grid[i].append(0)
        self.grid = grid
        self.width = width
        self.height = height

    def __getitem__(self, key):
        return self.grid[key]

    def __iter__(self):
        return iter(self.grid)

    def randomize(self):
        for row in self.grid:
            for i in range(0, len(row)):
                if random.random() < 0.2:
                    row[i] = 1

class Simulation:
    startGrid = None
    nextState = None
    currentState = None
    lastState = None

    def __init__(self, width=20, height=20, randomize=True):
        self.nextState = Grid(width, height)
        self.currentState = Grid(width, height)
        self.lastState = Grid(width, height)
        if randomize:
            self.randomize_start()

    def randomize_start(self):
        self.currentState.randomize()

    def run(self, limit=0):
        self.startGrid = copy.deepcopy(self.currentState.grid)

        generation = 1

        stalled = False
        while not stalled:
            if limit > 0 and generation == limit:
                break

            stalled = self._next_generation()
            self._rotate_grids()
            generation += 1

        return generation


    def _next_generation(self):
        stalled = True
        for i, row in enumerate(self.currentState):
            for j in range(0, len(row)):
                neighbors = self._count_neighbors(i, j)

                if neighbors < 2:
                    self.nextState[i][j] = 0
                elif (neighbors == 2 or neighbors == 3) and row[j] == 1:
                    self.nextState[i][j] = 1
                elif neighbors > 3:
                    self.nextState[i][j] = 0
                elif neighbors == 3 and row[j] == 0:
                    self.nextState[i][j] = 1
                else:
                    self.nextState[i][j] = 0

                if self.nextState[i][j] != self.lastState[i][j]:
                    stalled = False

        return stalled

    def _rotate_grids(self):
        last = self.lastState
        self.lastState = self.currentState
        self.currentState = self.nextState
        self.nextState = last

    def _count_neighbors(self, row, column):
        count = 0

        if row-1 >= 0:
            if self.currentState[row-1][column] == 1:
                count += 1

        if row+1 < self.currentState.width:
            if self.currentState[row+1][column] == 1:
                count += 1

        if column-1 >= 0:
            if self.currentState[row][column-1] == 1:
                count += 1

        if column+1 < self.currentState.height:
            if self.currentState[row][column+1] == 1:
                count += 1

        if column-1 >= 0 and row-1 >= 0:
            if self.currentState[row-1][column-1] == 1:
                count += 1

        if column-1 >= 0 and row+1 < self.currentState.width:
            if self.currentState[row+1][column-1] == 1:
                count += 1

        if column+1 < self.currentState.height and row-1 >= 0:
            if self.currentState[row-1][column+1] == 1:
                count += 1

        if column+1 < self.currentState.height and row+1 < self.currentState.width:
            if self.currentState[row+1][column+1] == 1:
                count += 1

        return count

def main():
    sim = Simulation()
    print("Simulation stalled in {} generations".format(sim.run()))


if __name__ == '__main__':
    main()
