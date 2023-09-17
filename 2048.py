import random

class Game():
    
    UP = 0
    DOWN = 1
    LEFT = 2
    RIGHT = 3
    
    def __init__(self): self.reset()
    
    def reset(self):
        
        self.board = [0 for x in range(16)]
        self.add_random()
        self.add_random()
        self.score = 0
    
    def add_random(self):
        
        if not 0 in self.board: return
        val = 2 if random.random() < 0.9 else 4
        zeros = [i for i in range(16) if self.board[i] == 0]
        self.board[random.choice(zeros)] = val
        
    def propagate(self, arr, ind=None, block=None, inc_score=False):
        
        if ind == None:
            block = [0, 0, 0, 0]
            for ind in [2, 1, 0]: self.propagate(arr, ind, block, inc_score)
            return arr
        if ind == 3 or arr[ind] == 0: return
        if arr[ind+1] == arr[ind] and not block[ind+1]:
            arr[ind], arr[ind+1], block[ind+1] = 0, arr[ind]*2, 1
            if inc_score: self.score += arr[ind+1]
        elif arr[ind+1] == 0:
            arr[ind], arr[ind+1] = 0, arr[ind]
            self.propagate(arr, ind+1, block, inc_score)
    
    def up(self):
    
        for col in range(4):
            self.board[col::4] = self.propagate(self.board[col::4][::-1], inc_score=True)[::-1]
    
    def down(self):
    
        for col in range(4):
            self.board[col::4] = self.propagate(self.board[col::4], inc_score=True)
    
    def left(self):
    
        for row in range(4):
            self.board[4*row:4*row+4] = self.propagate(self.board[4*row:4*row+4][::-1], inc_score=True)[::-1]
    
    def right(self):
    
        for row in range(4):
            self.board[4*row:4*row+4] = self.propagate(self.board[4*row:4*row+4], inc_score=True)
            
    def check_alive(self):
        
        for col in range(4):
            if self.board[col::4] != self.propagate(self.board[col::4][::-1])[::-1]: return True
            if self.board[col::4] != self.propagate(self.board[col::4]): return True
        for row in range(4):
            if self.board[4*row:4*row+4] != self.propagate(self.board[4*row:4*row+4][::-1])[::-1]: return True
            if self.board[4*row:4*row+4] != self.propagate(self.board[4*row:4*row+4]): return True
        return False
    
    def move(self, action):
        
        prev = self.board[:]
        if action == self.UP: self.up()
        if action == self.DOWN: self.down()
        if action == self.LEFT: self.left()
        if action == self.RIGHT: self.right()
        if prev != self.board: self.add_random()
        return self.check_alive()
        
    def display(self):
        
        for row in range(4): print(self.board[4*row:4*row+4])

game = Game()
while True:
    game.display()
    move = random.randint(0, 3)
    print(['UP', 'DOWN', 'LEFT', 'RIGHT'][move])
    if not game.move(move): break
    print(game.score)
    print()
print()
game.display()
print(game.score, max(game.board))