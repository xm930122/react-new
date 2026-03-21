/**
 * 虚拟滚动类
 * @param {HTMLElement} container - 滚动容器元素
 * @param {Array} items - 数据源数组
 * @param {Function} rowRenderer - 渲染单行内容的函数 (index, data) => HTMLElement
 * @param {number} itemHeight - 单行固定高度
 */

class VirtualScroller {
  constructor(container, items, rowRender, itemHeight = 50, buffer = 5) {
    this.container = container; // 滚动容器高度
    this.items = items; // 数据总数
    this.rowRender = rowRender; // 每一行数据渲染function
    this.itemHeight = itemHeight; // 每行数据高度
    // 缓冲区域，防止滚动过快白屏
    this.buffer = buffer;
    this.totalHeight = items.length * itemHeight; // 占位总高度

    this._initDOM();
    this._bindEvents(); // 滚动监听
    this._update(); // 初始渲染
  }
  // 1、初始化DOM结构
  _initDOM() {
    // 创建占位层：用于撑开滚动
    this.phantom = document.createElement("div");
    this.phantom.style.position = "absolute";
    this.phantom.style.left = "0";
    this.phantom.style.top = "0";
    this.phantom.style.width = "100%";
    this.phantom.style.zIndex = "-1";

    // 创建内容层：用于渲染实际可见的DOM
    this.content = document.createElement("div");
    this.content.style.position = "abdolute";
    this.content.style.left = "0";
    this.content.style.top = "0";
    this.content.style.width = "100%";
    // 使用transform便宜偏移，开启GPU加速，避免重排
    this.content.style.transform = "translateZ(0)";

    this.container.appendChild(this.phantom);
    this.container.appendChild(this.content);
  }
  // 2、绑定滚动事件
  _bindEvents() {
    // 使用requestAnimationFrame进行节流，保证滚动流畅
    let ticking = false;
    this.container.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this._update();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  // 3、更新核心逻辑
  _update() {
    const scrollTop = this.container.scrollTop; // 当前滚动距离
    const containerHeight = this.container.clientHeight; // 窗口高度
    const visibleCount = Math.ceil(containerHeight / this.itemHeight); // 可视区域元素的个数
    let startIndex = Math.floor(scrollTop / this.itemHeight); // 开始索引
    const renderStart = Math.max(0, startIndex - this.buffer); // 考虑缓冲区，向前多渲染buffer个
    // 结束索引：向后多渲染buffer个
    const renderEnd = Math.min(
      this.items.length,
      startIndex + visibleCount + this.buffer,
    );
    // 更新dom
    // 1、更新占位层高度：撑开滚动
    this.phantom.style.height = `${this.totalHeight}px`;
    // 2、渲染可视区域内数据
    this._renderRows(renderStart, renderEnd);
    // 3、偏移内容层：让渲染出来的内容出现正确的视觉位置
    // 偏移量 = 起始索引 * 行高
    const offset = renderStart * this.itemHeight;
    this.content.style.transform = `translateY(${offset}px)`;
  }
  // 渲染具体行
  _renderRows(start, end) {
    // 清空当前内容
    this.content.innerHTML = "";
    // 创建documentFragement片段
    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
      const itemData = this.items[i];
      const node = this.rowRender(i, itemData);
      // 确保节点高度正确
      node.style.height = `${this.itemHeight}px`;
      fragment.appendChild(node);
    }
    this.content.appendChild(fragment);
  }
}
