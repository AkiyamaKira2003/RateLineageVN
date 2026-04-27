const SERVER_ORDER = [
  { serverCode: "S1", order: 1, serverNameKr: "데포로쥬", opt1: "24487" },
  { serverCode: "S2", order: 2, serverNameKr: "켄라우헬", opt1: "24488" },
  { serverCode: "S3", order: 3, serverNameKr: "질리언", opt1: "24489" },
  { serverCode: "S4", order: 4, serverNameKr: "이실로테", opt1: "24490" },
  { serverCode: "S5", order: 5, serverNameKr: "조우", opt1: "24491" },
  { serverCode: "S6", order: 6, serverNameKr: "하딘", opt1: "24492" },
  { serverCode: "S7", order: 7, serverNameKr: "케레니스", opt1: "24493" },
  { serverCode: "S8", order: 8, serverNameKr: "오웬", opt1: "24494" },
  { serverCode: "S9", order: 9, serverNameKr: "크리스터", opt1: "24495" },
  { serverCode: "S10", order: 10, serverNameKr: "아인하사드", opt1: "24496" },
  { serverCode: "S11", order: 11, serverNameKr: "아툰", opt1: "24527" },
  { serverCode: "S12", order: 12, serverNameKr: "가드리아", opt1: "24528" },
  { serverCode: "S13", order: 13, serverNameKr: "군터", opt1: "24529" },
  { serverCode: "S14", order: 14, serverNameKr: "아스테어", opt1: "24530" },
  { serverCode: "S15", order: 15, serverNameKr: "듀크데필", opt1: "24531" },
  { serverCode: "S16", order: 16, serverNameKr: "발센", opt1: "24575" },
  { serverCode: "S17", order: 17, serverNameKr: "어레인", opt1: "24576" },
  { serverCode: "S18", order: 18, serverNameKr: "캐스톨", opt1: "24577" },
  { serverCode: "S19", order: 19, serverNameKr: "세바스찬", opt1: "24578" },
  { serverCode: "S20", order: 20, serverNameKr: "데컨", opt1: "24579" },
  { serverCode: "S21", order: 21, serverNameKr: "파아그리오", opt1: "24609" },
  { serverCode: "S22", order: 22, serverNameKr: "에바", opt1: "24610" },
  { serverCode: "S23", order: 23, serverNameKr: "사이하", opt1: "24611" },
  { serverCode: "S24", order: 24, serverNameKr: "마프르", opt1: "24612" },
  { serverCode: "S25", order: 25, serverNameKr: "린델", opt1: "24613" },
  { serverCode: "S26", order: 26, serverNameKr: "하이네", opt1: "25273" },
  { serverCode: "S27", order: 27, serverNameKr: "로엔그린", opt1: "25274" },
  { serverCode: "S28", order: 28, serverNameKr: "발라카스", opt1: "26022" }
];

const SERVER_ALIAS = {
  세바스챤: "세바스찬"
};

const MODE_CONFIG = {
  slow: {
    key: "slow",
    sell: "sell",
    display: "2",
    orderby: "3",
    orderLabel: "낮은가격순"
  },
  fast: {
    key: "fast",
    sell: "buy",
    display: "2",
    orderby: "2",
    orderLabel: "높은가격순"
  }
};

function normalizeServerName(name) {
  return SERVER_ALIAS[name] || name;
}

function findServerByCode(serverCode) {
  return SERVER_ORDER.find((item) => item.serverCode === serverCode) || null;
}

module.exports = {
  MODE_CONFIG,
  SERVER_ALIAS,
  SERVER_ORDER,
  findServerByCode,
  normalizeServerName
};
