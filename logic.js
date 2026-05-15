let table = document.querySelector("#table");
let counter = 0;
let rcount = document.querySelector("#rcount");
let bcount = document.querySelector("#bcount");
let count = {"red":rcount,"blue":bcount};
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
    if (pause.innerText != "Resume")
        pause.innerText = "Resume";
    else if (pause.innerText != "Pause")
        pause.innerText = "Pause";
})

setInterval( () => {
    if (pause.innerText != "Resume" && playing){
        time.innerText--;
        let ptimer = document.querySelector("#ptime").innerText;
        let gtimer = document.querySelector("#time").innerText;
        document.querySelector("#ptime").innerText--;
        if (ptimer <= 0)
            win(counter%2==0? 'blue':'red');
        if (gtimer <= 0)
            win(count['blue'].innerText>count['red'].innerText? 'blue':'red');
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

// This makes so that when we press the button, either of 3 things will happen: 
// a) If one of the first 2 turns then fill to capacity-1
// b) if subsequent turns then  add 1 if capacity not reached with adding 1
// c) if capacity-1 already then make this box have 0 elements and recurse pressed fn. for adjacent boxes
// From turn 3 onwards make sure they can only click their own boxes
// Starting with red

function pressed(box){
    let divList = box.childNodes;
    
    let cap = capacity(box);
    let colour = counter%2==0? 'red':'blue';

    if (counter != 0 && counter != 1 && divList.length == 0)
        return 0;

    if (divList.length){
        if (colour != divList[0].style.backgroundColor)  
            return 0;
    }
                           

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
    }

    if (counter==0 || counter==1){
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
    document.querySelector("#turn").innerText = counter%2==0?"Blue":"Red";
    document.querySelector("#ptime").innerText = 15; 

    counter++;
}

// The actual pressing

boxList.forEach( (box) => {
    box.addEventListener('click',() => pressed(box));
})

setInterval( () => {
    if (document.querySelector("#win").innerText != "player has won"){
        conquered("red");
        conquered("blue");
    }
    
},100)

if (!playing){
    
}

// Win Conditions:
// a) game timer runs out, the player with most number of points wins
// b) player timer runs out. Other player wins
// c) whole board conquered by that player, he wins

function win(col){
    document.querySelector("#turn").innerText = col;
    document.querySelector("#win").innerText = "player has won";
    playing = false;
}

function conquered(col){
    let i = 0;
    if (counter==0 || counter==1)
        return 0;
    for (;i<72;i++){
        if (boxList[i].childNodes.length==0)
            continue;
        if (boxList[i].childNodes[0].style.backgroundColor!=col && boxList[i].childNodes[0].style.backgroundColor!="")
            break;
    }
    if (i==72)
        win(col);
    console.log(i);
}