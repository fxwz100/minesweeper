function endAll(transition, callback) {
  // taken from http://stackoverflow.com/questions/14024447/d3-js-transition-end-event
  var n;
  if (transition.empty()) {
    callback();
  }
  else {
    n = transition.size();
    transition.each("end", function () {
      n--;
      if (n === 0) {
        callback();
      }
    });
  }
}

function D3UI(game) {
  this.game = game;
  this.box = 20;
  this.grid = d3.select('#game-canvas');
  this.grid.selectAll('rect').remove();
  this.grid.selectAll('text').remove();
  this.ready = false;
}
D3UI.prototype.init = function () {
  var width = this.game.width,
      height = this.game.height,
      box = this.box,
      game = this.game,
      grid = this.grid,
      self = this;

  grid.selectAll('div').data(this.game.mask)
  .enter().append('rect').attr('x', function (d, i) {
    return parseInt(i % width) * box + 0.5 + 'px';
  }).attr('y', function (d, i) {
    return parseInt(i / width) * box + 0.5 + 'px';
  }).attr('fill', 'yellow')
  .attr('width', box - 1 + 'px').attr('height', box - 1 + 'px')
  .on('click', function (d, i) {
    var x = parseInt(i % width), y = parseInt(i / width);
    game.next(x, y);
  })
  .attr('opacity', '0')
  .transition().duration(750)
  .delay(function(d, i) { return 100 + Math.random() * 500; })
  .attr('opacity', '1');

  grid.selectAll('text').data(this.game.mask)
  .enter().append('text').attr('x', function (d, i) {
    return parseInt(i % width) * box + 10 + 'px';
  }).attr('y', function (d, i) {
    return parseInt(i / width) * box + 15 + 'px';
  })
  .attr('fill', 'yellow')
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
    .transition().duration(500)
    .attr('fill', function (d) {
      if (d) {
        return 'white';
      } else {
        return 'yellow';
      }
    });
    grid.selectAll('text').data(this.game.mask)
    .transition().duration(500)
    .attr('fill', function (d) {
      return d ? 'black' : 'yellow';
    })
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
D3UI.prototype.lose = function (callback) {
  this.grid.selectAll('rect').data(this.game.data).filter(function (d) {
    return d === 0;
  })
  .transition().duration(1000).ease('bounce-out')
  .attr('fill', 'red').call(endAll, function () {
    if (callback) {
      callback()
    } else {
      alert('You lose!');
    }
  });
};
D3UI.prototype.win = function (callback) {
  this.grid.selectAll('rect').data(this.game.data).filter(function (d) {
    return d === 0;
  })
  .transition().duration(1000).ease('bounce-out')
  .attr('fill', 'red').call(endAll, function () {
    if (callback) {
      callback()
    } else {
      alert('You win!');
    }
  });
  console.log('why')
};

function MineSweeper(width, height, mines, UI) {
  this.data = [];
  this.mask = [];
  this.mines = mines;
  this.width = width;
  this.height = height;
  this.ui = new UI(this);
  this.event = {};
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
MineSweeper.prototype.on = function (event, fn) {
  this.event[event] = fn;
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
  if (this.ui) {
    this.ui.update();
  }
  if (this.mask.reduce(function (c, d, i) { return c && (d || data[i] === 0); })) {
    this.win();
  }
};
MineSweeper.prototype.lose = function () {
  if (this.ui) {
    this.ui.lose(this.event['lose']);
  }
  console.log('lose');
};
MineSweeper.prototype.win = function () {
  if (this.ui) {
    this.ui.win(this.event['win']);
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
  ms.on('lose', function () {
    d3.select('.settings .message').html('你输了！<br/>You lose!');
    d3.select('.settings')
    .style('opacity', '0').style('display', 'block')
    .transition().duration(500).delay(1000)
    .style('opacity', '1');
  });
  ms.on('win', function () {
    d3.select('.settings .message').html('你赢了！<br/>You win!');
    d3.select('.settings')
    .style('opacity', '0').style('display', 'block')
    .transition().duration(500).delay(1000)
    .style('opacity', '1');
  });
  d3.select('.settings')
  .style('opacity', '1')
  .transition().duration(500)
  .style('opacity', '0')
  .style('display', 'none');
  window.ms = ms;
});
