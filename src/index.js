import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(squareIndex) {
    return (
      <Square
        key={squareIndex}
        value={this.props.squareValues[squareIndex]}
        onClick={() => this.props.onClick(squareIndex)}
      />
    );
  }

  render() {
    const rows = [];

    for (let i = 0; i < 3; i++) {
      const squares = [];
      for (let j = 0; j < 3; j++) {
        squares.push(this.renderSquare(3 * i + j));
      }
      rows.push(
        <div className="board-row" key={i}>
          {squares}
        </div>
      );
    }

    return <div>{rows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moveHistory: [
        {
          squareValues: Array(9).fill(null),
          column: null,
          row: null,
        },
      ],
      xIsNext: true,
      currentStep: 0,
    };
  }

  handleClick(squareIndex) {
    const moveHistory = this.state.moveHistory.slice(
      0,
      this.state.currentStep + 1
    );
    const currentMove = moveHistory[moveHistory.length - 1];
    const squareValues = currentMove.squareValues.slice();

    if (calculateWinner(squareValues) || squareValues[squareIndex]) {
      return;
    }

    squareValues[squareIndex] = this.state.xIsNext ? "X" : "O";

    const newMove = {
      squareValues: squareValues,
      row: calcRowIndex(squareIndex),
      column: calcColIndex(squareIndex),
    };

    this.setState({
      moveHistory: moveHistory.concat([newMove]),
      xIsNext: !this.state.xIsNext,
      currentStep: moveHistory.length,
    });
  }

  jumpTo(step) {
    this.setState({
      currentStep: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const moveHistory = this.state.moveHistory;

    const moves = moveHistory.map((move, step) => {
      const desc = move.column
        ? `Go to move #${step} (row: ${move.row}, col: ${move.column})`
        : "Go to game start";

      const isSelected = step === this.state.currentStep;

      return (
        <li key={step}>
          <button
            className={isSelected ? "is-selected" : null}
            onClick={() => this.jumpTo(step)}
          >
            {desc}
          </button>
        </li>
      );
    });

    const currentMove = moveHistory[this.state.currentStep];
    const winner = calculateWinner(currentMove.squareValues);
    const status = winner
      ? "Winner: " + winner
      : "Next player: " + (this.state.xIsNext ? "X" : "O");

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squareValues={currentMove.squareValues}
            onClick={(squareIndex) => this.handleClick(squareIndex)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calcRowIndex(squareIndex) {
  if (squareIndex >= 0 && squareIndex <= 2) {
    return 1;
  } else if (squareIndex >= 3 && squareIndex <= 5) {
    return 2;
  } else {
    return 3;
  }
}

function calcColIndex(squareIndex) {
  if ([0, 3, 6].includes(squareIndex)) {
    return 1;
  } else if ([1, 4, 7].includes(squareIndex)) {
    return 2;
  } else {
    return 3;
  }
}

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
      return squares[a];
    }
  }
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
