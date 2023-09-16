class Game {

    constructor () {

        //Game Settings
        this.game_dim = 750;
        this.game_gap = 15;
        this.move_time = 50;
        this.font_size = 96;
        this.chance_2 = 0.9;
        this.tile_colors = [
            //Background, Text
            ['#eee4da', '#776e65'],
            ['#ede0c8', '#776e65'],
            ['#f2b179', '#f9f6f2']
        ];

        //Game Init
        document.addEventListener('keydown', (event) => this.on_key_down(event));
        this.game_container = document.getElementById('game_container');
        this.game_container.style.width = this.game_dim + 'px';
        this.game_container.style.height = this.game_dim + 'px';
        this.game_container.style.gap = this.game_gap + 'px';
        this.unit = (this.game_dim - this.game_gap) / 4;

        //Game Prep
        this.highscore = 0;
        this.reset();

    }

    async on_key_down(key) {

        if (key.key == 'w' | key.key == 'ArrowUp') {this.up()}
        else if (key.key == 's' | key.key == 'ArrowDown') {this.down()}
        else if (key.key == 'a' | key.key == 'ArrowLeft') {this.left()}
        else if (key.key == 'd' | key.key == 'ArrowRight') {this.right()}
        else if (key.key == 'r' | key.key == ' ') {this.reset()}
        else if (key.key == 'c') {this.draw_tiles(true)}
        else if (key.key == 'u') {this.update()}
        else if (key.key == 'l') {
            this.board = Array.from({length:16}, (_, i) => (i == 0) ? 2 : (Math.floor(i / 4) % 2 == 0) ? 2 ** i : 2 ** (Math.floor(i / 4) * 4 + 3 - i % 4));
            this.update();
        }
        else if (key.key == 'n') {
            this.tile_colors = [
                ['#eee4da', '#776e65'],
                ['#ede0c8', '#776e65'],
                ['#f2b179', '#f9f6f2']
            ]; this.draw_tiles(true);
        }

    }

    update_colors(new_ind) {

        const req = new_ind + 1 - this.tile_colors.length;
        if (req > 0) {
            for (const i of Array(req)) {
                var text = Math.floor(Math.random()*(256**3));
                var background = 256 ** 3 - text;
                text = '#' + text.toString(16).padStart(6, 0);
                background = '#' + background.toString(16).padStart(6, 0);
                this.tile_colors.push([text, background]);
            }
        }

    }

    draw_tiles(see_colors=false) {

        for (const y of [0, 1, 2, 3]) {

            for (const x of [0, 1, 2, 3]) {

                const val = (see_colors) ? (4 * y + x == 0) ? 2 : 2 ** (4 * y + x + 1) : this.board[4 * y + x];
                const div = this.game_container.children[4 * y + x];
                const div_tiles = div.getElementsByTagName('tile');

                if (val != 0 | see_colors) {

                    if (div_tiles.length == 0) {

                        var tile = document.createElement('tile');
                        tile.style.display = 'grid';
                        tile.style.gridTemplate = '1fr / 1fr';
                        tile.style.setProperty('justify-items', 'center');
                        tile.style.setProperty('align-items', 'center');
                    
                        var value = document.createElement('p');
                        value.style.setProperty('grid-row', '1 / 2');
                        value.style.setProperty('grid-column', '1 / 2');

                        tile.appendChild(value);
                        div.appendChild(tile);
                    
                    } else {

                        var tile = div_tiles[0];
                        var value = tile.children[0];

                    }

                    const ind = Math.log(val) / Math.log(2) - 1;
                    this.update_colors(ind);
                    tile.style.setProperty('background', this.tile_colors[ind][0]);
                    tile.style.transform = '';
                    value.style.setProperty('color', this.tile_colors[ind][1]);
                    const val_len = ("" + val).length;
                    value.style.fontSize = this.font_size * ((val_len <= 2) ? 1 : 2 / val_len) + 'px';
                    value.textContent = val;

                } else if (val == 0) {if (div_tiles.length != 0) {div_tiles[0].remove()}}

            }
        }

    }

    update() {

        this.draw_tiles();
        if (this.score > this.highscore) {this.highscore = this.score}
        document.getElementById("highscore").textContent = this.highscore;
        document.getElementById("score").textContent = this.score;
        if (this.board.indexOf(0) != -1) {} else if (!this.check_alive()) {alert('You Died! Git Gud...')}

    }

    add_random() {

        if (!0 in this.board) {return}
        var zeros = [];
        const val = (Math.random() < this.chance_2) ? 2 : 4;
        for (var i of Array(16).keys()) {if (this.board[i] == 0) {zeros.push(i)}}
        this.board[zeros[Math.floor(Math.random() * zeros.length)]] = val;

    }

    reset() {

        this.score = 0;
        this.board = Array.from({length:16}, () => 0);
        this.add_random();
        this.add_random();
        this.update();

    }

    propagate(arr, index=null, block=[0, 0, 0, 0], shift=[0, 0, 0, 0], merge=[0, 0, 0, 0], inc_score=true) {

        if (index == null) {
            for (const index of [2, 1, 0]) {
                [arr, shift[index], merge[index]] = this.propagate(arr, index, block, shift[index], merge[index], inc_score)
            } return [arr, shift, merge]}
        if (index == 3 | arr[index] == 0) {return [arr, shift, 0]}
        if (arr[index + 1] == 0) {
            arr[index + 1] = arr[index];
            arr[index] = 0;
            return this.propagate(arr, index + 1, block, shift + 1, 0, inc_score);
        } if (arr[index + 1] == arr[index] && !block[index + 1]) {
            block[index + 1] = 1
            arr[index + 1] *= 2;
            if (inc_score) {this.score += arr[index+1]}
            arr[index] = 0;
            return [arr, shift + 1, 1];
        } else {return [arr, shift, 0]}

    }

    async move(tile, dx, dy) {
        const translate = 'translate('+dx*this.unit+'px, '+dy*this.unit+'px)';
        await tile.animate([{transform: translate}], this.move_time).finished;
    }

    async animate(iter, arr, shift, action) {

        const anims = [];
        for (const ind of [3, 2, 1, 0]) {
            const val = arr[ind];
            this.board[iter[ind]] = val;
            const div = this.game_container.children[iter[ind]];
            if (shift[ind]) {
                var tile = div.children[1];
                if (action == 'up') {anims.push(this.move(tile, 0, -shift[ind]))}
                else if (action == 'down') {anims.push(this.move(tile, 0, shift[ind]))}
                else if (action == 'left') {anims.push(this.move(tile, -shift[ind], 0))}
                else if (action == 'right') {anims.push(this.move(tile, shift[ind], 0))}
            }
        } return Promise.all(anims)

    }

    async up() {

        const [save, anims] = [this.board.slice(), []];
        for (const x in [0, 1, 2, 3]) {
            const [col, shift, merge] = this.propagate(Array.from({length:4}, (_, y) => this.board[12 - 4 * y + +x]));
            anims.push(this.animate(Array.from({length:4}, (_, y) => 12 - 4 * y + +x), col, shift, 'up'));
        } await Promise.all(anims);
        if (!save.every((val, ind) => {return this.board[ind] == val})) {this.add_random()}
        this.update();

    }

    async down() {

        const [save, anims] = [this.board.slice(), []];
        for (const x in [0, 1, 2, 3]) {
            const [col, shift, merge] = this.propagate(Array.from({length:4}, (_, y) => this.board[4 * y + +x]));
            anims.push(this.animate(Array.from({length:4}, (_, y) => 4 * y + +x), col, shift, 'down'));
        } await Promise.all(anims);
        if (!save.every((val, ind) => {return this.board[ind] == val})) {this.add_random()}
        this.update();

    }

    async left() {

        const [save, anims] = [this.board.slice(), []];
        for (const y in [0, 1, 2, 3]) {
            const [row, shift, merge] = this.propagate(Array.from({length:4}, (_, x) => this.board[4 * y + 3 - x]));
            anims.push(this.animate(Array.from({length:4}, (_, x) => 4 * y + 3 - x), row, shift, 'left'));
        } await Promise.all(anims);
        if (!save.every((val, ind) => {return this.board[ind] == val})) {this.add_random()}
        this.update();

    }

    async right() {

        const [save, anims] = [this.board.slice(), []];
        for (const y in [0, 1, 2, 3]) {
            const [row, shift, merge] = this.propagate(Array.from({length:4}, (_, x) => this.board[4 * y + x]));
            anims.push(this.animate(Array.from({length:4}, (_, x) => 4 * y + x), row, shift, 'right'));
        } await Promise.all(anims);
        if (!save.every((val, ind) => {return this.board[ind] == val})) {this.add_random()}
        this.update();

    }

    check_alive() {

        var test_board = Array.from({length:16}, () => 0);
        for (var col in [0, 1, 2, 3]) {
            var new_row = this.propagate(Array.from({length:4}, (_, ind) => this.board[12 - ind * 4 + +col]), null, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], false)[0];
            for (var ind of [0, 1, 2, 3]) {test_board[ind * 4 + +col] = new_row[3 - ind]}
        } if (!this.board.every((val, ind) => {return test_board[ind] == val})) {return true}

        var test_board = Array.from({length:16}, () => 0);
        for (var col in [0, 1, 2, 3]) {
            var new_row = this.propagate(Array.from({length:4}, (_, ind) => this.board[ind * 4 + +col]), null, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], false)[0];
            for (var ind of [0, 1, 2, 3]) {test_board[ind * 4 + +col] = new_row[ind]}
        } if (!this.board.every((val, ind) => {return test_board[ind] == val})) {return true}

        var test_board = Array.from({length:16}, () => 0);
        for (var row in [0, 1, 2, 3]) {
            var new_row = this.propagate(Array.from({length:4}, (_, ind) => this.board[row * 4 + 3 - ind]), null, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], false)[0];
            for (var ind of [0, 1, 2, 3]) {test_board[row * 4 + ind] = new_row[3 - ind]}
        } if (!this.board.every((val, ind) => {return test_board[ind] == val})) {return true}

        var test_board = Array.from({length:16}, () => 0);
        for (var row in [0, 1, 2, 3]) {
            var new_row = this.propagate(Array.from({length:4}, (_, ind) => this.board[row * 4 + ind]), null, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], false)[0];
            for (var ind of [0, 1, 2, 3]) {test_board[row * 4 + ind] = new_row[ind]}
        } if (!this.board.every((val, ind) => {return test_board[ind] == val})) {return true}

        return false;

    }

}