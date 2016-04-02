function D3UI(game) {
  this.game = game;
  this.box = 20;
  this.grid = d3.select('#game-canvas');
  this.grid.selectAll('rect').remove();
  this.grid.selectAll('text').remove();
}
D3UI.prototype.init = function () {
  var width = this.game.width,
      height = this.game.height,
      box = this.box,
      game = this.game,
      grid = this.grid;
  grid.selectAll('div').data(this.game.mask)
  .enter().append('rect').attr('x', function (d, i) {
    return parseInt(i % width) * box + 'px';
  }).attr('y', function (d, i) {
    return parseInt(i / width) * box + 'px';
  }).attr('fill', 'yellow')
  .attr('width', box + 'px').attr('height', box + 'px')
  .on('click', function (d, i) {
    var x = parseInt(i % width), y = parseInt(i / width);
    game.next(x, y);
  });
  grid.selectAll('div').data(this.game.mask)
  .enter().append('text').attr('x', function (d, i) {
    return parseInt(i % width) * box + 10 + 'px';
  }).attr('y', function (d, i) {
    return parseInt(i / width) * box + 15 + 'px';
  })
  .attr('fill', 'black')
  .attr('font-size', '10px')
  .attr('text-anchor', 'middle');
};
D3UI.prototype.update = function () {
  if (this.grid) {
    var grid = this.grid,
        game = this.game,
        width = this.game.width,
        height = this.game.height,
        box = this.box;
    grid.selectAll('rect').data(this.game.mask)
    .attr('fill', function (d) {
      if (d) {
        return 'white';
      } else {
        return 'yellow';
      }
    });
    grid.selectAll('text').data(this.game.mask)
    .text(function (d, i) {
      if (d) {
        return game.data[i];
      } else {
        return '';
      }
    });
  } else {
    throw 'not initialized.'
  }
};
D3UI.prototype.lose = function () {
  alert('You lose!');
};
D3UI.prototype.win = function () {
  alert('You win!');
};
function MineSweeper(width, height, mines, UI) {
  this.data = [];
  this.mask = [];
  this.mines = mines;
  this.width = width;
  this.height = height;
  this.ui = new UI(this);
  this.init();
}
MineSweeper.prototype.print = function () {
  var content = '';
  for (var i=0; i<this.width; i++) {
    for (var j=0; j<this.height; j++) {
      var s = i + j * this.width;
      if (this.mask[s]) {
        if (this.data[s] !== null) {
          content += this.data[s];
        } else {
          content += ' ';
        }
      } else {
        content += '*';
      }
    }
    content += '\n';
  }
  console.log(content);
};
MineSweeper.prototype.raw = function () {
  var content = '';
  for (var i=0; i<this.width; i++) {
    for (var j=0; j<this.height; j++) {
      var s = i + j * this.width;
      if (this.data[s] !== null) {
        content += this.data[s];
      } else {
        content += ' ';
      }
    }
    content += '\n';
  }
  console.log(content);
};
MineSweeper.prototype.init = function (mimes) {
  var width = this.width,
      height = this.height,
      mines = this.mines;
  // fill the matrix and the mask.
  for (var x=0; x<width; x++) {
    for (var y=0; y<height; y++) {
      this.data.push(null);
      this.mask.push(false);
    }
  }
  // fill mines.
  for (var i=0; i<mines; i++) {
    var x = parseInt(Math.random() * width);
    var y = parseInt(Math.random() * height);
    this.data[x + y * width] = 0;
  }
  // expose the numbers of mines.
  var mc = function (x, y) {
    var i = this.index(x, y);
    if (i > -1) {
      return this.data[i] === 0 ? 1 : 0;
    }
    return 0;
  }.bind(this);
  for (var x=0; x<width; x++) {
    for (var y=0; y<height; y++) {
      var s = x + y * width;
      if (this.data[s] === null) {
        var m = mc(x - 1, y - 1) + mc(x - 1, y)     + mc(x - 1, y + 1) +
                mc(x, y + 1)     + mc(x + 1, y + 1) + mc(x + 1, y) +
                mc(x + 1, y - 1) + mc(x, y - 1);
        if (m > 0) {
          this.data[s] = m;
        }
      }
    }
  }
  // init gui.
  if (this.ui) {
    this.ui.init();
  }
};
MineSweeper.prototype.update = function () {
  var data = this.data;
  if (this.mask.reduce(function (c, d, i) { return c && (d || data[i] === 0); })) {
    this.win();
  }
  if (this.ui) {
    this.ui.update();
  }
};
MineSweeper.prototype.lose = function () {
  if (this.ui) {
    this.ui.lose();
  }
  console.log('lose');
};
MineSweeper.prototype.win = function () {
  if (this.ui) {
    this.ui.win();
  }
  console.log('win');
};
MineSweeper.prototype.exposeCorner = function (x, y, d) {
  var i = this.index(x, y);
  if (d && this.data[i] > 0) {
    this.mask[i] = true;
  }
};
MineSweeper.prototype.expose = function (x, y, d) {
  var i = this.index(x, y);
  if (i > -1) {
    if (!this.mask[i] && this.data[i] === null) {
      this.mask[i] = true;
      this.exposeCorner(x - 1, y - 1, !this.data[i]);
      this.expose(x - 1, y, !this.data[i]);
      this.exposeCorner(x - 1, y + 1, !this.data[i]);
      this.expose(x, y + 1, !this.data[i]);
      this.exposeCorner(x + 1, y + 1, !this.data[i]);
      this.expose(x + 1, y, !this.data[i]);
      this.exposeCorner(x + 1, y - 1, !this.data[i]);
      this.expose(x, y - 1, !this.data[i]);
    } else if (d) {
      this.mask[i] = true;
    }
  }
};
MineSweeper.prototype.index = function (x, y) {
  if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
    return x + y * this.width;
  }
  return -1;
};
MineSweeper.prototype.next = function (x, y) {
  var i = this.index(x, y);
  if (i > -1) {
    if (this.data[i] === null || this.data[i] > 0) {
      this.mask[i] = true;

      this.exposeCorner(x - 1, y - 1, !this.data[i]);
      this.expose(x - 1, y, !this.data[i]);
      this.exposeCorner(x - 1, y + 1, !this.data[i]);
      this.expose(x, y + 1, !this.data[i]);
      this.exposeCorner(x + 1, y + 1, !this.data[i]);
      this.expose(x + 1, y, !this.data[i]);
      this.exposeCorner(x + 1, y - 1, !this.data[i]);
      this.expose(x, y - 1, !this.data[i]);

      this.update();
    } else {
      this.lose();
    }
  }
};
d3.select('#play').on('click', function () {
  var ms = new MineSweeper(10, 10, 10, D3UI);
  ms.lose = function () {
    d3.select('.settings .message').html('你输了！<br/>You lose!');
    d3.select('.settings').style('display', 'block');
  };
  ms.win  = function () {
    d3.select('.settings .message').html('你赢了！<br/>You win!');
    d3.select('.settings').style('display', 'block');
  };
  d3.select('.settings').style('display', 'none');
});
