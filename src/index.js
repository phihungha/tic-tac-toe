import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Square(props) {
  return (
    <button className={`square ${props.won ? "square-won" : null}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Status(props) {
  const currentMove = props.currentMove;
  const winSquareIndexes = props.winSquareIndexes;

  let winner = winSquareIndexes ? currentMove.squareValues[winSquareIndexes[0]] : null;

  if (!winner && !currentMove.squareValues.includes(null)) {
    winner = "None (A draw!)";
  }

  const status = winner ? "Winner: " + winner : "Next player: " + (props.xIsNext ? "X" : "O");

  return <div>{status}</div>;
}

function MoveHistoryItem(props) {
  const move = props.move;
  const step = props.step;

  const description = move.column
    ? `Go to move #${step} (row: ${move.row}, col: ${move.column})`
    : "Go to game start";

  return (
    <li key={step}>
      <button
        className={props.isSelected ? "is-selected" : null}
        onClick={() => props.onClick(step)}
      >
        {description}
      </button>
    </li>
  );
}

class MoveHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moveHistoryDescSorted: false,
    };
  }

  toggleMoveHistorySortMode() {
    this.setState({
      moveHistoryDescSorted: !this.state.moveHistoryDescSorted,
    });
  }

  render() {
    const items = this.props.moveHistory.map((move, step) => {
      const isSelected = step === this.props.selectedStep;
      return (
        <MoveHistoryItem
          key={step}
          move={move}
          step={step}
          isSelected={isSelected}
          onClick={this.props.onSelect}
        />
      );
    });

    if (this.state.moveHistoryDescSorted) {
      items.reverse();
    }

    return (
      <div>
        <button onClick={() => this.toggleMoveHistorySortMode()}>
          {this.state.moveHistoryDescSorted ? "Descending" : "Ascending"}
        </button>
        <ol>{items}</ol>;
      </div>
    );
  }
}

class Board extends React.Component {
  renderSquare(squareIndex, won) {
    return (
      <Square
        key={squareIndex}
        won={won}
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
        const squareIndex = 3 * i + j;
        const won = this.props.winSquareIndexes?.includes(squareIndex) ? true : false;
        squares.push(this.renderSquare(squareIndex, won));
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
    const moveHistory = this.state.moveHistory.slice(0, this.state.currentStep + 1);
    const currentMove = moveHistory[moveHistory.length - 1];
    const squareValues = currentMove.squareValues.slice();

    if (calcWinSquareIndexes(squareValues) || squareValues[squareIndex]) {
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
    const currentMove = moveHistory[this.state.currentStep];
    const winSquareIndexes = calcWinSquareIndexes(currentMove.squareValues);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squareValues={currentMove.squareValues}
            winSquareIndexes={winSquareIndexes}
            onClick={(squareIndex) => this.handleClick(squareIndex)}
          />
        </div>
        <div className="game-info">
          <Status
            currentMove={currentMove}
            winSquareIndexes={winSquareIndexes}
            xIsNext={this.state.xIsNext}
          />
          <MoveHistory
            moveHistory={moveHistory}
            selectedStep={this.state.currentStep}
            onSelect={(step) => this.jumpTo(step)}
          />
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

function calcWinSquareIndexes(square_values) {
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
    if (
      square_values[a] &&
      square_values[a] === square_values[b] &&
      square_values[a] === square_values[c]
    ) {
      return lines[i];
    }
  }
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
