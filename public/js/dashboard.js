Pusher.log = function(message) {
  // if (window.console && window.console.log) {
  //   window.console.log(message);
  // }
};

var isMobile = false;
  
if (navigator){
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);  
}

var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var chartSize = Math.round(w/1000 * 60);

var pusher = new Pusher("9f4941cec42a3ca08efb", {
  cluster: "eu"
});
var apiURL = "https://trainbuzz-api.herokuapp.com";

function numberWithCommas(x) {
 return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$.getJSON(apiURL + "/keywords.json", function(keywords) {
  if (!keywords || keywords.length === 0) {
    console.log("No keywords");
    return;
  }

  var graphContainer = document.querySelector(".graph-container");
  var graphElements = {};
  var graphs = {};

  // Create graph DOM
  _.each(keywords, function(keyword) {
    // Generate graph header
    var graphHeaderElement = document.createElement("h2");
    var totalCountElement = document.createElement('span');
    totalCountElement.className = 'total-count';
    totalCountElement.id = keyword + '_total';
    graphHeaderElement.innerHTML = keyword;
    graphHeaderElement.appendChild(totalCountElement);

    // graphContainer.appendChild(graphHeaderElement);

    // Generate graph element
    var graphElement = document.createElement("div");
    graphElement.classList.add("epoch");
    graphElement.classList.add("brand");
    graphElement.dataset.keyword = keyword;

    graphElements[keyword] = graphElement;

    var row = document.createElement('div');
    row.className = 'row';
    row.appendChild(graphHeaderElement);
    row.appendChild(graphElement);

    // graphContainer.appendChild(graphElement);
    graphContainer.appendChild(row);
  });

  // Create graphs
  _.each(keywords, function(keyword) {
    // Get historic data
    $.getJSON(apiURL + "/stats/" + encodeURIComponent(keyword) + "/24hours.json", function(json) {
      var graphData = {
        // label: keyword,
        values: []
      };

      if (json.data.length > 0) {
        _.each(json.data, function(data) {
          graphData.values.push({
            time: data.time / 1000,
            y: data.value
          });
        });
      } else {
        graphData.values.push({
          time: Date.now() / 1000,
          y: 0
        });
      }

      var graphElement = graphElements[keyword];
      graphs[keyword] = $(graphElement).epoch({
        type: "time.line",
        data: [graphData],
        axes: ["left", "right", "bottom"],
        ticks: {right: 3, left: 3},
        windowSize: chartSize,
        height: graphElement.clientHeight
      });
    });
  })

  var statsChannel = pusher.subscribe("stats");

  var initial = true;

  statsChannel.bind("update", function(data) {
    _.each(data, function(stat, keyword) {
      var graph;
      if (graph = graphs[keyword]) {
        var values = [{
          time: stat.time / 1000,
          y: stat.value
        }];

        graph.push(values);
        
        // update total
        var totalEl = document.getElementById(keyword + '_total' );
        totalEl.innerHTML = 'Past 24 hours total:' + numberWithCommas(stat.allTimeTotal);
        totalEl.setAttribute('data-count', stat.allTimeTotal);
      }
    });

    //Only reorder on first load.
    if (initial){
      var divs = $("div.row");
      var numericallyOrderedDivs = divs.sort(function(a, b) {
        return parseInt($(b).find('.total-count').data('count')) - parseInt($(a).find('.total-count').data('count'));
      });

      if (isMobile){
        numericallyOrderedDivs = numericallyOrderedDivs.slice(0, 10);
      }
      
      $(".graph-container").html(numericallyOrderedDivs);
      initial = false;
    }
    
  });

  

  
});
