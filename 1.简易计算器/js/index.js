;(function(global) {
  // 每个操作标识符对应的实际操作符号
  var actionMap = {
    clear: ['clear'],
    minusSign: ['-', '+'],
    point: ['%', '%'],
    divide: ['÷', '/'],
    multiplication: ['×', '*'],
    subtraction: ['-', '-'],
    addition: ['+', '+'],
    dot: ['.'],
    equal: ['=', '=']
  }
  var symbol = {"+":"+","-":"-","×":"*","÷":"/","%":"/100","=":"="};

  // 获取最外层的输入区域容器，用于事件绑定
  var inputBlock = $('#inputBlock')
  // 当前输入
  var currentNumberLine = $('.current-number')
  // 表达式显示区域
  var calcLine = $('.calc-line')
  // 历史记录
  var historyWrapper = $('#historyWrapper')
  // 历史记录容器
  var historyContainer = $('.history-container')
  // 历史记录按钮
  var historyIcon = $('.history')
  // 当前展示的数据
  var current = []
  // 当前表达式
  var calcLineText = []
  // 是否需要重置输入区域
  var needRest = false
  // 当前表达式是否已经是计算过的结果
  var isDoEqual = false
  
  // locakstore key
  var saveKey = '__CALC_HISTORY__'
  // 历史记录操作
  var history = {
    save(calcLine, current) {
      var _list = this.list() || []
      _list.push({
        calcLine,
        current
      })
      window.localStorage.setItem(saveKey, JSON.stringify(_list))
    },
    list() {
      var _list = window.localStorage.getItem(saveKey)
      return _list ? JSON.parse(_list) : []
    },
    clear() {
      window.localStorage.removeItem(saveKey)
    }
  }

  /**
   * 初始化
   */
  function initEvent() {
    inputBlock.addEventListener('click', itemClickHandler, false)

    // 切换历史记录显示隐藏
    historyIcon.addEventListener('click', toggleHistory)
  }

  /**
   * 渲染历史记录
   */
  function renderHistory() {
    var _list = history.list().reverse()
    var fragment = document.createDocumentFragment()

    // 给每行绑定一个事件
    function itemClick(calcLine, currentText) {
      calcLineText = calcLine
      current = currentText
      setCurrentNumber()
      setCalcLine()
      toggleHistory()

      // 把当前状态置为输入中并已经得出结果
      needRest = true
      isDoEqual = true
    }
    for (var i = 0; i < _list.length; i ++) {
      var item = _list[i]
      var li = document.createElement('li')
      li.className = 'history-item'
      var text = item.calcLine.join('') + '=' + item.current.join('')
      li.innerHTML = text
      // 利用闭包来传递参数
      ;(function (item) {
        li.addEventListener('click', () => {
          itemClick(item.calcLine, item.current)
        }, false)
      })(item)
      fragment.appendChild(li)
    }
    historyWrapper.innerHTML = ''
    historyWrapper.appendChild(fragment)
  }

  /**
   * 显示/隐藏历史记录面板
   */
  function toggleHistory() {
    if (historyContainer.className.includes('hidden')) {
      historyContainer.className = 'history-container show'
      renderHistory()
    } else {
      historyContainer.className = 'history-container hidden'
    }
  }

  /**
   * 显示当前输入
   * @param {string | number} text 
   */
  function setCurrentNumber() {
    var text = current.join('')
    currentNumberLine.innerHTML = text
  }

  /**
   * 显示表达式
   */
  function setCalcLine() {
    var text = calcLineText.join('')
    calcLine.innerHTML = text
  }

  /**
   * 组装表达式
   * @param {string} text 
   */
  function computedCalc(text, isDoEqual) {
    // 不能先有计算符号
    if (!calcLineText.length && !current.length) return
    // 不能连续的计算符号
    if (Object.keys(symbol).includes(calcLineText[calcLineText.length - 1]) && !current.length) return
    var _current = current
    current = []
    var pushData = []
    if (!isDoEqual) { // 没有计算过，直接加入
      pushData.push(..._current)
    } else { // 计算过把结果赋予表达式
      calcLineText = _current
    }
    pushData.push(text)
    calcLineText.push(...pushData)
    setCalcLine()
    // 重置状态
    isDoEqual = needRest = false
  }

  /**
   * 最后参与计算的表达式处理
   */
  function calcTextHandler(text) {
    var res = ''
    
    for (var i = 0; i < text.length; i++) {
      const t = text.charAt(i)
      if (Object.prototype.hasOwnProperty.call(symbol, t)) {
        res += symbol[t]
      } else {
        res += t
      }
    }
    return res
  }

  /**
   * 计算表达式最后的值
   */
  function calcFinal() {
    // 组装完整的表达式
    // calcLineText.push(...current)
    if (isDoEqual) return
    computedCalc()
    var text = calcLineText.join('')
    var calcText = calcTextHandler(text)
    var totalNum = 0
    try {
      totalNum = eval(calcText)
    } catch (e) {
      console.log(e)
      // 计算错误直接赋值结果 0
      totalNum = 0
    }
    current.push(totalNum)
    history.save(calcLineText, current)
    needRest = true
    isDoEqual = true
  }

  /**
   * 重置
   */
  function reset() {
    current = []
    calcLineText = []
    setCalcLine()
    setCurrentNumber()
    // 重置清除标识
    needRest = false
    isDoEqual = false
  }

  /**
   * 点击事件实际处理
   * @param {MouseEvent} e 
   */
  function itemClickHandler(e) {
    const target = e.target
    const action = target.getAttribute('data-action')
    switch (action) {
      // 处理清除
      case 'clear':
        reset()
        break
      // 处理负号
      case 'minusSign': 
        if (isDoEqual) {
          reset()
        }
        var _action = actionMap[action]
        // 字符时，已经存在时
        if (current[0] === _action[0]) {
          current.shift()
        } else if (current[0] < 0) {
          current[0] = Math.abs(current[0])
        } else {
          current.unshift(_action[0])
        }
        break
      // 处理百分号
      case 'point':
        current.push(actionMap[action][0])
        break
      // 处理四则运算
      case 'divide':
      case 'multiplication':
      case 'subtraction':
      case 'addition':
        var item = actionMap[action]
        computedCalc(item[0], isDoEqual)
        break
      // 处理小数点
      case 'dot':
        if (current[current.length - 1] === actionMap['dot'][0] || current.includes(actionMap['dot'][0])) {
          break
        }
        if (!current.length) {
          current.push('0')
        }
        current.push(actionMap['dot'][0])
        break
      // 处理等于
      case 'equal':
        calcFinal()
        break
      // 处理数字输入
      default: 
        if (needRest) {
          reset()
        }
        if (action === '0' && current[0] === '0') {
          break
        }
        current.push(action)
        isDoEqual = false
    }
    setCurrentNumber()
  }

  initEvent()
})(window)