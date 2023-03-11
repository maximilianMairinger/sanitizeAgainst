import saniObj from "../../app/src/saniObj"
//const testElem = document.querySelector("#test")

console.log(saniObj({req: {name: false}})({req: {name: null}}))
