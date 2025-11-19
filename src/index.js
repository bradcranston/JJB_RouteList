//Here we're importing items we'll need. You can add other imports here.

import { TabulatorFull as Tabulator } from "tabulator-tables";

window.loadData = (json) => {
//define some sample data
const tabledata = JSON.parse(json) ;

// Filter data to show only one row per unique customer number and use SizeDisplayFinal
const uniqueCustomers = new Map();
const filteredData = [];

tabledata.forEach(obj => {
  const custNo = obj.fieldData.CustomerNo;
  if (!uniqueCustomers.has(custNo)) {
    uniqueCustomers.set(custNo, obj);
    filteredData.push(obj);
  }
});

let counter = 1;

filteredData.forEach(obj => {

      // Assign the sequential number to Sequence field
      obj.id = counter;
      // Increment the counter for the next object
      counter++;
});

//dumpster icon
const dumpsterIcon = function(cell, formatterParams, onRendered){ //plain text value
  return "<i class='fa-solid fa-dumpster'></i>";
};

//go to function
const goToRecord = function(data){ //plain text value
//console.log(data.getRow().getData());
result = data.getRow().getData();
result.mode = "goToRecord";
FileMaker.PerformScript("Manage: Route wv", JSON.stringify(result));
};

//create Tabulator on DOM element with id "example-table"
const table = new Tabulator("#example-table", {
  height: 650, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
  data: filteredData, //assign filtered data to table
  layout: "fitColumns", //fit columns to width of table (optional)
  groupBy:"fieldData.Route",
  initialSort:[
    {column:"fieldData.Route", dir:"asc"}, //sort by this first
    {column:"fieldData.Sequence", dir:"asc"}, //then sort by this second
  ],
  movableRows: true, //enable user movable rows
  rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
  columns: [
    //Define Table Columns
    { title: "Cust No", field: "fieldData.CustomerNo", headerSort:false },
    { title: "Cust Name", field: "fieldData.CustomerName", headerSort:false },
    {formatter:dumpsterIcon, width:40, hozAlign:"center", cellClick:function(e, cell){goToRecord(cell)}, headerSort:false},
    { title: "Street1", field: "fieldData.AddrServ_Street1", headerSort:false },
    { title: "Street2", field: "fieldData.AddrServ_Street2", headerSort:false },
    { title: "Municipality", field: "fieldData.AddrServ_Municipality", headerSort:false },
    { title: "Size", field: "fieldData.SizeDisplayFinal", sorter: "number", headerSort:false},
    { title: "Day", field: "fieldData.Day", headerSort:false },
    { title: "Route", field: "fieldData.Route", headerSort:false },
    { title: "Sequence", field: "fieldData.Sequence", sorter: "number", headerSort:false, editor:"number" },
  ],
});

table.on("rowMoved", function(row){
  //row - row component
  nextRow = row.getNextRow().getData().fieldData.Sequence;
  prevRow = row.getPrevRow().getData().fieldData.Sequence;
  curRow = row.getData().fieldData.__ID;
  index = row.getIndex();
  currentData = row.getData();
newValue = prevRow + ((nextRow-prevRow)/2);

table.updateData([{id:index, fieldData:{...currentData.fieldData,Sequence:newValue}}]);

  result = {
    nextRow:nextRow,
    prevRow:prevRow,
    curRow:curRow,
    newValue:newValue,
    index:index
  };
  console.log(row.getData());
  callFM(result);
});

table.on("cellEdited", function(cell){
  //check if the edited cell is the Sequence field
  if(cell.getField() === "fieldData.Sequence"){
    const row = cell.getRow();
    const currentData = row.getData();
    const newSequenceValue = cell.getValue();
    
    result = {
      curRow: currentData.fieldData.__ID,
      newValue: newSequenceValue,
      index: row.getIndex(),
      mode: "sequenceEdit"
    };
    console.log("Sequence edited:", result);
    callFM(result);
  }
});

window.callFM = (result) => {
  //console.log(result.getData());
  result.mode = "sortUpdate";
  FileMaker.PerformScript("Manage: Route wv", JSON.stringify(result));
};

}