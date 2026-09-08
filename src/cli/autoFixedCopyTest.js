const path = require('path');
const { autoFixedCopy } = require('../qa/autoFixedCopy');
const expected=['오늘의 식단','전체보기','교통','셔틀 탑승권 QR 조회','조회하기','다음 탑승 시간','콜밴팟','같이 콜밴 탈 사람을 찾아요','버스 시간표 조회','버스 노선 조회','시내버스 출발 시간','최단 경로 조회','주변 상점','KOIN 전용 이벤트 혜택받기','많이 찾는 상점 둘러보기'];
async function main() {
 const source=process.argv[2];
 if(!source) throw new Error('Usage: node src/cli/autoFixedCopyTest.js <image-path>');
 const result=await autoFixedCopy(path.resolve(source),expected);
 console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
