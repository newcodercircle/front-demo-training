;(function(global) {
  /**
   * 单个选择器
   * @param {string} selector 
   * @returns 
   */
  function $(selector) {
    return document.querySelector(selector)
  }
  /**
   * 查找指定的父级节点
   * @param {Element} ele 
   * @param {string} cName 
   * @returns 
   */
  function hasClass (ele, cName) {
    var reg = new RegExp("(?:^| +)" + cName + "(?: +|$)", "g");
    if(ele.className === undefined){
      return false;
    } else {
      return reg.test(ele.className);
    }
  } 

  /**
   * 获取指定的父级节点
   * @param {HTMLElement} element 
   * @param {*} target 
   * @param {*} isClass 
   */
  function getParent(element, target, isClass = true) {
    var parent = element.parentNode
    while (!hasClass(parent, target)) {
      parent = parent.parentNode;
    }
    return parent
  }

  /**
   * 购物车类
   */
  function Shopcar(goodsData = []) {
    // 当前选中的商品
    this.checkGoods = []
    // 后端返回的商品数据
    this.goodsData = goodsData
    this.checkGoodsNumber = {}

    this.shopcarContainer = $("#shopcarContainer")
    this.totalElement = $('#totalPrice')
    this.checkAllinput = $(".action-bar input")
    this.deleteBtn = $("#deleteBtn")
    this.deleteButton = $(".delete-btn");
    this.submit = $(".submit");

    // 当前是否在删除状态下
    this.deleteStatus = false
    this.init()
  }

  /**
   * 初始化购物车
   */
  Shopcar.prototype.init = function () {
    console.log('shopcar init:', this.shopcarContainer)
    this.renderHtml(this.goodsData)
    this.bindEvent()
    this.checkAll()
    this.deleteGoods()
  }
  /**
   * 绑定事件
   */
  Shopcar.prototype.bindEvent = function () {
    var that = this

    function handler(e) {
      console.log("bind event:", e);
      var currentItem = getParent(e.target, "shop-car-item");
      console.log("🚀 ~ file: script.js:55 ~ currentItem", currentItem);
      var id = currentItem.getAttribute("data-id");
      console.log("id", id);
      var targetClass = e.target.className
      if (/check-status/ig.test(targetClass)) {
        that.selectGoods(id);
      }

      if (/reduce/ig.test(targetClass)) {
        that.changeNum(id, "reduce");
      }

      if (/plus/gi.test(targetClass)) {
        that.changeNum(id, "plus");
      }
    }

    this.shopcarContainer.addEventListener("click", handler, false);
    global.onunload = function () {
      that.shopcarContainer.removeEventListener("click", handler, false);
    };
  }
  /**
   * 渲染标签
   * @param {Array} tags 
   * @returns 
   */
  Shopcar.prototype.renderTag = (tags = []) => {
    var html = ''
    for (var i = 0; i < tags.length; i++) {
      html += `<div class="tag-item">${tags[i]}</div>`
    }
    return html
  }
  /**
   * 渲染列表
   * @param {Array} goodsData 
   */
  Shopcar.prototype.renderHtml = function (goodsData = []) {
    var html = ''
    for (var  i = 0; i < goodsData.length; i++) {
      var goods = goodsData[i]
      html += `<div class="shop-car-item" id="goods_${goods.id}" data-id="${
        goods.id
      }">
  <div class="check">
      <input hidden type="checkbox" />
      <i class="iconfont check-status"></i>
  </div>
  <div class="goods-thumb">
      <img src="${goods.goods_thumb}" />
  </div>
  <div class="goods-info">
    <div class="goods-title">${goods.goods_name}</div>
    <div class="goods-tag">
    ${this.renderTag(goods.goods_tags)}
    </div>
    <div class="goods-action">
      <div class="goods-price">
        <div class="origin-price">￥${goods.origin_price}</div>
        <div class="current-price">￥${goods.current_price}</div>
      </div>
      <div class="goods-num">
        <div class="btn reduce">-</div>
        <div class="number">${this.checkGoodsNumber[goods.id] || 1}</div>
        <div class="btn plus">+</div>
      </div>
    </div>
  </div>
</div> 
`;
      this.checkGoodsNumber[goods.id] = this.checkGoodsNumber[goods.id] || 1
    }
    console.log('render html')
    this.shopcarContainer.innerHTML = html
  }
  /**
   * 选择单个商品
   * @param {number} id 
   * @param {boolean} flag 
   */
  Shopcar.prototype.selectGoods = function (id, flag) {
    var checkbox = $('#goods_' + id + ' input')
    var currentStatus = checkbox.getAttribute('checked')
    if (flag === undefined) {
      if (currentStatus) {
        checkbox.removeAttribute("checked");
        this.checkGoods = this.checkGoods.filter(function (good) {
          return good.id !== Number(id);
        });
      } else {
        checkbox.setAttribute("checked", "checked");
        this.checkGoods.push(
          this.goodsData.find(function (good) {
            return good.id === Number(id);
          })
        );
      }
    } else {
      if (!flag) {
        checkbox.removeAttribute("checked");
        this.checkGoods = this.checkGoods.filter(function (good) {
          return good.id !== Number(id);
        });
      } else {
        checkbox.setAttribute("checked", "checked");
        this.checkGoods.push(
          this.goodsData.find(function (good) {
            return good.id === Number(id);
          })
        );
      }
    }
    console.log("select goods: ", this.checkGoods);
    this.checkAllSelected()
    this.total()
  }
  /**
   * 检测是否需要全选
   */
  Shopcar.prototype.checkAllSelected = function () {
    if (this.checkGoods.length === this.goodsData.length) {
      this.checkAllinput.setAttribute('checked', 'checked')
    } else {
      this.checkAllinput.removeAttribute('checked')
    }
  }
  /**
   * 改变数量
   * @param {number} id 
   * @param {string} flag 
   * @returns 
   */
  Shopcar.prototype.changeNum = function (id, flag) {
    var currentItemNumber = $("#goods_" + id + " .number");
    var currentNumber = this.checkGoodsNumber[Number(id)]
    if (flag === 'reduce') {
      currentNumber--;
      if (currentNumber < 0) {
        currentNumber = 0;
        return
      }
    }
    if (flag === 'plus') {
      currentNumber++;
    }
    currentItemNumber.innerHTML = currentNumber
    this.checkGoodsNumber[Number(id)] = currentNumber;
    this.total()
  }
  /**
   * 计算总价
   */
  Shopcar.prototype.total = function () {
    var total = 0
    for (var i = 0; i < this.checkGoods.length; i++) {
      var number = this.checkGoodsNumber[this.checkGoods[i].id]
      total += this.checkGoods[i].current_price * number;
    }
    this.totalElement.innerHTML = total.toFixed(2)
  }
  /**
   * 手动全选
   */
  Shopcar.prototype.checkAll = function () {
    var _this = this;
    function handler (e) {
      console.log(e)
      var currentStatus = _this.checkAllinput.getAttribute("checked");
      if (currentStatus) {
        for (var i = 0; i < _this.goodsData.length; i++) {
          _this.selectGoods(_this.goodsData[i].id, false);
        }
        _this.checkAllinput.removeAttribute("checked");
      } else {
        for (var i = 0; i < _this.goodsData.length; i++) {
          _this.selectGoods(_this.goodsData[i].id, true);
        }
        _this.checkAllinput.setAttribute("checked", "checked");
      }
      
    }
    var checkAllBtn = $(".action-bar .check-status");
    checkAllBtn.addEventListener("click", handler, false);
    console.log("🚀 ~ file: script.js:204 ~ this.checkAllinput", checkAllBtn);
    global.onunload = function () {
     checkAllBtn.removeEventListener("click", handler, false);
    }
  }
  /**
   * 删除列表中的数据
   */
  Shopcar.prototype.deleteGoods = function () {
    const that = this
    function handler() {
      if (!that.deleteStatus) {
        that.deleteBtn.innerHTML = "取消";
        that.deleteStatus = true;
        that.deleteButton.style.display = 'block';
        that.submit.style.display = 'none';
      } else {
        that.deleteBtn.innerHTML = "操作";
        that.deleteStatus = false;
        that.deleteButton.style.display = 'none';
        that.submit.style.display = "block";
      }
    }

    function deleteHandler() {
      var ids = that.checkGoods.map(function (item) {
        return item.id
      });
      var goodsData = that.goodsData.filter(function (goods) {
        return !ids.includes(goods.id)
      })
      that.renderHtml(goodsData)
    }

    this.deleteBtn.addEventListener('click', handler, false)
    this.deleteButton.addEventListener('click', deleteHandler, false)

    global.onunload = function () {
      that.deleteBtn.removeEventListener("click", handler, false);
      that.deleteButton.removeEventListener("click", deleteHandler, false);
    }
  }

  // 导出购物车类
  global.Shopcar = Shopcar
})(window)