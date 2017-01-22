// Good luck!


$(function(){
  var gridSize = 8;
  var minesNumber = Math.round(gridSize*gridSize/6.4);  
  initGame();
  
  function initGame(){
    
    var minesPosition = generateMinesPosition();
    var refGrid = buildRefGrid(minesPosition);
    
    buildDisplayGrid();
    
    listen(refGrid, minesPosition);
  };
  
  function listen(refGrid, minesPosition){
    
    var flaggedMines = 0;
    
    $("#flagged-mines").html(flaggedMines.toString());
    $("#timer").html("0")
    $("td").on("contextmenu", function(event) {event.preventDefault();}); // avoid pop up menu on right-click
    
    var firstClick = true;
    var timerID = null;
    $("td").mousedown(function(){
      if (firstClick){
        timerID = startTimer();
        firstClick = false;
      }
    });

    $("td").mousedown(function(event){
      switch (event.which){
        case 1:
          if ($(this).hasClass("unopened") && !( $(this).hasClass("flagged") || $(this).hasClass("question") )){
            checkCell($(this), refGrid, Number($(this).parent().attr('id')), Number($(this).attr('id')), timerID);
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
  
  function checkCell(domElem, refGrid, rowNum, colNum, timerID){
    var cellContent = refGrid[rowNum][colNum];
    if (cellContent === "M"){
      clearInterval(timerID);
      revealGrid(refGrid);
      window.alert("Lost!!! You're probably dead or seriously injured at the present time...");
      $( "tr" ).remove();
      initGame();
    }
    else if (cellContent>0 && cellContent<9){
      domElem.removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + cellContent.toString());
      checkVictory(refGrid, timerID);
    }
    else if (cellContent === 0){
      propagate(refGrid, rowNum, colNum);
      checkVictory(refGrid, timerID);
    };
  };
  
  function checkVictory(refGrid, timerID){
    if ($(".opened").length === gridSize*gridSize-minesNumber){
      clearInterval(timerID);
      revealGrid(refGrid);
      window.alert("Well done!!! You've found all the mines...");
      $("tr").remove();
      initGame();
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
  
  function propagate(refGrid, rowNum, colNum){
    
    
    if (!($("tr").eq(rowNum).children("td").eq(colNum).hasClass("unopened"))){return;}
    
    var width = gridSize-1;
    var j = colNum;
    
    while (j <= width && refGrid[rowNum][j] === 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("unopened")){
      $("tr").eq(rowNum).children("td").eq(j).removeClass("unopened").addClass("opened");
      if (refGrid[rowNum][j]>0 && refGrid[rowNum][j]<9){
        $("tr").eq(rowNum).children("td").eq(j).addClass("mine-neighbour-" + refGrid[rowNum][j].toString());
      }
      j++;
    }
    if (j <= width){
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
    while (j <= width && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
      if (rowNum > 0 && refGrid[rowNum - 1][j] === 0 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
        propagate(refGrid, rowNum - 1, j);
      }
      else if (rowNum > 0 && refGrid[rowNum - 1][j] > 0 && refGrid[rowNum - 1][j] < 9 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
        $("tr").eq(rowNum - 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum - 1][j].toString());
      }
      j++;
    }
    j = colNum - 1;
    while( j >= 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
      if (rowNum > 0 && refGrid[rowNum - 1][j] === 0 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
        propagate(refGrid, rowNum - 1, j);
      }
      else if (rowNum > 0 && refGrid[rowNum - 1][j] > 0 && refGrid[rowNum - 1][j] < 9 && $("tr").eq(rowNum - 1).children("td").eq(j).hasClass("unopened")){
        $("tr").eq(rowNum - 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum - 1][j].toString());
      }
      j--;
    }
    
    //test for new scanlines below
    j = colNum;
    while (j <= width && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
      if (rowNum < width && refGrid[rowNum + 1][j] === 0 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
        propagate(refGrid, rowNum + 1, j);
      }
      else if (rowNum < width && refGrid[rowNum + 1][j] > 0 && refGrid[rowNum + 1][j] < 9 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
        $("tr").eq(rowNum + 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum + 1][j].toString());
      }
      j++;
    }
    j = colNum - 1;
    while (j >= 0 && $("tr").eq(rowNum).children("td").eq(j).hasClass("opened")){
      if (rowNum < width && refGrid[rowNum + 1][j] === 0 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
        propagate(refGrid, rowNum + 1, j);
      }
      else if (rowNum < width && refGrid[rowNum + 1][j] > 0 && refGrid[rowNum + 1][j] < 9 && $("tr").eq(rowNum + 1).children("td").eq(j).hasClass("unopened")){
        $("tr").eq(rowNum + 1).children("td").eq(j).removeClass("unopened").addClass("opened").addClass("mine-neighbour-" + refGrid[rowNum + 1][j].toString());
      }
      j--;
    }
    return;
  };
  
  function buildDisplayGrid(){
    var colNum = 0;
    var rowNum = 0;
    for (var i=0; i<gridSize; i++){
      $("table").append("<tr id=" + rowNum.toString() + "></tr>");
      rowNum++;
    };
    for (var i=0; i<gridSize; i++){
      $("tr").append("<td class=\"unopened\" id=" + colNum.toString() +"></td>");
      colNum++;
    };
  };
  
  function buildRefGrid(minesPosition){
    var arr = initRefGrid(gridSize);
    for (var i = 0; i < gridSize; i++){
      for (var j = 0; j < gridSize; j++){
        if (minesPosition.includes(i*gridSize+j)){
          arr[i][j] = "M";
          if (i>0 && arr[i-1][j] !== "M"){
            arr[i-1][j]++;
          }
          if (j>0 && arr[i][j-1] !== "M"){
            arr[i][j-1]++;
          }
          if (i < gridSize-1 && arr[i+1][j] !== "M"){
            arr[i+1][j]++;
          }
          if (j < gridSize-1 && arr[i][j+1] !== "M"){
            arr[i][j+1]++;
          }
          if (i>0 && j<gridSize-1 && arr[i-1][j+1] !== "M"){
            arr[i-1][j+1]++;
          }
          if (i<gridSize-1 && j>0 && arr[i+1][j-1] !== "M"){
            arr[i+1][j-1]++;
          }
          if (i>0 && j>0 && arr[i-1][j-1] !== "M"){
            arr[i-1][j-1]++;
          }
          if (i<gridSize-1 && j<gridSize-1 && arr[i+1][j+1] !== "M"){
            arr[i+1][j+1]++;
          }
        }
      }
    }
    return arr;
  };
  
  function initRefGrid(gridSize){
    var arr = new Array(gridSize);
    for (var i=0; i<gridSize; i++){
      arr[i] = new Array(gridSize);
      for (var j=0; j<gridSize; j++){
        arr[i][j] = 0;
      }
    }
    return arr
  };
  
  function generateMinesPosition(){
    var numList = generateNumSeq(gridSize*gridSize);
    var minesPosition = new Array(minesNumber);
    for (var i = 0; i < minesNumber; i++){
      var index = getRandomInt(0, gridSize*gridSize - i);
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
  
})
