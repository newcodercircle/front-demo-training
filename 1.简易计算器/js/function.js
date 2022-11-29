/**
 * 查询单个元素
 * @param {string} selector 
 * @returns Element | null
 */
function $(selector) {
  return document.querySelector(selector)
}

/**
 * 查询一组元素
 * @param {string} selector 
 * @returns Element[] 返回数组
 */
function $$(selector) {
  return Array.from(document.querySelectorAll(selector))
}