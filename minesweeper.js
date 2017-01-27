$(function(){
  
  preloader();
  
  initGame(8, 8);
  
  $("#easy").click(function(){
    initGame(8, 8);
  });
  $("#difficult").click(function(){
    initGame(16, 16);
  });
  $("#expert").click(function(){
    initGame(16, 30);
  });
  
});

function preloader(){
  // set image list
  images = new Array();
  images[0]="img/smiley.png"
  images[1]="img/smiley_blink.png"
  images[2]="img/smiley_left_wink.png"
  images[3]="img/smiley_right_wink.png"

  var i = 0;
  imageObj = new Image();
  // start preloading
  for(i=0; i<=3; i++) 
  {
    imageObj.src=images[i];
  }
}

function animateSmiley(){
  switch (getRandomInt(1, 7)) {
    case 1:
      winkLeft();
      break;
    case 2:
      winkRight();
      break;
    default: 
      blink();
      break;
  };
  setTimeout(function(){
    animateSmiley();
  }, getRandomInt(1, 5)*1000);
};

function winkLeft(){
  document.getElementById("smiley").src = "img/smiley_left_wink.png";
  var timeoutID = setTimeout(function(){
    document.getElementById("smiley").src = "img/smiley.png";
    clearTimeout(timeoutID);
  }, 100);
};

function winkRight(){
  document.getElementById("smiley").src = "img/smiley_right_wink.png";
  var timeoutID = setTimeout(function(){
    document.getElementById("smiley").src = "img/smiley.png";
    clearTimeout(timeoutID);
  }, 100);
};

function blink(){
  document.getElementById("smiley").src = "img/smiley_blink.png";
  var timeoutID = setTimeout(function(){
    document.getElementById("smiley").src = "img/smiley.png";
    clearTimeout(timeoutID);
  }, 100);
};


function initGame(gridHeight, gridWidth){
  $( "tr" ).remove(); // clear pre-existing grid if any
  
  resetTimer();
  
  setTimeout(function(){animateSmiley()}, 2000); // animate smiley 
  
  var minesNumber = Math.round(gridHeight*gridWidth/6.4);
  var minesPosition = generateMinesPosition(gridHeight, gridWidth, minesNumber);
  var refGrid = buildRefGrid(gridHeight, gridWidth, minesPosition);

  buildDisplayGrid(gridHeight, gridWidth);
  
  listen(gridHeight, gridWidth, minesNumber, refGrid, minesPosition);
};

function resetTimer(){
  var newTimerId = window.setInterval("function(){}"); // reset timer if any
  for (var i = 0 ; i <= newTimerId; i++) {
    window.clearInterval(i); 
  }
};

function listen(gridHeight, gridWidth, minesNumber, refGrid, minesPosition){
  
  var flaggedMines = 0;
  
  $("#flagged-mines").html(flaggedMines.toString());
  $("#timer").html("0")
  $("td").on("contextmenu", function(event) {event.preventDefault();}); // avoid pop up menu on right-click
  
  var firstClick = true;
  $("td").mousedown(function(){
    if (firstClick){
      startTimer();
      firstClick = false;
    }
  });

  $("td").mousedown(function(event){
    switch (event.which){
      case 1:
        if ($(this).hasClass("unopened") && !( $(this).hasClass("flagged") || $(this).hasClass("question") )){
          checkCell($(this), gridHeight, gridWidth, minesNumber, refGrid, Number($(this).parent().attr('id')), Number($(this).attr('id')));
        };
        break;
      case 3:
        if ($(this).hasClass("unopened") && !( $(this).hasClass("flagged") || $(this).hasClass("question") )){
          $(this).addClass("flagged");
          flaggedMines = $(".flagged").length;
        }
        else if ($(this).hasClass("unopened") && $(this).hasClass("flagged")){
          $(this).removeClass("flagged").addClass("question");
          flaggedMines = $(".flagged").length;
        }
        else if ($(this).hasClass("unopened") && $(this).hasClass("question")){
          $(this).removeClass("question");
        };
        $("#flagged-mines").html(flaggedMines);
        break;
    };
  });
};

function startTimer(){    
  if (t == undefined){
    var count = 0;
    var t = setInterval(function(){
      count++;
      $("#timer").html(count);
    }, 1000);
    return t;
  }
};

function checkCell(domElem, gridHeight, gridWidth, minesNumber, refGrid, rowNum, colNum){
  var cellContent = refGrid[rowNum][colNum];
  if (cellContent === "M"){
    revealGrid(refGrid);
    window.alert("Lost!!! You're probably dead or seriously injured at the present time...");
    initGame(gridHeight, gridWidth);
  }
  else if (cellContent>0 && cellContent<9){
    domElem.removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + cellContent.toString());
    checkVictory(gridHeight, gridWidth, minesNumber, refGrid);
  }
  else if (cellContent === 0){
    propagate(gridHeight, gridWidth, refGrid, rowNum, colNum);
    checkVictory(gridHeight, gridWidth, minesNumber, refGrid);
  };
};

function checkVictory(gridHeight, gridWidth, minesNumber, refGrid){
  if ($(".opened").length === gridWidth * gridHeight - minesNumber){
    revealGrid(refGrid);
    window.alert("Well done!!! You've found all the mines...");
    initGame(gridHeight, gridWidth);
  };
};

function revealGrid(refGrid){
  $(".unopened").each(function(index){
    $(this).removeClass("unopened").addClass("opened");
    if (refGrid[Number($(this).parent().attr('id'))][Number($(this).attr('id'))]>0 && refGrid[Number($(this).parent().attr('id'))][Number($(this).attr('id'))]<9){
      $(this).addClass("mine-neighbour-" + refGrid[Number($(this).parent().attr('id'))][Number($(this).attr('id'))].toString());
    }
    else if (refGrid[Number($(this).parent().attr('id'))][Number($(this).attr('id'))] === "M"){
      $(this).addClass("mine");
    };
  });
};

function propagate(gridHeight, gridWidth, refGrid, rowNum, colNum){
  
  if (!($("tr").eq(rowNum).children("td").eq(colNum).hasClass("unopened"))){return;}
  
  var j = colNum;
  
  while (j < gridWidth && refGrid[rowNum][j] === 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("unopened")){
    $("tr").eq(rowNum).children("td").eq(j).removeClass("unopened").addClass("opened");
    if (refGrid[rowNum][j]>0 && refGrid[rowNum][j]<9){
      $("tr").eq(rowNum).children("td").eq(j).addClass("mine-neighbour-" + refGrid[rowNum][j].toString());
    }
    j++;
  }
  if (j < gridWidth){
    $("tr").eq(rowNum).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum][j].toString());
  }

  j = colNum - 1;
  while (j >= 0 && refGrid[rowNum][j] === 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("unopened")){
    $("tr").eq(rowNum).children("td").eq(j).removeClass("unopened").addClass("opened");
    if (refGrid[rowNum][j]>0 && refGrid[rowNum][j]<9){
      $("tr").eq(rowNum).children("td").eq(j).addClass("mine-neighbour-" + refGrid[rowNum][j].toString());
    }
    j--;
  }
  if (j >= 0){
    $("tr").eq(rowNum).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum][j].toString());
  }
  
  //test for new scanlines above
  j = colNum;
  while (j < gridWidth && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
    if (rowNum > 0 && refGrid[rowNum - 1][j] === 0 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
      propagate(gridHeight, gridWidth, refGrid, rowNum - 1, j);
    }
    else if (rowNum > 0 && refGrid[rowNum - 1][j] > 0 && refGrid[rowNum - 1][j] < 9 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
      $("tr").eq(rowNum - 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum - 1][j].toString());
    }
    j++;
  }
  j = colNum - 1;
  while( j >= 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
    if (rowNum > 0 && refGrid[rowNum - 1][j] === 0 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
      propagate(gridHeight, gridWidth, refGrid, rowNum - 1, j);
    }
    else if (rowNum > 0 && refGrid[rowNum - 1][j] > 0 && refGrid[rowNum - 1][j] < 9 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
      $("tr").eq(rowNum - 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum - 1][j].toString());
    }
    j--;
  }
  
  //test for new scanlines below
  j = colNum;
  while (j < gridWidth && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
    if (rowNum < gridHeight-1 && refGrid[rowNum + 1][j] === 0 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
      propagate(gridHeight, gridWidth, refGrid, rowNum + 1, j);
    }
    else if (rowNum < gridHeight-1 && refGrid[rowNum + 1][j] > 0 && refGrid[rowNum + 1][j] < 9 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
      $("tr").eq(rowNum + 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum + 1][j].toString());
    }
    j++;
  }
  j = colNum - 1;
  while (j >= 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
    if (rowNum < gridHeight-1 && refGrid[rowNum + 1][j] === 0 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
      propagate(gridHeight, gridWidth, refGrid, rowNum + 1, j);
    }
    else if (rowNum < gridHeight-1 && refGrid[rowNum + 1][j] > 0 && refGrid[rowNum + 1][j] < 9 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
      $("tr").eq(rowNum + 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum + 1][j].toString());
    }
    j--;
  }
  return;
};

function buildDisplayGrid(gridHeight, gridWidth){
  var colNum = 0;
  var rowNum = 0;
  for (var i=0; i<gridHeight; i++){
    $("table").append("<tr id=" + rowNum.toString() + "></tr>");
    rowNum++;
  };
  for (var i=0; i<gridWidth; i++){
    $("tr").append("<td class=\"unopened\" id=" + colNum.toString() +"></td>");
    colNum++;
  };
};

function buildRefGrid(gridHeight, gridWidth, minesPosition){
  var arr = initRefGrid(gridHeight, gridWidth);
  for (var i = 0; i < gridHeight; i++){
    for (var j = 0; j < gridWidth; j++){
      if (minesPosition.includes(i*gridHeight+j)){
        arr[i][j] = "M";
        if (i>0 && arr[i-1][j] !== "M"){
          arr[i-1][j]++;
        }
        if (j>0 && arr[i][j-1] !== "M"){
          arr[i][j-1]++;
        }
        if (i < gridHeight-1 && arr[i+1][j] !== "M"){
          arr[i+1][j]++;
        }
        if (j < gridWidth-1 && arr[i][j+1] !== "M"){
          arr[i][j+1]++;
        }
        if (i>0 && j<gridWidth-1 && arr[i-1][j+1] !== "M"){
          arr[i-1][j+1]++;
        }
        if (i<gridHeight-1 && j>0 && arr[i+1][j-1] !== "M"){
          arr[i+1][j-1]++;
        }
        if (i>0 && j>0 && arr[i-1][j-1] !== "M"){
          arr[i-1][j-1]++;
        }
        if (i<gridHeight-1 && j<gridWidth-1 && arr[i+1][j+1] !== "M"){
          arr[i+1][j+1]++;
        }
      }
    }
  }
  return arr;
};

function initRefGrid(gridHeight, gridWidth){
  var arr = new Array(gridHeight);
  for (var i=0; i<gridHeight; i++){
    arr[i] = new Array(gridWidth);
    for (var j=0; j<gridWidth; j++){
      arr[i][j] = 0;
    }
  }
  return arr
};

function generateMinesPosition(gridHeight, gridWidth, minesNumber){
  var numList = generateNumSeq(gridHeight * gridWidth);
  var minesPosition = new Array(minesNumber);
  for (var i = 0; i < minesNumber; i++){
    var index = getRandomInt(1, gridHeight * gridWidth - i);
    minesPosition[i] =  numList[index];
    numList.splice(index, 1);
  }
  return minesPosition;
};

function generateNumSeq(listSize){
  var list = new Array(listSize);
  for (var i = 0; i < listSize; i++){
    list[i] = i;
  }
  return list
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
