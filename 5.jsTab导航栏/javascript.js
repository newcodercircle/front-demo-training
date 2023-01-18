;(function(global) {
  /**
   * 单个选择器
   * @param {string} selector
   * @returns
   */
  function $(selector) {
    return document.querySelector(selector);
  }

  let screenWidth = document.body.clientWidth;

  /**
   * 单个选择器
   * @param {string} selector
   * @returns
   */
  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function Tab(options) {
    var defaultOptions = {
      wrap: ".tab-container",
      container: "#container",
      item: ".tab-item",
    };
    this.options = {...defaultOptions, ...options}
    this.container = $(this.options.container)
    this.wrap = $(this.options.wrap)
    this.items = $$(this.options.item)
    this.itemInfo = []
    this.containerWidth = 0
    this.init()
  }

  Tab.prototype.init = function() {
    this.getItemInfo()
    this.initStyle()
    this.initEvent()
  }
  Tab.prototype.getItemInfo = function () {
    Array.from(this.items).forEach((item, index) => {
      var reactInfo = item.getBoundingClientRect()
      this.itemInfo[index] = {
        width: reactInfo.width,
        left: reactInfo.left,
        x: reactInfo.x
      }
    });
    console.log(this.itemInfo);
  }
  Tab.prototype.initStyle = function() {
    var totalWidth = this.itemInfo.map(item => item.width).reduce(function(prev, current){
      return prev + current
    }, 0)
    this.containerWidth =(totalWidth + 32)
    this.container.style.width = this.containerWidth + "px";
  }
  Tab.prototype.computedMoveLeft = function(activeLeft = 0, activeWidth = 0) {
    console.log(activeLeft, activeWidth)
     // 获取到当前点击元素的 offsetLeft  - 包裹盒子 offsetWidth 的一半 + 当前点击元素 offsetWidth 的一半
    var scrollLeftNum = activeLeft - screenWidth / 2 + activeWidth / 2; 
    console.log(scrollLeftNum,'距离')
    this.wrap.scrollTo({
      left: scrollLeftNum,
      top: 0,
      behavior: 'smooth'
    });
  }
  Tab.prototype.initEvent = function () {
    var _this = this
    function handler(e) {
      var target = e.target
      console.log(target)
      if (target.className.includes('tab-item')) {
        var index = target.getAttribute('data-index')
        console.log(index)
        _this.items.forEach(item => {
          item.classList.remove('active')
        })
        target.classList.add('active')
        _this.computedMoveLeft(target.offsetLeft, target.offsetWidth);
      }
    }
    this.container.addEventListener("click", handler, false);
    global.onunload = function () {
      this.container.reomveEventListener('click', handler)
    }
  }

  global.Tab = Tab;
})(window)