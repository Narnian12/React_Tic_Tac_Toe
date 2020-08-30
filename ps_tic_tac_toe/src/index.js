import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  console.log(props.winSquares);
  return props.winSquares && props.winSquares.includes(props.index) ? (
    <button className="win-square" onClick={props.onClick}>
      {props.value}
    </button>
  ) : (
    <button className="square" onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        index={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        winSquares={this.props.winSquares}
      />
    );
  }

  render() {
    let board = [];
    for (var i = 0; i < 3; i++) {
      let squares = [];
      for (var j = 0; j < 3; j++) {
        squares.push(this.renderSquare(j + i * 3));
      }
      // An interesting side-effect is that every element within an array needs to have a "key" value
      board.push(
        <div className="board-row" key={i}>
          {squares}
        </div>
      );
    }
    return <div>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          col: null,
          row: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      reversed: false,
    };
  }

  handleClick(i) {
    // If user goes back and adds a new move, erase all future moves
    const history = !this.state.reversed
      ? this.state.history.slice(0, this.state.stepNumber + 1)
      : this.state.history
          .reverse()
          .slice(0, this.state.stepNumber + 1)
          .reverse();

    const current = !this.state.reversed
      ? history[history.length - 1]
      : history[0];

    const squares = current.squares.slice();
    // Optimize by not re-rendering if someone already won or if user clicked on the particular Square already
    if (calculateWinner(squares) || squares[i]) return;
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      // Add on to history
      history: !this.state.reversed
        ? history.concat([
            {
              squares: squares,
              col: i % 3,
              row: Math.floor(i / 3),
              player: squares[i],
            },
          ])
        : [
            {
              squares: squares,
              col: i % 3,
              row: Math.floor(i / 3),
              player: squares[i],
            },
          ].concat(history),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpToHandler(step) {
    this.setState({
      stepNumber: !this.state.reversed
        ? step
        : this.state.history.length - 1 - step,
      xIsNext: !this.state.reversed
        ? step % 2 === 0
        : (this.state.history.length - 1 - step) % 2 === 0,
    });
  }

  // Reverses  the history array
  toggleHandler() {
    const reversedHistory = this.state.history
      .slice(0, this.state.history.length)
      .reverse();

    this.setState({
      history: reversedHistory,
      reversed: !this.state.reversed,
    });
  }

  getDescription(getStep, step, move) {
    return getStep
      ? "Go to move #" +
          move +
          " where " +
          step.player +
          " moved on (" +
          step.col +
          ", " +
          step.row +
          ")"
      : "Go to game start";
  }

  render() {
    const history = this.state.history;
    // Get the current based on where in history the user is
    const current = !this.state.reversed
      ? history[this.state.stepNumber]
      : history[this.state.history.length - 1 - this.state.stepNumber];

    const winner = calculateWinner(current.squares);

    // If the history array is reversed, count down instead of up
    let reversedMove = this.state.history.length;
    const moves = history.map((step, move) => {
      reversedMove--;
      const desc = !this.state.reversed
        ? this.getDescription(move, step, move)
        : this.getDescription(
            move !== this.state.history.length - 1,
            step,
            reversedMove
          );

      return (
        // In this case the move (step number as index) is sufficient because users cannot reorder moves
        <li key={move}>
          {(!this.state.reversed && move === this.state.stepNumber) ||
          (this.state.reversed && reversedMove === this.state.stepNumber) ? (
            <button
              style={{ fontWeight: "bold" }}
              onClick={() => this.jumpToHandler(move)}
            >
              {desc}
            </button>
          ) : (
            <button onClick={() => this.jumpToHandler(move)}>{desc}</button>
          )}
        </li>
      );
    });

    let status;
    if (winner) status = "Winner: " + winner.winner;
    else {
      status =
        this.state.history.length === 10
          ? "Draw!"
          : "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winSquares={winner ? winner.winSquares : null}
          />
        </div>
        <div className="game-info">
          <div>
            {status}
            <button
              onClick={() => this.toggleHandler()}
              style={{ marginLeft: "8px" }}
            >
              Toggle
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ==========================================

ReactDOM.render(<Game />, document.getElementById("root"));

// Helper function to determine winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winSquares: [a, b, c] };
    }
  }
  return null;
}
