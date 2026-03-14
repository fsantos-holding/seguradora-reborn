const { kv } = require("@vercel/kv");

const BOARDS_PREFIX = "reborn_boards:";
const BOARD_PREFIX = "reborn_board:";
const BOARD_COUNTER = "reborn_board_counter";
const BOARD_REBORN_ID = "b_reborn";

function userBoardsKey(userId) {
  return BOARDS_PREFIX + userId;
}

async function getBoardIds(userId, isAdmin) {
  const ids = new Set();
  if (isAdmin) {
    const users = await require("./kv-users").listUsers();
    for (const u of users) {
      const userIds = (await kv.get(userBoardsKey(u.id))) || [];
      userIds.forEach((id) => ids.add(id));
    }
    const boardReborn = await getBoard(BOARD_REBORN_ID);
    if (boardReborn) ids.add(BOARD_REBORN_ID);
  } else {
    const userIds = (await kv.get(userBoardsKey(userId))) || [];
    userIds.forEach((id) => ids.add(id));
  }
  return [...ids];
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
  if (boardId === BOARD_REBORN_ID && !isAdmin) return false;
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
  if (boardId === BOARD_REBORN_ID && isAdmin) return true;
  return false;
}

async function ensureBoardReborn(adminId, getSeedData) {
  const existing = await getBoard(BOARD_REBORN_ID);
  // Preservar sempre os dados já gravados no Vercel KV (cards, config, mapaProducao).
  // Nunca sobrescrever com seed local — informações do último acesso são mantidas.
  if (existing) return existing;

  const seedData = getSeedData();
  const board = {
    id: BOARD_REBORN_ID,
    ownerId: adminId,
    name: "Board-Reborn",
    version: seedData.version || "2.0",
    cards: seedData.cards || [],
    config: seedData.config || { bucketOrder: [], collapsedColumns: [] },
    mapaProducao: seedData.mapaProducao || [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  await kv.set(BOARD_PREFIX + BOARD_REBORN_ID, JSON.stringify(board));
  const ids = (await kv.get(userBoardsKey(adminId))) || [];
  if (!ids.includes(BOARD_REBORN_ID)) {
    ids.push(BOARD_REBORN_ID);
    await kv.set(userBoardsKey(adminId), ids);
  }
  return board;
}

module.exports = {
  getBoardIds,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  userCanAccessBoard,
  ensureBoardReborn,
  BOARD_REBORN_ID,
};
