
var bibtexify = (function($) {
  // Helper function to "compile" LaTeX special characters to HTML
  var htmlify = function(str) {
    // TODO: this is probably not a complete list..
    str = str.replace(/\\"\{a\}/g, '&auml;')
            .replace(/\{\\aa\}/g, '&aring;')
            .replace(/\\aa\{\}/g, '&aring;')
            .replace(/\\"a/g, '&auml;')
            .replace(/\\"\{o\}/g, '&ouml;')
            .replace(/\\'e/g, '&eacute;')
            .replace(/\\'\{e\}/g, '&eacute;')
            .replace(/\\'a/g, '&aacute;')
            .replace(/\\'A/g, '&Aacute;')
            .replace(/\\"o/g, '&ouml;')
            .replace(/\\ss\{\}/g, '&szlig;')
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/\\&/g, '&')
            .replace(/--/g, '&ndash;');
    return str;
  };
  var uriencode = function(str) {
    // TODO: this is probably not a complete list..
    str = str.replace(/\\"\{a\}/g, '%C3%A4')
          .replace(/\{\\aa\}/g, '%C3%A5')
          .replace(/\\aa\{\}/g, '%C3%A5')
          .replace(/\\"a/g, '%C3%A4')
          .replace(/\\"\{o\}/g, '%C3%B6')
          .replace(/\\'e/g, '%C3%A9')
          .replace(/\\'\{e\}/g, '%C3%A9')
          .replace(/\\'a/g, '%C3%A1')
          .replace(/\\'A/g, '%C3%81')
          .replace(/\\"o/g, '%C3%B6')
          .replace(/\\ss\{\}/g, '%C3%9F')
          .replace(/\{/g, '')
          .replace(/\}/g, '')
          .replace(/\\&/g, '%26')
          .replace(/--/g, '%E2%80%93');
    return str;
  };
  // Helper functions to turn a single bibtex entry into HTML
  var bib2html = {
    // the main function which turns the entry into HTML
    entry2html: function(entryData, bib) {
      // Get our entry type
      var type = entryData.entryType.toLowerCase();
      // Default to type misc if type is unknown
      if(array_keys(bib2html).indexOf(type) === -1) {
        type = 'misc';
        entryData.entryType = type;
      }
      // Call the render function of our type, and get the rendered publication
      var itemStr = htmlify(bib2html[type](entryData));
      // Add our bib entry modal and link
      itemStr += bib2html.bibtex(entryData);
      // Add our link contents
      itemStr += bib2html.links(entryData);
      // If we have tweet enabled, and the bib entry has a url, add the tweet option
      if (bib.options.tweet && entryData.url) {
        itemStr += bib2html.tweet(entryData, bib);
      }
      // Return the string with the undefined entries marked as red
      // This would happen if the bib entry is missing information
      return itemStr.replace(/undefined/g, '<span class="undefined">missing<\/span>');
    },
    // Converts the given author data into HTML
    authors2html: function(authorData) {
      var authorsStr = '';
      for (var index = 0; index < authorData.length; index++) {
        if (index > 0)
          authorsStr += ", ";
        authorsStr += authorData[index].last;
      }
      return htmlify(authorsStr);
    },
    // Adds links to the PDF or url of the item
    links: function(entryData) {
      var itemStr = '';
      if (entryData.url && entryData.url.match(/.*\.pdf/)) {
        itemStr += ' (<a title="PDF-version of this article" href="' + entryData.url + '">pdf<\/a>)';
      } else if (entryData.url) {
        itemStr += ' (<a title="This article online" href="' + entryData.url + '">link<\/a>)';
      }
      return itemStr;
    },
    // Adds the bibtex link and the opening div with bibtex content
    bibtex: function(entryData) {
      var itemStr = '';
      itemStr += ' (<a title="This article as BibTeX" href="#" class="biblink">' + 'bib</a>)<div class="bibinfo hidden">';
      itemStr += '<pre>';
      itemStr += '@' + entryData.entryType + "{" + entryData.cite + ",\n";
      $.each(entryData, function(key, value) {
        if (key == 'author') {
          itemStr += '  author = { ';
          for (var index = 0; index < value.length; index++) {
            if (index > 0) { itemStr += " and "; }
            itemStr += value[index].last;
          }
          itemStr += ' },\n';
        } else if (key != 'entryType' && key != 'cite') {
          itemStr += '  ' + key + " = { " + value + " },\n";
        }
      });
      itemStr += "}</pre></div>";
      return itemStr;
    },
    // Generates the twitter link for the entry
    tweet: function(entryData, bib) {
      // url, via, text
      var itemStr = ' (<a title="Tweet this article" href="http://twitter.com/share?url=';
      itemStr += entryData.url;
      itemStr += '&via=' + bib.options.tweet;
      itemStr += '&text=';
      var splitName = function(wholeName) {
        var spl = wholeName.split(' ');
        return spl[spl.length-1];
      };
      var auth = entryData.author;
      if (auth.length == 1) {
        itemStr += uriencode(splitName(auth[0].last));
      } else if (auth.length == 2) {
        itemStr += uriencode(splitName(auth[0].last) + "%26" + splitName(auth[1].last));
      } else {
        itemStr += uriencode(splitName(auth[0].last) + " et al");
      }
      itemStr += ": " + encodeURIComponent('"' + entryData.title + '"');
      itemStr += '" target="_blank">tweet</a>)';
      return itemStr;
    },
    // Helper functions for formatting different types of bibtex entries
    inproceedings: function(entryData) {
      return this.authors2html(entryData.author)+", \""+entryData.title+",\" In <em>" +
              entryData.booktitle + "<\/em>, " + ((entryData.month)?entryData.month.toMonthEntry() + ", ":"") +
              entryData.year + ((entryData.address)?", " + entryData.address+"":"") +
              ((entryData.pages)?", pp. " + entryData.pages+"":"") + "." ;
    },
    article: function(entryData) {
      return this.authors2html(entryData.author) + ", \"" + entryData.title + ",\" <em>" +
              entryData.journal+"<\/em>" + ((entryData.volume)?", Vol. " + entryData.volume+"":"") +
              ((entryData.number)?"("+entryData.number+")":"") + ((entryData.pages)?", pp. " +
              entryData.pages:"") + ((entryData.address)?", " + entryData.address:"") +
              ((entryData.month)?", " + entryData.month.toMonthEntry() + ", ":", ") + entryData.year + ".";
    },
    misc: function(entryData) {
      return this.authors2html(entryData.author) + " (" + entryData.year + "). " +
              entryData.title + ". " +
              ((entryData.howpublished)?entryData.howpublished + ". ":"") +
              ((entryData.note)?entryData.note + ".":"");
    },
    mastersthesis: function(entryData) {
      return this.authors2html(entryData.author) + ", \"" + entryData.title + ",\" " +
              ((entryData.entryType=="phdthesis")?" Ph.D. dissertation":" M.S. thesis") +
              ((entryData.organization)?", " + entryData.organization + ", ":", ") + entryData.school +
              ((entryData.month)?", " + entryData.month.toMonthEntry() + ", ":", ") + entryData.year + ".";
    },
    techreport: function(entryData) {
      return this.authors2html(entryData.author) + ",\" " + entryData.title + ",\" " + entryData.institution +
              ((entryData.month)?", " + entryData.month.toMonthEntry() + ", ":", ") + entryData.year + ".";
    },
    book: function(entryData) {
      return this.authors2html(entryData.author) + ", <em>" + entryData.title + "<\/em>, " +
              entryData.publisher + ", " + entryData.year + ((entryData.issn)?", ISBN: " + entryData.issn + ".":".");
    },
    inbook: function(entryData) {
      return this.authors2html(entryData.author) + ", \"" + entryData.chapter +
              "\" in <em>" + entryData.title + "<\/em>, " +
              ((entryData.editor)?"Edited by " + entryData.editor + ", ":"") +
              entryData.publisher + ", pp. " + entryData.pages + ", " +
              ((entryData.series)?"<em>" + entryData.series + "<\/em>, ":"") +
              ((entryData.volume)?"Vol. " + entryData.volume + ", ":"") +
              ((entryData.month)?entryData.month.toMonthEntry() + ", ":"") +
              entryData.year + ((entryData.issn)?", ISBN: " + entryData.issn + ".":".");
    },
    incollection: function(entryData) {
      return this.authors2html(entryData.author) + ", in <em>" + entryData.title + "<\/em>, " +
              ((entryData.editor)?"Edited by " + entryData.editor + ", ":"") +
              entryData.publisher + ", pp. " + entryData.pages + ", " +
              ((entryData.series)?"<em>" + entryData.series + "<\/em>, ":"") +
              ((entryData.volume)?"Vol. " + entryData.volume + ", ":"") +
              ((entryData.month)?entryData.month.toMonthEntry() + ", ":"") +
              entryData.year + ((entryData.issn)?", ISBN: " + entryData.issn + ".":".");
    },
    // Weights of the different types of entries; used when sorting
    importance: {
      'misc': 0,
      'manual': 10,
      'techreport': 20,
      'mastersthesis': 30,
      'inproceedings': 40,
      'incollection': 50,
      'proceedings': 60,
      'conference': 70,
      'article': 80,
      'phdthesis': 90,
      'inbook': 100,
      'book': 110,
      'unpublished': 120
    },
    // Labels used for the different types of entries
    labels: {
      'article': 'Journal',
      'book': 'Book',
      'conference': 'Conference',
      'inbook': 'Book Chapter',
      'incollection': 'Book Chapter',
      'inproceedings': 'Conference',
      'manual': 'Manual',
      'mastersthesis': 'M.S. Thesis',
      'misc': 'Misc',
      'phdthesis': 'Ph.D. Thesis',
      'proceedings': 'Conference proceeding',
      'techreport': 'Technical report',
      'unpublished': 'Unpublished'
    }
  };
  // Format a phd thesis similarly to masters thesis
  bib2html.phdthesis = bib2html.mastersthesis;
  // Conference is the same as inproceedings
  bib2html.conference = bib2html.inproceedings;

  // Our master prototype object
  var Bib2HTML = function(data, $pubTable, options) {
    this.options = options;
    this.$pubTable = $pubTable;
    this.stats = { };
    this.initialize(data);
  };

  // Define our prototype
  var bibproto = Bib2HTML.prototype;

  // The initialization function
  // We take our bib data, parse it and handle creating our data table
  // And the bar graph for visualization
  bibproto.initialize = function initialize(data) {
    // Parese our data using the "BibTex-0.1.2" plugin
    var bibtex = new BibTex();
    bibtex.content = data;
    bibtex.parse();
    // Our data
    var bibentries = [];
    var len = bibtex.data.length;
    var entryTypes = {};
    // Merge bib2html options with our current ones recursively
    jQuery.extend(true, bib2html, this.options.bib2html);
    // Loop through each bib entry
    for (var index = 0; index < len; index++) {
      // Our bib entry
      var item = bibtex.data[index];
      // If we do not have a year, default it to "To Appear"
      if (!item.year) {
        item.year = this.options.defaultYear || "To Appear";
      }
      // Convert the entry to html using our parser
      var html = bib2html.entry2html(item, this);
      // Add to our bib entry array
      if (!this.options.future) {
        bibentries.push([item.year, bib2html.labels[item.entryType], html]);
      } else {
        // If the date is not defined, set as invalid
        if(typeof item.read_date == 'undefined' || item.read_date == "TBD")
          bibentries.push(["To Be Determined", item.year, bib2html.labels[item.entryType], html]);
        else {
          // Parse date
          var date = moment(item.read_date);
          // Add color/bold if date has not past
          var date_str = (date.isAfter(moment()))? "<strong style='color:#FF4136;'>" + date.format('LL') + "<\/strong>" : date.format('LL');
          // Append to our entry list
          bibentries.push([date_str, item.year, bib2html.labels[item.entryType], html]);
        }
      }
      // Add our entry types so we know what to sort by
      entryTypes[bib2html.labels[item.entryType]] = item.entryType;
      // Update our legend stats
      this.updateStats(item);
    }
    // Define how to sort asc'ing for the "type" column
    jQuery.fn.dataTableExt.oSort['type-sort-asc'] = function(x, y) {
      var item1 = bib2html.importance[entryTypes[x]];
      var item2 = bib2html.importance[entryTypes[y]];
      // Based on our weights, return which one should be listed before
      return ((item1 < item2) ? -1 : ((item1 > item2) ?  1 : 0));
    };
    // Define how to sort desc'ing for the "type" column
    jQuery.fn.dataTableExt.oSort['type-sort-desc'] = function(x, y) {
      var item1 = bib2html.importance[entryTypes[x]];
      var item2 = bib2html.importance[entryTypes[y]];
      // Based on our weights, return which one should be listed before
      return ((item1 < item2) ? 1 : ((item1 > item2) ?  -1 : 0));
    };
    // Define how to sort asc'ing for the "date" column
    jQuery.fn.dataTableExt.oSort['date-sort-asc'] = function(x, y) {
      var item1 = new moment($(x).text(), 'LL');
      var item2 = new moment($(y).text(), 'LL');
      // Check if date is valid entry
      if(!item1.isValid() || !item2.isValid())
        return (!item1.isValid() && !item2.isValid()) ? 0 : (!item1.isValid()) ? -1 : 1;
      // Based on our weights, return which one should be listed before
      return ((item1.isBefore(item2)) ? -1 : (item1 == item2) ?  0 : 1);
    };
    // Define how to sort desc'ing for the "date" column
    jQuery.fn.dataTableExt.oSort['date-sort-desc'] = function(x, y) {
      var item1 = new moment($(x).text(), 'LL');
      var item2 = new moment($(y).text(), 'LL');
      // Check if date is valid entry
      if(!item1.isValid() || !item2.isValid())
        return (!item1.isValid() && !item2.isValid()) ? 0 : (!item1.isValid()) ? 1 : -1;
      // Based on our weights, return which one should be listed before
      return ((item1.isBefore(item2)) ? 1 : (item1 == item2) ?  0 : -1);
    };
    // If we are not doing future entries, render the normal table
    if (!this.options.future) {
      // Define our data table, and created it
      var table = this.$pubTable.dataTable({
        'aaData': bibentries,
        'aaSorting': this.options.sorting,
        'searching': this.options.searching,
        'aoColumns': [
          {"sTitle": "Year", "orderDataSince": 1},
          {"sTitle": "Type", "sType": "type-sort", "asSorting": ["desc", "asc"]},
          {"sTitle": "Publication", "bSortable": false}
        ],
        "columnDefs": [
          {"targets": 0, "sClass": "center"},
          {"targets": 1, "sClass": "center"}
        ],
        'bPaginate': true,
        'bLengthChange': false,
        'pageLength': this.options.max_pagination
      });
    } else {
      // Define our data table, and created it
      var table = this.$pubTable.dataTable({
        'aaData': bibentries,
        'aaSorting': this.options.sorting,
        'searching': this.options.searching,
        'aoColumns': [
          {"sTitle": "Read By", "orderDataSince": 1, "sType": "date-sort", "asSorting": ["desc", "asc"]},
          {"sTitle": "Year", "orderDataSince": 2},
          {"sTitle": "Type", "sType": "type-sort", "asSorting": ["desc", "asc"]},
          {"sTitle": "Publication", "bSortable": false}
        ],
        "columnDefs": [
          {"targets": 0, "sClass": "center", "width": "15%"},
          {"targets": 1, "sClass": "center"},
          {"targets": 2, "sClass": "center"}
        ],
        'bPaginate': true,
        'bLengthChange': false,
        'pageLength': this.options.max_pagination
      });
    }
    // If we have visualization enabled, append the barchart
    if (this.options.visualization) {
      this.addBarChart();
    }
    // Enable popup using "Popup.js" plugin
    // This will display the bib entry in pre tags
    $('#'+this.options.id+' .biblink').popup({
      content : function(){
        return $(this.ele).next(".bibinfo").html();
      }
    });
  };
  // Updates the stats, called whenever a new bibtex entry is parsed
  bibproto.updateStats = function updateStats(item) {
    if (!this.stats[item.year]) {
      this.stats[item.year] = { 'count': 1, 'types': {} };
      this.stats[item.year].types[item.entryType] = 1;
    } else {
      this.stats[item.year].count += 1;
      if (this.stats[item.year].types[item.entryType]) {
        this.stats[item.year].types[item.entryType] += 1;
      } else {
        this.stats[item.year].types[item.entryType] = 1;
      }
    }
  };
  // Adds the barchart of year and publication types
  // This is rendered of the stats that where generated when bib entries where added
  bibproto.addBarChart = function addBarChart() {
    var yearstats = [], max = 0;
    $.each(this.stats, function(key, value) {
      max = Math.max(max, value.count);
      yearstats.push({'year': key, 'count': value.count,
        'item': value, 'types': value.types});
    });
    yearstats.sort(function(a, b) {
      var diff = a.year - b.year;
      if (!isNaN(diff)) {
        return diff;
      } else if (a.year < b.year) {
        return -1;
      } else if (a.year > b.year) {
        return 1;
      }
      return 0;
    });
    var chartIdSelector = "#" + this.$pubTable[0].id + "pubchart";
    var pubHeight = $(chartIdSelector).height()/max - 2;
    var numYears = Math.min(yearstats.length,this.options.max_year);
    var styleStr = chartIdSelector +" .year { width: " +
          (100.0/numYears) + "%; }" +
          chartIdSelector + " .pub { height: " + pubHeight + "px; }";
    var legendTypes = [];
    var stats2html = function(item) {
      var types = [];
      var str = '<div class="year">';
      var sum = 0;
      $.each(item.types, function(type, value) {
        types.push(type);
        sum += value;
      });
      types.sort(function(x, y) {
        return bib2html.importance[y] - bib2html.importance[x];
      });
      str += '<div class="filler" style="height:' + ((pubHeight+2)*(max-sum)) + 'px;"></div>';
      for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (legendTypes.indexOf(type) === -1) {
          legendTypes.push(type);
        }
        for (var j = 0; j < item.types[type]; j++) {
          str += '<div class="pub ' + type + '"></div>';
        }
      }
      return str + '<div class="yearlabel">' + item.year + '</div></div>';
    };
    var statsHtml = "<style>" + styleStr + "</style>";
    // Loop from min year to the latest year
    for (var i = yearstats.length-numYears; i < yearstats.length; i++) {
      statsHtml += stats2html(yearstats[i]);
    }
    var legendHtml = '<div class="legend">';
    for (var i = 0, l = legendTypes.length; i < l; i++) {
      var legend = legendTypes[i];
      legendHtml += '<span class="pub ' + legend + '"></span>' + bib2html.labels[legend];
    }
    legendHtml += '</div>';
    $(chartIdSelector).html(statsHtml).after(legendHtml);
  };
  // Small helper function that allows capitalization of the months
  // Call using "string".toMonthEntry();
  // Also removes the "#" concat string that is usually added
  String.prototype.toMonthEntry = function() {
    var str = this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
    return str.replace(/#/g, "");
  }
  // Creates a new publication list to the HTML element with ID
  // bibElemId. The bibsrc can be
  //   - a jQuery selector, in which case html of the element is used
  //     as the bibtex data
  //   - a URL, which is loaded and used as data. Note, that same-origin
  //     policy restricts where you can load the data.
  // Supported options:
  //   - visualization: A boolean to control addition of the visualization.
  //                    Defaults to true.
  //   - tweet: Twitter username to add Tweet links to bib items with a url field.
  //   - sorting: Control the default sorting of the list. Defaults to [[0, "desc"],
  //              [1, "desc"]]. See http://datatables.net/api fnSort for details
  //              on formatting.
  //   - bib2html: Can be used to override any of the functions or properties of
  //               the bib2html object. See above, starting around line 40.
  //  - defaultYear: String of the default year if a year is not provided in the bib
  //                 entry. Default is "To Appear".
  return function(bibsrc, bibElemId, opts) {
    // Set our default options if not defined
    var options = $.extend({}, {
      'id': bibElemId,
      'visualization': true,
      'searching': false,
      'future': false,
      'max_year': 10,
      "max_pagination": 20,
      'sorting': [[0, "desc"], [1, "desc"]]
    }, opts);
    // Add our master class to the table
    var $pubTable = $("#" + bibElemId).addClass("bibtable");
    // If we have visualization append that barchart div above the table
    if (options.visualization) {
      $pubTable.before('<div id="' + bibElemId + 'pubchart" class="bibchart"></div>');
    }
    // Our element
    var $bib_elm;
    // Try to find the element in the DOM
    try {
      // Get our src from html or url
      $bib_elm = $(bibsrc);
    } catch ($exception) {
      // We have an error, it must be a url
      $bib_elm = null;
    }
    // If true, we found an element, use its HTML as bibtex
    if ($bib_elm && $bib_elm.length) {
      new Bib2HTML($bib_elm.html(), $pubTable, options);
      $bib_elm.hide();
    }
    else {
      // Else we assume it is a URL
      $.ajax({
        method: "GET",
        url: bibsrc
      }).done(function( data ) {
        new Bib2HTML(data, $pubTable, options);
      });
    }
  };
})(jQuery);