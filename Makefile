RM = rm -rf
LIB = lib
MINIMIZE_JS = java -jar tools/yuicompressor-2.4.6.jar --nomunge --preserve-semi -o $(TARGET)/js/bib-list.min.js  $(TARGET)/js/bib-list.js
MINIMIZE_CSS = java -jar tools/yuicompressor-2.4.6.jar -o $(TARGET)/css/bib-list.min.css  $(TARGET)/css/bib-list.css
CAT = cat
SRC = src
TARGET = build
SOURCES_JS = $(LIB)/js/BibTex-0.1.2.js $(LIB)/js/jquery.dataTables.js $(LIB)/js/moment.js $(LIB)/js/jquery.popup.js $(SRC)/bib-publication-list.js
SOURCES_CSS = $(LIB)/css/jquery.dataTables.css $(LIB)/css/popup.css $(SRC)/bib-publication-list.css

all: build

clean:
	$(RM) build/*

build: $(TARGET)/bib-list.js minimize_js $(TARGET)/bib-list.css minimize_css


###############################
# Compile JS Files
###############################

$(TARGET)/bib-list.js: $(SOURCES_JS)
	-mkdir -p $(TARGET)/js
	$(CAT) $(SOURCES_JS) > $(TARGET)/js/bib-list.js

minimize_js: $(TARGET)/bib-list.min.js

$(TARGET)/bib-list.min.js: $(SOURCES_JS)
	$(MINIMIZE_JS)


###############################
# Compile CSS Files
###############################

$(TARGET)/bib-list.css: $(SOURCES_CSS)
	-mkdir -p $(TARGET)/css
	$(CAT) $(SOURCES_CSS) > $(TARGET)/css/bib-list.css

minimize_css: $(TARGET)/bib-list.min.css

$(TARGET)/bib-list.min.css: $(SOURCES_CSS)
	$(MINIMIZE_CSS)
