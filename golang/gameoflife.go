package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"time"
)

var (
	rounds          int
	generationLimit int
	worldSize       int
	workers         int
	writeEveryGrid  bool
)

func init() {
	rand.Seed(time.Now().UnixNano())
	flag.IntVar(&rounds, "r", 10, "Simulation rounds")
	flag.IntVar(&generationLimit, "l", 2000, "Generation limit")
	flag.IntVar(&worldSize, "size", 20, "World size")
	flag.IntVar(&workers, "w", 4, "Number of workers")
	flag.BoolVar(&writeEveryGrid, "wa", false, "Write all generated grids to a file")
}

func main() {
	flag.Parse()

	if writeEveryGrid {
		os.Mkdir("grids", 0755)
	}

	bestSimulation := struct {
		score int
		sim   *simulation
	}{score: 0}

	type work struct {
		s        *simulation
		i, score int
	}

	simulationQueue := make(chan *work, 10)
	resultsQueue := make(chan *work, 10)
	// Start simulation runners
	for i := 0; i < workers; i++ {
		go func() {
			for w := range simulationQueue {
				w.score = w.s.run(generationLimit)
				resultsQueue <- w
			}
		}()
	}

	start := time.Now()
	// Start simulation generator
	go func() {
		for i := 1; i <= rounds; i++ {
			s := newSimulation(worldSize, worldSize, true)
			if writeEveryGrid {
				jsonData, _ := json.Marshal(s.currentState)
				ioutil.WriteFile(fmt.Sprintf("grids/simulation-%d.txt", i), jsonData, 0644)
			}
			simulationQueue <- &work{
				s: s,
				i: i,
			}
		}
		close(simulationQueue)
	}()

	// Collect and analyze simulation results
	for i := 1; i <= rounds; i++ {
		result := <-resultsQueue
		fmt.Printf("Simulation round %d\n", result.i)
		fmt.Printf("  Simulation score: %d\n", result.score)

		if result.score < generationLimit && result.score > bestSimulation.score {
			bestSimulation.score = result.score
			bestSimulation.sim = result.s
		}
	}

	close(resultsQueue)

	fmt.Printf("\nSimulation finished in %s\n", time.Since(start))

	fmt.Printf("\nBest score: %d\n", bestSimulation.score)
	jsonData, _ := json.Marshal(bestSimulation.sim.startGrid)
	ioutil.WriteFile("best.txt", jsonData, 0644)
}

type grid [][]int

func newGrid(width, height int) grid {
	g := make([][]int, height)
	for i := range g {
		g[i] = make([]int, width)
	}
	return g
}

func (g grid) randomize() {
	for i := range g {
		for j := range g[i] {
			if rand.Float32() < 0.2 {
				g[i][j] = 1
			}
		}
	}
}

func (g grid) copy() grid {
	newg := newGrid(len(g[0]), len(g))
	for i := range g {
		for j := range g[i] {
			newg[i][j] = g[i][j]
		}
	}
	return newg
}

type simulation struct {
	startGrid    grid
	nextState    grid
	currentState grid
	lastState    grid
}

func newSimulation(width, height int, randomize bool) *simulation {
	s := &simulation{
		nextState:    newGrid(width, height),
		currentState: newGrid(width, height),
		lastState:    newGrid(width, height),
	}

	if randomize {
		s.currentState.randomize()
	}
	return s
}

func (s *simulation) run(limit int) int {
	s.startGrid = s.currentState.copy()
	generation := 1
	stalled := false

	for !stalled {
		if limit > 0 && generation == limit {
			break
		}

		stalled = s.nextGeneration()
		s.rotateGrids()
		generation++
	}
	return generation
}

func (s *simulation) rotateGrids() {
	last := s.lastState
	s.lastState = s.currentState
	s.currentState = s.nextState
	s.nextState = last
}

func (s *simulation) nextGeneration() bool {
	stalled := true

	for i, row := range s.currentState {
		for j, cell := range row {
			neighbors := s.neighborCount(i, j)

			if neighbors < 2 {
				s.nextState[i][j] = 0
			} else if (neighbors == 2 || neighbors == 3) && cell == 1 {
				s.nextState[i][j] = 1
			} else if neighbors > 3 {
				s.nextState[i][j] = 0
			} else if neighbors == 3 && cell == 0 {
				s.nextState[i][j] = 1
			} else {
				s.nextState[i][j] = 0
			}

			if s.nextState[i][j] != s.lastState[i][j] {
				stalled = false
			}
		}
	}

	return stalled
}

func (s *simulation) neighborCount(row, column int) int {
	count := 0

	if row-1 >= 0 {
		if s.currentState[row-1][column] == 1 {
			count++
		}
	}

	if row+1 < len(s.currentState[0]) {
		if s.currentState[row+1][column] == 1 {
			count++
		}
	}

	if column-1 >= 0 {
		if s.currentState[row][column-1] == 1 {
			count++
		}
	}

	if column+1 < len(s.currentState) {
		if s.currentState[row][column+1] == 1 {
			count++
		}
	}

	if column-1 >= 0 && row-1 >= 0 {
		if s.currentState[row-1][column-1] == 1 {
			count++
		}
	}

	if column-1 >= 0 && row+1 < len(s.currentState[0]) {
		if s.currentState[row+1][column-1] == 1 {
			count++
		}
	}

	if column+1 < len(s.currentState) && row-1 >= 0 {
		if s.currentState[row-1][column+1] == 1 {
			count++
		}
	}

	if column+1 < len(s.currentState) && row+1 < len(s.currentState[0]) {
		if s.currentState[row+1][column+1] == 1 {
			count++
		}
	}

	return count
}
