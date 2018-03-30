#! /usr/bin/env python3.6

from gameoflife import Simulation
from argparse import ArgumentParser
from shutil import rmtree
from os import mkdir
import os.path

parser = ArgumentParser()
parser.add_argument('-r', type=int, metavar='N', help='Simulation rounds', default=10)
parser.add_argument('-l', type=int, metavar='N', help='Generational limit', default=2000)
parser.add_argument('--size', type=int, metavar='N', help='World size', default=20)
parser.add_argument('--no-every', action='store_true')
args = parser.parse_args()

rounds = args.r
generation_limit = args.l
best_simulation = {
    'score': 0,
    'simulation': None,
    'simulation_num': 0
}

if not args.no_every:
    if os.path.isdir('grids'):
        rmtree('grids')
    mkdir('grids')

for i in range(1, rounds+1):
    print("Simulation round {}".format(i))
    sim = Simulation(args.size, args.size)

    if not args.no_every:
        with open('grids/simulation-{}.txt'.format(i), 'w') as file:
            file.write("%s\n" % sim.currentState.grid)

    score = sim.run(generation_limit)

    print("  Simulation score: {}".format(score))
    if score != generation_limit and score > best_simulation['score']:
        best_simulation['score'] = score
        best_simulation['simulation'] = sim
        best_simulation['simulation_num'] = i

print("\nBest simulation score: {}".format(best_simulation['score']))

with open('best.txt', 'w') as file:
    file.write("%s\n" % best_simulation['simulation'].startGrid)
