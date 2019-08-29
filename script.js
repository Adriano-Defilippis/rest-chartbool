function init() {

    var buttonAdd = $('#addSale');
    getApiData();

    buttonAdd.click(function(){
      registerNewSale();

    });
}

$(document).ready(init);


function getApiData (){

  $.ajax({

    url: "http://157.230.17.132:4003/sales",
    method: "GET",

    success: function(data){
      console.log(data);

      if ($('#selectsalesman').empty() && $('#selectmonth').empty()) {
        templateAddSales(getsalesman(data), getMonth());
      }

      getChart(data);
      getChartTorta(data)
    },
    error: function(){
      alert("Errore caricamento dati api")
    }
  });
}



function getMonth(){

  var months = moment.months();

  return months
}

function templateAddSales(arrSalesman, arrMonth){

  var source = $('#option-template').html();
  var template = Handlebars.compile(source);

  for (var i = 0; i < arrSalesman.length; i++) {
    var salesMan = arrSalesman[i];

    var context = {
      option: salesMan
    };
    var html = template(context);

      $('#selectsalesman').append(html);
  }

  for (var j = 0; j < arrMonth.length; j++) {
    var month = arrMonth[j];

    var context = {
      option: month
    };
    var html = template(context);
    // $('#selectmonth').child().remove();

      $('#selectmonth').append(html);
  }
}


function calcolovenditepermese(data){

  var arrmonthvendite = new Array(12).fill(0);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var amount = parseInt(d.amount);
    var month = moment(d.date, "DD-MM-YYYY").month();

    arrmonthvendite[month] += amount;
  }
  console.log(arrmonthvendite);
  return arrmonthvendite
}


function getChart(data){
  var remove = $('#myChart').children().remove();
  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: getMonth(),
        datasets: [{
            label: 'My First dataset',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: calcolovenditepermese(data),

        }]
    },

    // Configuration options go here
    options: {}
});
}

function getChartTorta(data){
  var remove = $('#myChartTorta').children().remove();
  var ctx = document.getElementById('myChartTorta').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'pie',

    // The data for our dataset
    data: {
        labels: getsalesman(data),
        datasets: [{
            label: 'My First dataset',
            backgroundColor: ['rgb(255, 99, 132)',
                              'rgb(255, 88, 547)',
                              'yellow',
                              'lightblue',
                              'lightgreen',
                              'lightpink',
                              'lightgrey',
                              'lightbrown',
                              'orange',
                              'blue',
                              'grey',
                              'green'],
            borderColor: 'rgb(255, 99, 132)',
            data: calcVendAnnualiPerAgente(data),



        }]
    },

    // Configuration options go here
    options: {

    }
});
}

function getsalesman(data){

  var arrsalesman = [];

  for (var i = 0; i < data.length; i++) {
    var d = data[i];

    if (!arrsalesman.includes(d.salesman)) {
        arrsalesman.push(d.salesman);
    }

  }

  console.log("arrsalesman: ", arrsalesman);
  return arrsalesman
}




function calcVendAnnualiPerAgente(data){

  var salesmans = getsalesman(data);
  var arrTotAmount = new Array(salesmans.length).fill(0);
  var fatTotale = 0;

  // console.log("salesman in funzione esterna", salesman);

  for (var i = 0; i < salesmans.length; i++) {


    var salesMan = salesmans[i];

    console.log("salesman esterno:", salesMan);

    for (var j = 0; j < data.length; j++) {
      var d = data[j];

      if (d.salesman === salesMan) {

        arrTotAmount[i] += parseInt(d.amount);
      }

      fatTotale += parseInt(d.amount);
    }

    arrTotAmount[i] = Math.ceil((arrTotAmount[i] * 100) / fatTotale) * 2;
    console.log("OBJ:", arrTotAmount);
  }
  console.log("FATTURATO TOTALE");
  console.log(fatTotale);
  return arrTotAmount;
  }



function registerNewSale(){

  var salesName = $('select#selectsalesman').find(":selected").text();
  var salesValue = parseInt($('input[type=text][name=valsales]').val());

  console.log("VAOLORE INPUT AMOUNT: ", salesValue );

  var month = $('select#selectmonth').find(":selected").text();

  $.ajax({
    url: "http://157.230.17.132:4003/sales",
    method: "POST",

    data: {
      salesman: salesName,
      amount: Number(salesValue),
      // date: "15-"+month+"-2017"
      date: "01/"+monthToNumber(month)+"/2017"
    },
    success: function(){

      getApiData();
    },
    error: function(){
      alert('Errore chiamata Post')
    }
  });

}

function monthToNumber(nameMonth){

  var arrMontName = getMonth();

  for (var i = 0; i < arrMontName.length; i++) {
    var name = arrMontName[i]

    if (name === nameMonth) {

      var numberToMonth = i+1;
      var strnamemonth = numberToMonth.toString();
      console.log("numberToMonth.length", strnamemonth.length);
      if (strnamemonth.length === 1) {
        strnamemonth = "0" + strnamemonth
      }

      return strnamemonth
    }
  }
}
