// ==UserScript==
// @name        LeekWars Editor Enhancer
// @namespace   LeekWars.Editor
// @description Enhance LeekWars editor
// @include     http://leekwars.com/editor*
// @author			Foudge
// @version     0.2.0
// @grant       GM_addStyle
// ==/UserScript==

//set current theme styles to element
function setThemeStyles(element)
{
  //copy styles from new-button
  var new_button = document.getElementById('new-button');
  var styles = getComputedStyle(new_button, null);
  for (var i = styles.length; i-- > 0; )
  {
    var name = styles[i];
    element.style.setProperty(name, styles.getPropertyValue(name), priority = styles.getPropertyPriority(name));
  }
}

//search for showed editor div
function getEditorElement()
{
  var editors = document.getElementById('editors');
  for (var i = 0; i < editors.children.length; i++)
  {
    if (editors.children[i].style.display != 'none')
    {
      return editors.children[i];
    }
  }
  return null;
}

//lazy load dropdown
var lastSelectedIndex = - 1;
function loadDropDown(select)
{
  //is it a dropdown or a item selection ?
  if (select.options.length > 0 && select.selectedIndex != lastSelectedIndex)
  {
    lastSelectedIndex = select.selectedIndex;
    return;
  }
  //clear options
  if (select.options.length > 0)
    select.options.length = 0;
  //first empty item (=top of code)
  var o = document.createElement('option');
  o.value = '';
  o.innerHTML = '';
  select.appendChild(o);
  var ia_editor = getEditorElement();
  //search for function name list
  var allElements = ia_editor.getElementsByClassName('cm-function');
  if (allElements != null)
  {
    for (var i = 0; i < allElements.length; i++)
    {
      //add option to dropdown
      o = document.createElement('option');
      o.value = allElements[i].innerHTML;
      o.innerHTML = allElements[i].innerHTML;
      select.appendChild(o);
    }
  }
  //force no item selection
  select.selectedIndex = - 1;
}

// set selected function visible
function selectFunction(select)
{
  var index = select.selectedIndex;
  //first item = top of code
  if (index == 0)
  {
    document.getElementById('editors').scrollTop = 0;
    return;
  }
  var allElements = document.getElementsByClassName('cm-function');
  for (var i = 0; i < allElements.length; i++)
  {
    if (allElements[i].innerHTML == select.options[index].value)
    {
      allElements[i].scrollIntoView(true);
      return;
    }
  }
}

//resize editor
function resizeEditor()
{
  var div_editor = document.getElementById('editors');
  //on limite la hauteur de l'éditeur pour qu'il soit entièrement visible (pas d'ascensseur vertical sur le navigateur)
  var editor_height = (window.innerHeight - 200) + 'px';
  //si 'page' fait moins de 1242 pixels, il faut compenser l'ajout de l'ascenseur vertical au niveau de l'éditeur
  var page = document.getElementById('page');
  if (page.clientWidth < 1242)
  {
    editor_width = (page.clientWidth - 160) + 'px';
  } 
  else
  {
    editor_width = 'auto'; //valeur par défaut de la propriété width
  }
  div_editor.setAttribute('style', 'height:' + editor_height + '; width:' + editor_width + '; overflow-y:scroll;');
}

//search text inside editor
var lastEditor = null;
var lastSearchedText = null;
var searchResults = [];
var currentResultIndex = -1;
function searchText(text)
{
  var editor = getEditorElement();
  //do new search if new text or new editor
  if (text != lastSearchedText || editor != lastEditor)
  {
    lastEditor = editor;
    lastSearchedText = text;
    searchResults = [];
    currentResultIndex = -1;
    //get all editor elements and search for text
    var spans = editor.getElementsByTagName('span');
    for (var i=0; i<spans.length; i++)
    {
      if (spans[i].innerHTML.indexOf(text) != -1)
        searchResults.push(spans[i]);
    }
    //show first result or unselect all if not found
    if (searchResults.length > 0)
    {
      currentResultIndex = 0;
      showResultIndex(0);
    }
    else
    {
      removeSelections();
    }
  }
  else if (searchResults.length > 0)
  {
    //select next result
    currentResultIndex++;
    if (currentResultIndex >= searchResults.length)
      currentResultIndex = 0;
    showResultIndex(currentResultIndex);
  }
}

//select and show the desired result
function showResultIndex(index)
{
  removeSelections();
  selectTextElement(searchResults[index]);
  searchResults[index].scrollIntoView(true);
}

//select content's element
function selectTextElement(element)
{
  var range, selection;
  if (document.body.createTextRange)
  {
    range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  }
  else if (window.getSelection)
  {
    selection = window.getSelection();        
    range = document.createRange();
    range.selectNodeContents(element);
    selection.addRange(range);
  }
}

//unselect all
function removeSelections()
{
		if (document.selection)
      document.selection.empty();
		else if (window.getSelection)
      window.getSelection().removeAllRanges();
}

//fix bracket bug (matching brackets not selected) with LeekWars theme
GM_addStyle('.CodeMirror-matchingbracket {\
  border-bottom:\
  1px solid #080802;\
}');
//hide footer to maximize editor height
var footer = document.getElementById('footer');
footer.setAttribute('style', 'display: none;');

//wait page loaded (CSS styles must be applied)
window.addEventListener('load', function () {
  //resizing editor height and add vertical scroll
  resizeEditor();
  window.onresize = function () { resizeEditor(); };
  //creating dropdown
  var select = document.createElement('select');
  setThemeStyles(select);
  select.style.setProperty('min-width', '120px', null);
  select.style.setProperty('width', 'auto', null);
  select.style.setProperty('text-align', 'left', null);
  select.id = 'select-function';
  select.onclick = function () { loadDropDown(this); };
  select.onchange = function () { selectFunction(this); };
  //creating textarea
  var textarea = document.createElement('textarea');
  setThemeStyles(textarea);
  textarea.style.setProperty('cursor', 'text', null);
  textarea.style.setProperty('text-align', 'left', null);
  textarea.style.setProperty('width', '120px', null);
  textarea.style.setProperty('margin-right', '1px', null);
  textarea.id = 'search-text';
  //creating next-button
  var next_button = document.createElement('button');
  setThemeStyles(next_button);
  next_button.style.setProperty('margin-left', '1px', null);
  next_button.style.setProperty('width', '4px', null);
  next_button.id = 'next-result-button';
  next_button.innerHTML = '\u25BC';
  next_button.onclick = function () { searchText(textarea.value); };
  //appending new elements
  var toolbar = document.getElementById('buttons');
  toolbar.insertBefore(next_button, toolbar.firstChild);
  toolbar.insertBefore(textarea, toolbar.firstChild);
  toolbar.insertBefore(select, toolbar.firstChild);
}, false);
