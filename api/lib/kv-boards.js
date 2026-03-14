const { kv } = require("@vercel/kv");

const BOARDS_PREFIX = "reborn_boards:";
const BOARD_PREFIX = "reborn_board:";
const BOARD_COUNTER = "reborn_board_counter";

function userBoardsKey(userId) {
  return BOARDS_PREFIX + userId;
}

async function getBoardIds(userId, isAdmin) {
  if (isAdmin) {
    const users = await require("./kv-users").listUsers();
    const allIds = new Set();
    for (const u of users) {
      const ids = (await kv.get(userBoardsKey(u.id))) || [];
      ids.forEach((id) => allIds.add(id));
    }
    return [...allIds];
  }
  return (await kv.get(userBoardsKey(userId))) || [];
}

async function getBoard(boardId) {
  const raw = await kv.get(BOARD_PREFIX + boardId);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function createBoard(userId, name, data) {
  const counter = ((await kv.get(BOARD_COUNTER)) || 0) + 1;
  await kv.set(BOARD_COUNTER, counter);
  const boardId = "b_" + counter;
  const board = {
    id: boardId,
    ownerId: userId,
    name: name || "Novo Board",
    ...data,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  await kv.set(BOARD_PREFIX + boardId, JSON.stringify(board));
  const ids = (await kv.get(userBoardsKey(userId))) || [];
  ids.push(boardId);
  await kv.set(userBoardsKey(userId), ids);
  return board;
}

async function updateBoard(boardId, updates) {
  const board = await getBoard(boardId);
  if (!board) return null;
  Object.assign(board, updates);
  board.lastUpdated = new Date().toISOString();
  await kv.set(BOARD_PREFIX + boardId, JSON.stringify(board));
  return board;
}

async function deleteBoard(boardId, userId, isAdmin) {
  const board = await getBoard(boardId);
  if (!board) return false;
  if (board.ownerId !== userId && !isAdmin) return false;
  await kv.del(BOARD_PREFIX + boardId);
  const ids = (await kv.get(userBoardsKey(board.ownerId))) || [];
  const filtered = ids.filter((id) => id !== boardId);
  await kv.set(userBoardsKey(board.ownerId), filtered);
  return true;
}

async function userCanAccessBoard(userId, isAdmin, boardId) {
  const board = await getBoard(boardId);
  if (!board) return false;
  if (board.ownerId === userId || isAdmin) return true;
  return false;
}

module.exports = {
  getBoardIds,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  userCanAccessBoard,
};
