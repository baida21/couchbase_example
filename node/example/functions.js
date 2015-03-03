//** p97 첫번째 
var arr = [ 'a', 'b', 'c']; //배열형으로 선언한다.
arr.push('d'); //배열의 마지막에 'd'를 삽입한다.
console.log(arr); //콘솔로 출력하면 ['a', 'b', 'c', 'd']가 출력된다.
console.log(arr.pop()); //마지막 배열 항목을 삭제한다.
console.log(arr); //콘솔로 출력하면 ['a', 'b', 'c']가 출력된다.

//** p97 두번
var arr = [ 'a', 'b', 'c']; //배열형으로 선언한다.
arr.unshift('d'); //첫 번째 항목에 'd'를 삽입한다.
console.log(arr); //콘솔로 출력하면 ['d', 'b', 'c', 'd']가 출력된다.
console.log(arr.shift()); //첫 번째 항목을 삭제한다.
console.log(arr); //콘솔로 출력하면 ['a', 'b', 'c']가 출력된다.

//** p97 세번째 
var arr = {id: 123, name : "홍길동"}; //id란 키로 123이란 값을, name이란
if(arr.id == 123) console.log("이름 : " + arr.id); // 이름 : 홍길동이 출력된다.


//** p99 첫번째 
var arr1 = ["1", "2", "3", "2"]; //배열
console.log(arr1.indexOf(2)); //-1을 리턴한다.
console.log(arr1.indexOf("2")); // 1을 리턴한다.
console.log(arr1.lastIndexOf("2")); //3을 리턴한다.
var arr2 = ['a', 'b', 'c'];
console.log( arr1.concat(['4'], arr2) );
//출력 : ["1", "2", "3", "2", "4", "a", "b", "c"];
console.log( arr1.join('! ') );
//출력 : "1! 2! 3! 2! "
console.log( arr1.slice(1, 3) );
//출력 : ["2", "3", "2"];
console.log( arr1.reverse() );
//출력 : ["2", "3", "2", "1"];


//** p99 두번째  
var keys = Object.keys({ a: 'u1', b: 'u2'});
console.log(keys, keys.length);
//출력 : ["a", "b"] 2
var members = { '홍길동': { a: '1', b: '2' }, '박철수': { a: '3' }};
var users = Object.keys(members);
  users.forEach(function(user) {
  var items = Object.keys(members [user]);
  items.forEach(function(item) {
    var value = members [user][item];
    console.log(user +': '+item+' = '+value);
  });
});
//출력
//  “홍길동:a = 1”
//  “홍길동:b = 2”
//  “박철수:a = 3”
  
  
//**p100 첫번째 
  var arr = [
{ order: 'first ' },
{ order: 'zero' },
{ order: 'second'}
];
arr = arr.sort(function (a, b) {
  return a.order.localeCompare(b.order);
});
console.log( arr );
//출력
//[{ order: ‘first ‘ },{ order: ‘second’}, { order: ‘zero’ }]


//**p101 첫번째 
var arr = {a: 'first ', b: 'zero',  c: 'second'};

console.log( !arr.a ); //false
console.log( !arr.d ); //true
console.log( 'a' in arr); //true
console.log(arr.hasOwnProperty('a') ); //true
console.log(arr.hasOwnProperty('d') ); //false


//**p101 두번째
var obj = JSON.parse('{"key": "id1", "data": [ 1, 2, 3 ] }'); 
console.log(obj.data);
//출력 : [ 1, 2, 3]
var obj = { key: 'id1', data: [ 1, 2, 3 ] }; 
console.log(JSON.stringify(obj));
//출력 : {“key”: “id1”, “data”: [ 1, 2, 3 ] }






