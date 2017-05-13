/**
  FF4Z8W6K14KX - for tabs draggable but need to implement css desigb
  use moment.js for time display
  --next is reminder support
  third is use tray or browser window aka frame = false
  to display notification none the less..
  
  --update found cool tab design ==codepen.io
  http://codepen.io/iprodev/pen/yygvPx?editors=0010
  
  --tab design FF5ATD7P0U35
  --tab design updated for performance FF6EOOT4CV0M
  
*/

const {BrowserWindow} = require('electron').remote
const app = require('electron').remote.app

//support downloading
function download() {
 let webviews = document.querySelectorAll('webview');
 [].forEach.call(webviews, (webview) => {
   console.log(webview)
  webview.getWebContents().session.on('will-download', (event, item, webContents) => {

    console.log(event, item, webContents)
    // Set the save path, making Electron not to prompt a save dialog.
    item.setSavePath(app.getPath('downloads'))

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
 })
}


// easier log
function log(message, flag = "l") {
  if(flag == "l") console.log(message);
  if(flag == "i") console.info(message);
  if(flag == "w") console.warn(message);
  if(flag == "e") console.error(message);
}

// open nav bar from menu btn for small screen --responsive 
function openNav() {
    var x = document.getElementById("small-nav");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
}
// --allNav = all navigation so does means all contents for --allContents that has webview tag aka website eg google
var allNav = document.querySelectorAll('[data-tab]');
var title = document.querySelector('title');
var allContent = document.querySelectorAll('.webview-holder > [data-content]');
var allWebView = document.querySelectorAll('webview');
var urlBar = document.querySelector('.local-url')
var allSmallTabs = document.querySelectorAll('[data-small-tab]')
var urlBarTabs = document.querySelectorAll('.tabs .tab')

// for all small tabs if clicked hide nav --allSmallTabs
allSmallTabs.forEach(function(c, i) {
    allSmallTabs[i].addEventListener('click', ()=>{
        let x = document.querySelector('#small-nav')
        x.classList.remove('w3-show')
    }
    )
})

// form a webview if user clicks a external link open it in a new BrowserWindow included up top
allWebView.forEach(function(c, i) {
    allWebView[i].addEventListener('new-window', (e)=>{
        const protocol = require('url').parse(e.url).protocol
        if (protocol === 'http:' || protocol === 'https:') {

          appendTabAndWebview(e, e.url)
            /*var win = new BrowserWindow({
                width: 900,
                height: 1000
            })
            win.loadURL(e.url)*/
        }
    }
    )
})

// when this Desktop App is opened the first tab and its
// contents must be visible ao user donot have to click on something at start plesant experience
allNav[0].classList.add('active');
allContent[0].classList.add('content-active');
urlBarTabs[0].classList.add('show-tab')
allWebView[0].addEventListener('did-start-loading', ()=>{
    urlBar.value = allWebView[0].getAttribute('src')
})

// Check for which tabs to show
function tabControl(tabClicked = document.querySelector('a.active').getAttribute('title')) {
  let tabs = document.querySelectorAll('.tabs .tab');
  [].forEach.call(tabs, function(tab) {
    if (tabClicked != null) {
      tabClicked = tabClicked.toLowerCase()
      let tabFor = tab.getAttribute('data-content').toLowerCase()
      if (tabFor == tabClicked) {
          tab.classList.add('show-tab');
      } else {
          tab.classList.remove('show-tab')
      }
    }
  })
}

/*
 this function reponds when user clicks a tab 
 it updated the menubar to tab open
 ex Quick Class - [Whatever opened]
 when it adds active class to whatever clicked
 also makes visible the the webview clicked for thereof
 the goes ahead to update url address bar
 then check if you can navigate forwards or not 
 if so function below will handle later
 but if not add disabled class so it looks faded
*/
function tabClick() {
    var currentUrl
    title.innerText = "Quick Class - " + this.title;
    var t = this.title;
    let tabClicked;

    allNav.forEach(function(c, i) {
        allNav[i].classList.remove('active');
    });

    allContent.forEach(function(c, i) {
        allContent[i].classList.remove('content-active');
    });
    allContent.forEach(function(c, i) {
        var tabName = t.toLowerCase();
        var contentName = allContent[i].getAttribute('data-content');
        contentName = contentName.toLowerCase();

        if (tabName == contentName) {
            tabClicked = tabName
            var wv = allContent[i].querySelector('webview')
            currentUrl = wv.getAttribute('src')
            allContent[i].classList.add('content-active');
        }
    });

    tabControl(tabClicked)

    this.classList.add('active');
    var activeTab = document.querySelector('.active');
    urlBar.value = currentUrl;
    checkControl()
}

// call function tabClick() whenever a tab is clicked
allNav.forEach(function(c, i) {
    allNav[i].addEventListener('click', tabClick);
});

/* 
  meanwhile when window loads
  get two element webview and it indicator
  when window loads show/make visible the indicator
  when done loading stop the indicator
  and also check for navigation 
*/
window.onload = ()=>{
    const webview = document.querySelectorAll('webview')
    const indicator = document.querySelector('.indicator')

    const loadstart = ()=>{
        indicator.classList.add('show')
        checkControl()
    }

    const loadstop = ()=>{
        indicator.classList.remove('show')
        checkControl()
    }

    webview.forEach(function(c, i) {
        webview[i].addEventListener('did-start-loading', loadstart)
        webview[i].addEventListener('did-stop-loading', loadstop)
        webview[i].addEventListener('did-get-redirect-request', checkControl)
    })
    checkControl()
}

// loader here loading screen along with ES6 Custom Element Feature
class loader extends HTMLElement {
    constructor() {
        super();
        var shadow = this.attachShadow({
            mode: 'open'
        });
        var style = document.createElement('style');
        style.innerText = 'loader-one,loader-two,loader-three{display:inline-block;margin:5px;width:30px;height:30px;border-radius:50%;;transition:all 2s ease-in-out;}loader-one{background-color:#00af00;margin-left:13px;animation:bounce1 2s ease-in-out infinite;}loader-two{background-color: #1c448c;animation: bounce2 2s ease-in-out infinite;}loader-three {background-color: #dd3100;animation: bounce3 2s ease-in-out infinite;}@keyframes bounce1 {0%, 33.32%, 100% { }16.66% {transform: translateY(-40px);}}@keyframes bounce2 {0%, 64.88%, 100% {}48.66% {transform: translateY(-40px);}}@keyframes bounce3 {0%, 64.88%, 100% { }81.1% {transform: translateY(-40px);}}';

        shadow.appendChild(style);

        var loaderOne = document.createElement('loader-one');
        var loaderTwo = document.createElement('loader-two');
        var loaderThree = document.createElement('loader-three');

        shadow.appendChild(loaderOne);
        shadow.appendChild(loaderTwo);
        shadow.appendChild(loaderThree);

    }
}

/*
  we created class formally custom element constructor
  when our loading loader lives up above
  and so now register the loader element as 
  `loading-message`
 */
customElements.define('loading-message', loader);

// Navigation
let arrowLeft = document.querySelector('.arrow-left')
let arrowRight = document.querySelector('.arrow-right')
let reloadBtn = document.querySelector('.reload')
// if cannot go back add disabled class that has pointer events none so when clicked
// Nothing would happen

arrowLeft.addEventListener('click', goBack)
arrowRight.addEventListener('click', goForward)
reloadBtn.addEventListener('click', reload)

function goBack() {
    // do stuff when click back
    let activeTab = document.querySelector('div.content-active')
    let activeWebview = activeTab.querySelector('webview')
    if (activeWebview.canGoBack()) {
        activeWebview.goBack()
    }
}

function goForward() {
    // do stuff when clicked forwards
    let activeTab = document.querySelector('div.content-active')
    let activeWebview = activeTab.querySelector('webview')
    if (activeWebview.canGoForward()) {
        activeWebview.goForward()
    }
}

function reload() {
  //do stuff with reload tab
  let activeTab = document.querySelector('div.content-active')
  let activeWebview = activeTab.querySelector('webview')
  activeWebview.reload()
}

function checkGoForward() {
  let activeTab = document.querySelector('div.content-active')
  let activeWebview = activeTab.querySelector('webview')
  if (!activeWebview.canGoForward()) {
      arrowRight.classList.add('disabled')
  } else {
      arrowRight.classList.remove('disabled')
  }
}

function checkGoBack() {
    let activeTab = document.querySelector('.content-active')
    let activeWebview = activeTab.querySelector('webview')
    if (!activeWebview.canGoBack()) {
        arrowLeft.classList.add('disabled')
    } else {
        arrowLeft.classList.remove('disabled')
    }
}

// just check for both
function checkControl() {
    checkGoForward()
    checkGoBack()
}

function loadRequestedUrl() {
    let searchTemplateUrl = "https://www.google.com/#safe=strict&q="
    let query = document.querySelector('.local-url').value
    let activeTab = document.querySelector('.content-active')
    let activeWebview = activeTab.querySelector('webview')
    var isUrl = false
    if (query.match(/https:\/\/|http:\/\//gmi) != null) {
        isUrl = true
    }
    if (query.match(/\w*\.\w*/gmi) != null) {
        isUrl = true
    }

    if (isUrl) {
        activeWebview.src = query
    }

    if (!isUrl) {
        let url = searchTemplateUrl + query
        activeWebview.src = url
    }
}

urlBar.addEventListener('keypress', (event)=>{
  if (event.key == "Enter") {
      loadRequestedUrl()
  }
})

function tabTitleNormalize() {
    let titles = document.querySelectorAll('.tab .title');
    [].forEach.call(titles, (title)=>{
        if (title.innerText.length > 8) {
            let ut = title.innerText.substring(0, 8)
            title.innerText = ut;
        }
    }
    )
}

let tabs = document.querySelector('.tabbed .tabs')

function createTab(id) {
    // we have problem/not really need to fix New Tab so that
    // it appends ti span with title classs
    if(id <= 7) {
      console.error('id provided must be more than 7')
      return false;
    }
    let div = document.createElement('div')
    div.classList.add('tab')
    div.classList.add('active')
    div.setAttribute('draggable', 'true')
    div.setAttribute('data-id', id)
    let dc = document.querySelector('.content-active')
    let dataContent = dc.getAttribute('data-content')
    div.setAttribute('data-content', dataContent)
    let titleSpan = document.createElement('span')
    titleSpan.classList.add('title')
    titleSpan.textContent = 'New Tab'
    div.appendChild(titleSpan)
    let closeSpan = document.createElement('span')
    closeSpan.innerHTML = '&times;'
    div.appendChild(closeSpan)
    return div
}

function createWebview(id, url = null) {
  if(id <= 7) {
    console.error('id provieded must be greater than 7')
    return false;
  }
  let webview = document.createElement('webview')
  webview.setAttribute('data-id', id)

  if(url != null) {
     webview.setAttribute('src', url)
  } else {  
    webview.setAttribute('src', 'https://www.google.com/') 
  }
  
  webview.setAttribute('autoresize', '')
  return webview
}

let minTab = 8
function makeTabWebview(e, url = null) {
  let elements = {}
  elements.tab = createTab(minTab)
  
  if(url != null) {
    elements.webview = createWebview(minTab, url)
  } else {
    elements.webview = createWebview(minTab)
  }
  
  elements.id = minTab
  minTab++
  return elements
}

/*
 * we have four functions 
 * createTab()
 * createWebview()
 * deleteTabAndWebview()
 * makeTabWebview()
 * makeTabWebview will return tab and webview elements as objects
 * create a function so that puts them to the position automaticaaly
 */

function appendTabAndWebview(e, url = null) {
  let both = makeTabWebview()

  if(url != null) {
     both = makeTabWebview(e, url)
  } 
    
  let activeTab = document.querySelector('.tabbed .tabs')
  let activeDiv = document.querySelector('.webview-holder .content-active')
  let currentTab = activeDiv.getAttribute('data-content')
  let allTabs = document.querySelectorAll('.tab[data-content="' + currentTab + '"]');
  [].forEach.call(allTabs, (tab) => {
    tab.classList.remove('active')
  })

  both.webview.addEventListener('click', changeTab)

  activeTab.appendChild(both.tab)
  activeDiv.appendChild(both.webview)
  tabControl()
  tabAddEV()
  dragAndDropHandler()
  tabsUrlBar()
  addFixTitle()

  let createdTab = document.querySelector('.tab[data-id="' + both.id + '"]')
  createdTab.click()
}

// function that responds to click on a tab
function changeTab() {
  let tabs = document.querySelectorAll('.tabs .tab');
  [].forEach.call(tabs, (tab) => {
    tab.classList.remove('active')
  })
  this.classList.add('active')
}

function tabAddEV() {
  var tabs = document.querySelectorAll('.tabs .tab');
  [].forEach.call(tabs, (tab) => {
    tab.addEventListener('click', changeTab)
    tab.addEventListener('click', handleUrlBarTab)
  })
  var closeTab = document.querySelectorAll('.tab span:nth-child(2)');
  [].forEach.call(closeTab, (tab) => {
    tab.addEventListener('click', deleteTabAndWebview)
  })
}

// add eventlistener to all tabs 
tabAddEV()

// fix long title text 
tabTitleNormalize()

// fix for css conflict so when top-menu opens tabs has padding-left of 190px 
var quickClassMenu = document.querySelector('.w3-dropdown-hover')
quickClassMenu.addEventListener('mouseenter', () => {
  let tabs = document.querySelector('.tabs')
  tabs.style.paddingLeft = "190px"
})

quickClassMenu.addEventListener('mouseleave', () => {
  let tabs = document.querySelector('.tabs')
  tabs.style.paddingLeft = "26px"
})


/// Added code done w3schools that allow you you drag and drop tabs!!

//\\\\ not quite working to fix it
document.addEventListener("DOMContentLoaded", dragAndDropHandler);

function dragAndDropHandler() {
  /* tabs js starts here fun stuff */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function(tabElement, tab) {
    tabs[tab].addEventListener('dragstart', tabDragStart, false);
    tabs[tab].addEventListener('dragover', tabDragOver, false);
    tabs[tab].addEventListener('drop', tabDrop, false);
  })

  // you can call the parameter anything although
  // convention is to call it 'e'
  var dragTabSrc = null;
  function tabDragStart(e) {
    this.click();
    dragTabSrc = this;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function tabDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move'; 
    this.click();

    return false;
  }


  function tabDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragTabSrc != this) {
      // Set the source column's HTML to the HTML of the column we dropped on.
      dragTabSrc.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html');
    }

    return false;
  }
}

function handleOpenTab() {
  let tabFor = this.title
  let tab = document.querySelector('.tab[data-content="' + tabFor + '"]')
  let tabId = tab.getAttribute('data-id')
  let allTabs = document.querySelectorAll('.tab[data-content="' + tabFor + '"]')
  let hasOneActive = false;
  let tabForWebviewHolder = document.querySelector('.webview-holder div[data-content="' + tabFor + '"]');
  let allWebviews = tabForWebviewHolder.querySelectorAll('webview');

  [].forEach.call(allTabs, (tab) => {
    if(tab.classList.contains('active')) {
      hasOneActive = true;
    }
  })

  if(!hasOneActive) {
    allTabs[0].classList.add('active')
    allWebviews[0].classList.remove('hide-webview')
  }

  let webview = document.querySelector('webview[data-id="' + tabId + '"]')
}

[].forEach.call(allNav, (nav) => {
  nav.addEventListener('click', handleOpenTab)
});

[].forEach.call(allSmallTabs, (tabs) => {
  tabs.addEventListener('click', handleOpenTab)
})

function handleUrlBarTab() {
  let tabId = this.getAttribute('data-id')
  let allWebviews = document.querySelectorAll('webview');
  [].forEach.call(allWebviews, (webview) => {
    webview.classList.add('hide-webview')
  })
  // if the tab is deleted while clicked
  try {
    let webview = document.querySelector('webview[data-id="' + tabId + '"]')
    webview.classList.remove('hide-webview')
  }
  catch(e) {
    
  }

}

let firstWebview = document.querySelector('webview[data-id="1"]')
firstWebview.click()

var newTab = document.querySelector('.add-tab')
newTab.addEventListener('click', appendTabAndWebview)

function deleteTabAndWebview() {
  let tab = this.parentElement;
  let tabId = tab.getAttribute('data-id')
  let tabFor = tab.getAttribute('data-content')
  let nextTab = document.querySelector('.tab[data-content="' + tabFor +'"]')
  let webview = document.querySelector('webview[data-id="'+ tabId +'"]')
  nextTab.click()
  tab.remove()
  webview.remove()
  normalizeDeleteTab(tabFor)
}

function normalizeDeleteTab(dataContent) {
  var tab = document.querySelector('.tab[data-content="' + dataContent + '"')

  if(tab != null) {
    let tabId = tab.getAttribute('data-id')
    let webview = document.querySelector('webview[data-id="' + tabId + '"]')
    
    webview.classList.remove('hide-webview')
    tab.classList.add('active')

    // when other function removes it this will add it 
    setTimeout(() => {
      tab.classList.add('active')
      webview.classList.remove('hide-webview')
    }, 50)
  }
}

function tabsUrlBar() {
  let webviews = document.querySelectorAll('webview');
  [].forEach.call(webviews, (webview) => {
    webview.addEventListener('load-commit', updateUrlBar)
    webview.addEventListener('did-get-response-details', d)
    function updateUrlBar(e) {
      if(!this.classList.contains('hide-webview')) {
        let urlBar = document.querySelector('.local-url')
        urlBar.value = this.getURL()
      }
    }

    function d(e) {
      //console.log(e)
    }
  })
}
tabsUrlBar()

function fixTitle() {
  let title = this.getTitle();
  let id = this.getAttribute('data-id')
  let webview = document.querySelector('.tab[data-id="' + id + '"]')
  let newTitle = webview.querySelector('span.title')
  newTitle.innerText = title
  tabTitleNormalize()
}

function addFixTitle() {
  let webviews = document.querySelectorAll('webview');
  [].forEach.call(webviews, (webview) => {
    webview.addEventListener('page-title-updated', fixTitle)
  })
}
addFixTitle()