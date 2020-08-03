export const error = (err, val) => {
  let message = ''
  let cVal = val === 'course' ? '课程' : '知识'
  if (err && err.error && err.error.key) {
    switch (err.error.key) {
      case 'apis.kng.knowledge.NotExist':
        message = `当前${cVal}不存在或以被删除`
        break
      case 'apis.kng.knowledge.validation.is.hidden':
        message = `当前${cVal}已隐藏`
        break
      case 'apis.kng.knowledge.validation.has.remove':
        message = `当前${cVal}已下架`
        break
      case 'apis.kng.knowledge.validation.has.not.approved':
        message = `当前${cVal}未审核通过`
        break
      case 'apis.kng.knowledge.validation.has.not.permission':
        message = `您没有查看当前${cVal}}的权限`
        break
      case 'apis.kng.knowledge.validation.is.being.transcoded':
        message = `当前${cVal}还在转码中`
        break
      case 'apis.kng.knowledge.validation.has.expired':
        message = `当前${cVal}已过期`
        break
      default:
        message = err.error.key
        break
    }
    return message
  } else {
    return err
  }
}
