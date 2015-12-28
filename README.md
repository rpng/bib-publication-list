## Differences from Original

* Commented source code
* Updated libraries
* Nicer popup
* Different styling (white base)
* Disable search bar by default
* Cleaned source code


## Getting Started

First, load the required JS and CSS files:

```html
<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/bib-list.min.js"></script>
<link href="assets/css/bib-list.min.css" rel="stylesheet" type="text/css" />
```

All you need to do is to include the BibTeX into an HTML page and tell the script to turn it 
into a sortable and searchable table. For example:

```html
<table id="pubTable" class="display"></table>
<pre id="bibtex">
@article{Karavirta:JVLCTaxonomy,
   title = {A comprehensive taxonomy of algorithm animation languages},
   journal = {Journal of Visual Languages \& Computing},
   volume = {20},
   number = {1},
   pages = {1--22},
   year = {2010},
   issn = {1045-926X},
   doi = {DOI: 10.1016/j.jvlc.2009.09.001},
   read_date = {2015-11-13}, // This is optional
   author = {Ville Karavirta and Ari Korhonen and Lauri Malmi and Thomas Naps}
}
</pre>
```

Finally, the bib-publication-list needs to know the input data element and the output table. So, one 
line of JavaScript. Alternatively, the bibtex can be loaded from a file. Personally I prefer including it in the HTML, 
though. This way, browsers without JavaScript enabled get at least to see the bibtex instead of a blank page.
This causes an ugly-looking flash of unstyled content, though.

```javascript
bibtexify("#bibtex", "pubTable");
// Or
bibtexify("example-biblist.bib", "pubTable");
```

If you want to fix the flash of unstyled content, you can hide the #bibtex element and make it
visible when JavaScript is disabled. To do that, add:

```
#bibtex { display: none; } // to css
<noscript><style>#bibtex { display: block; }</style></noscript> // to html
```

## Configuration Options

The bibtexify function accepts an optional third parameter for configuration options. The full list can be seen [here](https://github.com/rpng/bib-publication-list/blob/master/src/bib-publication-list.js#L369-L385) with their defaults. These options include:

<table>
<tbody>
<tr><td>visualization</td><td>A boolean to control addition of the visualization. Defaults to true.</td></tr>
<tr><td>future</td><td>If set to true it will read the `read_date` from the bibtex entry in the format `{YYYY-MM-DD}`. This will be entered in the first column and is great for reading group due dates etc. It is recommended that the visualization is turned off. `{TBA}` can be used to show that the date has yet to be determined. Defaults to false.</td></tr>
<tr><td>tweet</td><td>Twitter username to add Tweet links to bib items with a url field.</td></tr>
<tr><td>sorting</td><td>Control the default sorting of the list. Defaults to `[[0, "desc"], [1, "desc"]]`. See (http://datatables.net/api#fnSort) for details on formatting.</td></tr>
<tr><td>searching</td><td>If true this will display a search bar for users to search for publications. By default this is disabled</td></tr>
<tr><td>defaultYear</td><td>Entries without a year will use this as year. Defaults to "To Appear".
</tbody>
</table>

## Building from Source

There is a Jakefile for building the combined and minified versions with [Jake](https://github.com/mde/jake)
and a Makefile for building with make. Currently uses the [yuicompressor](http://yui.github.io/yuicompressor/) tool to minify both the css and js and output that into the build folder. *(note: the jake file has not been updated to new system)*


## Credits

This code uses some great libraries: [jQuery](http://jquery.com/), [DataTables](http://datatables.net/), [Popup.js](https://github.com/Toddish/Popup), and [JavaScript BibTeX Parser](http://sourceforge.net/projects/jsbibtex/).
