// ==UserScript==
// @name        LeekWars Editor Enhancer
// @namespace   LeekWars.Editor
// @description Enhance LeekWars editor
// @include     http://leekwars.com/editor*
// @author			Foudge
// @version     0.1
// @grant       GM_addStyle
// ==/UserScript==

//set styles to dropdown
function setDropDownStyles(select)
{
  //copy styles from new-button
  var new_button = document.getElementById('new-button');
  var styles = getComputedStyle(new_button, null);
  for (var i= styles.length; i-->0;)
  {
    var name= styles[i];
    select.style.setProperty(name,
                             styles.getPropertyValue(name),
                             priority = styles.getPropertyPriority(name)
                            );
  }
  //add or modify 2 styles
  select.style.setProperty('min-width', '160px', null);
  select.style.setProperty('width', 'auto', null);
  select.style.setProperty('text-align', 'left', null);
}

//lazy load dropdown
var lastSelectedIndex = -1;
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
  //search for showed editor div
  var ia_editor = null;
  var editor = document.getElementById('editors');
  for(var i=0; i<editor.children.length; i++)
  {
      if (editor.children[i].style.display != 'none')
      {
        ia_editor = editor.children[i];
        break;
      }
  }
  //search for function name
  var allElements = ia_editor.getElementsByClassName("cm-function");
  if (allElements != null)
  {
    for(var i=0; i<allElements.length; i++)
    {
      //add to dropdown
      o = document.createElement('option');
      o.value = allElements[i].innerHTML;
      o.innerHTML = allElements[i].innerHTML;
      select.appendChild(o);
    }
  }
  //force no item selection
  select.selectedIndex = -1;
}

// set selected function visible
function selectFunction(select)
{
  var index = select.selectedIndex;
  console.log('selectFunction: selected index=' + index);
  if (index == 0)
  {
    document.getElementById('editors').scrollTop = 0;
    return;
  }
  var allElements = document.getElementsByClassName("cm-function");
  for(var i=0; i<allElements.length; i++)
  {
    if (allElements[i].innerHTML == select.options[index].value)
    {
      allElements[i].scrollIntoView(true);
      return;
    }
  }
}

//resize editor height
function resizeEditor()
{
  var editor_height = window.innerHeight - 200;
  var div_editor = document.getElementById('editors');
  div_editor.setAttribute("style", "height:" + editor_height + "px; overflow-y:scroll;");
}

//fix bracket bug (matching brackets not selected) with LeekWars theme
GM_addStyle ( "                                     \
    .CodeMirror-matchingbracket {                   \
        border-bottom: 1px solid #080802;           \
    }                                               \
" );

//hide footer to maximize editor height
var footer = document.getElementById('footer');
footer.setAttribute("style", "display: none;");
//resizing editor height and add vertical scroll
resizeEditor();
window.onresize=function(){ resizeEditor(); };

//wait page loaded (CSS styles must be applied)
window.addEventListener('load', function() {
  //creating dropdown
  var select = document.createElement("select");
  select.id = 'select-function';
  //select.className = 'button';
  setDropDownStyles(select);
  select.onclick = function(){ loadDropDown(this); };
  select.onchange = function(){ selectFunction(this); };

  //appending dropdown
  var toolbar = document.getElementById('buttons');
  toolbar.insertBefore(select, toolbar.firstChild);
}, false);
