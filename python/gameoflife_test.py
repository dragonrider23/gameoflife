#! /usr/bin/env python3.6

import gameoflife

def test_neighbor_count():
    grid = gameoflife.Grid(5, 5)
    grid.grid = [
        [0,0,1,1,0],
        [0,1,0,1,0],
        [0,0,1,1,1],
        [0,0,0,0,0],
        [1,0,1,1,0]
    ]

    sim = gameoflife.Simulation()
    sim.currentState = grid

    neighbors = sim._count_neighbors(0, 0)
    if neighbors != 1:
        print("Incorrect neighbors. Expected 1, got {}".format(neighbors))

    neighbors = sim._count_neighbors(1, 2)
    if neighbors != 6:
        print("Incorrect neighbors. Expected 6, got {}".format(neighbors))

def test_generations():
    grid = gameoflife.Grid(5, 5)
    grid.grid = [
        [0,0,1,1,0],
        [0,1,0,1,0],
        [0,0,1,1,1],
        [0,0,0,0,0],
        [1,0,1,1,0]
    ]

    sim = gameoflife.Simulation(5, 5)
    sim.currentState = grid

    expected = [
        [0,0,1,1,0],
        [0,1,0,0,0],
        [0,0,1,1,1],
        [0,1,0,0,1],
        [0,0,0,0,0]
    ]

    stalled = sim._next_generation()
    if stalled:
        print("Simulation should not be stalled")
        return

    if sim.nextState.grid != expected:
        print("Incorrect next state. Expected {}, got {}".format(expected, sim.nextState.grid))

def test_simulation_run():
    grid = gameoflife.Grid(5, 5)
    grid.grid = [
        [0,0,1,1,0],
        [0,1,0,1,0],
        [0,0,1,1,1],
        [0,0,0,0,0],
        [1,0,1,1,0]
    ]

    sim = gameoflife.Simulation(5, 5)
    sim.currentState = grid
    generations = sim.run()
    if generations != 13:
        print("Incorrect generation count. Expected 13, got {}".format(generations))

test_neighbor_count()
test_generations()
test_simulation_run()
print("Tests complete")
