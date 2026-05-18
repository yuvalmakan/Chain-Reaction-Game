let table = document.querySelector("#table");
let counter = 0;
let rcount = document.querySelector("#rcount");
let bcount = document.querySelector("#bcount");
let gcount = document.querySelector("#gcount");
let ocount = document.querySelector("#ocount");

let numCol = prompt("How many player do you want between 2 and 4","2");
while (+numCol!=2 && +numCol!=3 && +numCol!=4){
    numCol = prompt("I'm sorry, but the number can only be 2 or 3 or 4","2");
}

let colList = ["red","blue"]
if (numCol==3 || numCol==4)
    colList.push("green")
if (numCol==4)
    colList.push("orange")

let count = {"red":rcount,"blue":bcount,"green":gcount,"orange":ocount};
let playing = true;

for (let i=0; i<72; i++){
    let box1 = document.createElement("button");
    box1.setAttribute("class","box");
    table.append(box1);
    box1.id = String(Math.trunc(i/6)) + String(i%6);
}

let boxList = document.querySelectorAll(".box");

// Doing the time stuff
let time = document.querySelector("#time");
let pause = document.querySelector("#pauseButton");


pause.addEventListener("click", () => {
    if (pause.innerText != "Resume"){
        pause.innerText = "Resume";
        playing = false;
    }
    else if (pause.innerText != "Pause"){
        pause.innerText = "Pause";
        playing = true;
    }
})

setInterval( () => {
    if (pause.innerText != "Resume" && playing){
        time.innerText--;
        let ptimer = document.querySelector("#ptime").innerText;
        let gtimer = document.querySelector("#time").innerText;
        document.querySelector("#ptime").innerText--;
        if (ptimer <= 0)
            win(colList[counter%numCol]);
        const maxCol = Object.keys(count).reduce((a,b) => count[a] > count[b]? a:b);
        if (gtimer <= 0)
            win(maxCol);
    }  
},1000)

// Game Mechanics

// defining capacity

let capacity = (box) => {
    let i = Math.trunc(box.id /10);
    let j = box.id %10; // The i & j are the i&j in aij format of matrix
    if (!(i==0 || j==0 || i==11 || j==5)){
        return 4;
    }
    else if ( (i==0&&j==0) || (i==0&&j==5) || (i==11&&j==0) || (i==11&&j==5)){
        return 2;
    }
    else{
        return 3;
    }
}


function colDel() {
    let initialNumCol = colList.length;
    if (counter < initialNumCol) {
        return 0;
    }

    for (let i = colList.length - 1; i >= 0; i--) {
        let col = colList[i];
        let num = 0;

        boxList.forEach((button) => {
            if (button.childNodes.length > 0 && button.childNodes[0].style.backgroundColor === col) {
                num++;
            }
        });

        if (num == 0) {
            colList.splice(i, 1);
            numCol--;
            
            if (i <= counter % (numCol + 1)) {
                counter--;
            }
        }
    }
}

// This makes so that when we press the button, either of 3 things will happen: 
// a) If one of the first 2 turns then fill to capacity-1
// b) if subsequent turns then  add 1 if capacity not reached with adding 1
// c) if capacity-1 already then make this box have 0 elements and recurse pressed fn. for adjacent boxes
// From turn 3 onwards make sure they can only click their own boxes
// Starting with red

function pressed(box){
    let divList = box.childNodes;
    
    let cap = capacity(box);
    let colour = colList[counter%numCol];

    if (!playing)
        return 0;

    if ( counter>=colList.length && divList.length == 0)
        return 0;

    if (divList.length){
        if (colour != divList[0].style.backgroundColor)  
            return 0;
    }

    let move_tracker = document.querySelector("#move_tracker");
    let move = document.createElement("div");
    move.setAttribute("class","moves");
    move.innerText = "The "+colour + " Player clicked on column: "+(box.id%10+1)+" & row: "+(Math.trunc(box.id /10)+1)
    move_tracker.append(move);                         

    let added = (box,colour,cap) => {
        let i = +Math.trunc(box.id /10);
        let j = +(box.id %10);
        let divList1 = box.childNodes;
        if(cap > divList1.length + 1){
            
            let circle = document.createElement("div");
            circle.setAttribute("class","circle");
            
            box.append(circle);
            divList1.forEach( (circle) => { circle.style.backgroundColor = colour});
            console.dir(divList1);
            
        }
        else{
            setTimeout( () => {
            box.innerHTML = '';
            let u = String(i)+String(j-1);
            let boxU = document.querySelector("#"+CSS.escape(u));
            if (boxU)
                added(boxU,colour,cap);
            console.log(boxU);
            let d = String(i)+String(j+1);
            let boxD = document.querySelector("#"+CSS.escape(d));
            if (boxD)
                added(boxD,colour,cap);
            let r = String(i+1)+String(j);
            let boxR = document.querySelector("#"+CSS.escape(r));
            if (boxR)
                added(boxR,colour,cap);
            let l = String(i-1)+String(j);
            let boxL = document.querySelector("#"+CSS.escape(l));
            if (boxL)
                added(boxL,colour,cap);
            },100)
        }
        new Audio("pop.mp3").play();
        count[colour].innerText++;
        // colDel();
    }

    if ( counter < colList.length){
        for (let i=0; i<cap-1; i++){
            let circle = document.createElement("div");
            circle.setAttribute("class","circle");
            circle.style.backgroundColor = colour;
            box.append(circle);
            count[colour].innerText++;
        }
        new Audio("pop.mp3").play();
    }    

    else{
        added(box,colour,cap);
    }

    counter++;
    document.querySelector("#turn").innerText = colList[counter%numCol];
    document.querySelector("#ptime").innerText = 15;     
}

// The actual pressing

boxList.forEach( (box) => {
    box.addEventListener('click',() => pressed(box));
})

setInterval( () => {
    if (document.querySelector("#win").innerText != "player has won"){
        colList.forEach( (col) => conquered(col));     
    }
    colDel();
},100)

// Win Conditions:
// a) game timer runs out, the player with most number of points wins
// b) player timer runs out. Other player wins
// c) whole board conquered by that player, he wins
// Also make sure that after wnining no player can add their blobs

function win(col){
    document.querySelector("#turn").innerText = col;
    document.querySelector("#win").innerText = "player has won";
    playing = false;
}

function conquered(col){
    let i = 0;
    if ( counter < colList.length)
        return 0;
    for (;i<72;i++){
        if (boxList[i].childNodes.length==0)
            continue;
        if (boxList[i].childNodes[0].style.backgroundColor!=col && boxList[i].childNodes[0].style.backgroundColor!="")
            break;
    }
    if (i==72)
        win(col);
}