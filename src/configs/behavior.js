const method = {
  visit: '000', // 访问
  add: '001', // 增
  delete: '002', // 删
  modify: '003', // 改
  select: '004' // 查
}

const description = {
  Single: 'Single', // 单个操作对象
  List: 'List' // 批量操作对象
}

export const vcodes = {
  app_home: '000000000',
  app_course: '000000001',
  app_my: '000000002'
}
/*
  target对应页面编号(vcode)，可省略(子路由不配置vcode会默认取父路由vcode)
*/
export const logMap = {
  search: {
    target: vcodes.app_home,
    method: method.search,
    description: description.list,
    logcontent: '搜索'
  }
}
